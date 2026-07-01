import type {
  AssetCandidate,
  DesignSummary,
  FigmaComponentMeta,
  FigmaFileResponse,
  FigmaNode,
  FigmaNodesResponse,
  FigmaPaint,
  SimplifiedNode,
  UsedComponent,
} from "./types.js"

const SVG_TYPES = new Set(["VECTOR", "BOOLEAN_OPERATION", "STAR", "LINE", "ELLIPSE", "REGULAR_POLYGON"])

type ExtractState = {
  components: Record<string, FigmaComponentMeta>
  usedComponents: UsedComponent[]
  colors: Set<string>
  textStyles: Map<string, Record<string, unknown>>
  assetCandidates: AssetCandidate[]
}

export function summarizeNodeResponse(
  response: FigmaNodesResponse,
  fileKey: string,
  nodeId: string,
): DesignSummary {
  const nodeEntry = response.nodes?.[nodeId]
  if (!nodeEntry?.document) {
    throw new Error(`Figma response did not include node ${nodeId}`)
  }

  const state = createState({ ...response.components, ...nodeEntry.components })
  const target = simplifyNode(nodeEntry.document, state)

  return buildSummary(response.name, fileKey, nodeId, target, state)
}

export function summarizeFileResponse(response: FigmaFileResponse, fileKey: string): DesignSummary {
  if (!response.document) {
    throw new Error("Figma response did not include a document root")
  }

  const state = createState(response.components ?? {})
  const target = simplifyNode(response.document, state)

  return buildSummary(response.name, fileKey, undefined, target, state)
}

function createState(components: Record<string, FigmaComponentMeta> = {}): ExtractState {
  return {
    components,
    usedComponents: [],
    colors: new Set(),
    textStyles: new Map(),
    assetCandidates: [],
  }
}

function buildSummary(
  fileName: string | undefined,
  fileKey: string,
  nodeId: string | undefined,
  target: SimplifiedNode,
  state: ExtractState,
): DesignSummary {
  return {
    source: { fileKey, nodeId },
    fileName,
    target,
    usedComponents: dedupeBy(state.usedComponents, (item) => `${item.nodeId}:${item.componentId ?? item.name}`),
    colors: [...state.colors].sort(),
    textStyles: dedupeObjects([...state.textStyles.values()]),
    assetCandidates: dedupeBy(state.assetCandidates, (item) => item.nodeId),
    notes: [
      "Use absolute x/y values as design clues. Prefer responsive flex/grid over absolute positioning.",
      "Map Figma component names to existing project components before creating new components.",
      "Export asset candidates only when no existing project icon/image matches.",
    ],
  }
}

function simplifyNode(node: FigmaNode, state: ExtractState): SimplifiedNode {
  const simplified: SimplifiedNode = {
    id: node.id,
    name: node.name,
    type: SVG_TYPES.has(node.type) ? "IMAGE-SVG" : node.type,
  }

  const box = node.absoluteBoundingBox ?? node.absoluteRenderBounds ?? undefined
  if (box) simplified.box = roundBox(box)

  const layout = extractLayout(node)
  if (Object.keys(layout).length > 0) simplified.layout = layout

  const style = extractStyle(node, state)
  if (Object.keys(style).length > 0) simplified.style = style

  const text = extractText(node, state)
  if (text) simplified.text = text

  const component = extractComponent(node, state)
  if (component) simplified.component = component

  if (isAssetCandidate(node)) {
    state.assetCandidates.push({
      name: node.name,
      nodeId: node.id,
      type: simplified.type,
      recommendedFormat: hasImageFill(node) ? "png" : "svg",
    })
  }

  const children = (node.children ?? []).filter((child) => child.visible !== false).map((child) => simplifyNode(child, state))
  if (children.length > 0) simplified.children = children

  return simplified
}

function extractLayout(node: FigmaNode): Record<string, unknown> {
  const layout: Record<string, unknown> = {}
  if (node.layoutMode && node.layoutMode !== "NONE") layout.mode = node.layoutMode.toLowerCase()
  if (node.layoutWrap) layout.wrap = node.layoutWrap.toLowerCase()
  if (typeof node.itemSpacing === "number") layout.gap = round(node.itemSpacing)

  const padding = { top: node.paddingTop, right: node.paddingRight, bottom: node.paddingBottom, left: node.paddingLeft }
  if (Object.values(padding).some((value) => typeof value === "number" && value !== 0)) {
    layout.padding = compactNumberObject(padding)
  }

  if (node.primaryAxisAlignItems) layout.justify = node.primaryAxisAlignItems.toLowerCase()
  if (node.counterAxisAlignItems) layout.align = node.counterAxisAlignItems.toLowerCase()
  if (node.primaryAxisSizingMode) layout.primarySizing = node.primaryAxisSizingMode.toLowerCase()
  if (node.counterAxisSizingMode) layout.counterSizing = node.counterAxisSizingMode.toLowerCase()
  if (node.layoutAlign) layout.selfAlign = node.layoutAlign.toLowerCase()
  if (typeof node.layoutGrow === "number" && node.layoutGrow !== 0) layout.grow = node.layoutGrow
  if (node.constraints) layout.constraints = node.constraints
  return layout
}

function extractStyle(node: FigmaNode, state: ExtractState): Record<string, unknown> {
  const style: Record<string, unknown> = {}
  const fills = extractPaints(node.fills, state)
  const strokes = extractPaints(node.strokes, state)
  if (fills.length > 0) style.fills = fills
  if (strokes.length > 0) style.strokes = strokes
  if (typeof node.strokeWeight === "number" && node.strokeWeight > 0) style.strokeWeight = round(node.strokeWeight)
  if (node.strokeAlign) style.strokeAlign = node.strokeAlign.toLowerCase()
  if (node.strokeDashes?.length) style.strokeDashes = node.strokeDashes.map(round)
  if (typeof node.opacity === "number" && node.opacity !== 1) style.opacity = round(node.opacity)
  if (typeof node.cornerRadius === "number") style.borderRadius = round(node.cornerRadius)
  if (node.rectangleCornerRadii?.length === 4) style.borderRadius = node.rectangleCornerRadii.map(round)
  if (node.effects?.length) style.effects = node.effects.filter((effect) => effect.visible !== false).map(simplifyEffect)
  return style
}

function extractPaints(paints: FigmaPaint[] | undefined, state: ExtractState): string[] {
  if (!paints?.length) return []
  return paints
    .filter((paint) => paint.visible !== false)
    .map((paint) => paintToString(paint, state))
    .filter((value): value is string => Boolean(value))
}

function paintToString(paint: FigmaPaint, state: ExtractState): string | undefined {
  if (paint.type === "SOLID" && paint.color) {
    const color = colorToCss(paint.color, paint.opacity)
    state.colors.add(color)
    return color
  }
  if (paint.type === "IMAGE") return "image-fill"
  if (paint.type?.includes("GRADIENT")) return paint.type.toLowerCase().replace(/_/g, "-")
  return paint.type?.toLowerCase()
}

function extractText(node: FigmaNode, state: ExtractState): Record<string, unknown> | undefined {
  if (node.type !== "TEXT") return undefined
  const style = node.style ?? {}
  const fills = extractPaints(node.fills, state)
  const text: Record<string, unknown> = { value: node.characters ?? "" }
  copy(style, text, "fontFamily")
  copy(style, text, "fontPostScriptName")
  copy(style, text, "fontSize")
  copy(style, text, "fontWeight")
  copy(style, text, "lineHeightPx", "lineHeight")
  copy(style, text, "letterSpacing")
  copy(style, text, "textAlignHorizontal", "align")
  if (fills[0]) text.color = fills[0]
  const signature = JSON.stringify({ ...text, value: undefined })
  state.textStyles.set(signature, { ...text, value: undefined })
  return compactObject(text)
}

function extractComponent(node: FigmaNode, state: ExtractState): Record<string, unknown> | undefined {
  if (node.type !== "INSTANCE") return undefined
  const props = simplifyComponentProperties(node.componentProperties)
  const meta = node.componentId ? state.components[node.componentId] : undefined
  const componentName = meta?.name ?? node.name
  const size = node.absoluteBoundingBox
    ? { width: round(node.absoluteBoundingBox.width), height: round(node.absoluteBoundingBox.height) }
    : undefined
  state.usedComponents.push({
    name: componentName,
    nodeId: node.id,
    componentId: node.componentId,
    size,
    props: Object.keys(props).length > 0 ? props : undefined,
  })
  return compactObject({
    isInstance: true,
    name: componentName,
    componentId: node.componentId,
    props: Object.keys(props).length > 0 ? props : undefined,
  })
}

function simplifyComponentProperties(properties: FigmaNode["componentProperties"]): Record<string, boolean | string> {
  if (!properties) return {}
  const result: Record<string, boolean | string> = {}
  for (const [name, prop] of Object.entries(properties)) {
    if (prop.type === "BOOLEAN" || prop.type === "TEXT" || prop.type === "VARIANT") {
      result[stripPropertySuffix(name)] = prop.value
    }
  }
  return result
}

function stripPropertySuffix(name: string): string {
  const index = name.indexOf("#")
  return index === -1 ? name : name.slice(0, index)
}

function isAssetCandidate(node: FigmaNode): boolean {
  return SVG_TYPES.has(node.type) || hasImageFill(node)
}

function hasImageFill(node: FigmaNode): boolean {
  return Boolean(node.fills?.some((fill) => fill.visible !== false && fill.type === "IMAGE"))
}

function simplifyEffect(effect: Record<string, unknown>): Record<string, unknown> {
  return compactObject({
    type: typeof effect.type === "string" ? effect.type.toLowerCase() : effect.type,
    radius: typeof effect.radius === "number" ? round(effect.radius) : undefined,
    offset: effect.offset,
    color:
      typeof effect.color === "object" && effect.color
        ? colorToCss(effect.color as { r: number; g: number; b: number; a?: number })
        : undefined,
  })
}

function colorToCss(color: { r: number; g: number; b: number; a?: number }, opacity?: number): string {
  const r = Math.round(color.r * 255)
  const g = Math.round(color.g * 255)
  const b = Math.round(color.b * 255)
  const a = color.a ?? opacity ?? 1
  if (a < 1) return `rgba(${r}, ${g}, ${b}, ${round(a)})`
  return `#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase()
}

function hex(value: number): string {
  return value.toString(16).padStart(2, "0")
}

function roundBox(box: { x: number; y: number; width: number; height: number }) {
  return { x: round(box.x), y: round(box.y), width: round(box.width), height: round(box.height) }
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

function copy(source: Record<string, unknown>, target: Record<string, unknown>, from: string, to = from): void {
  if (source[from] !== undefined) target[to] = source[from]
}

function compactNumberObject(input: Record<string, number | undefined>): Record<string, number> {
  const result: Record<string, number> = {}
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "number") result[key] = round(value)
  }
  return result
}

function compactObject<T extends Record<string, unknown>>(input: T): T {
  for (const key of Object.keys(input)) {
    if (input[key] === undefined || input[key] === null) delete input[key]
  }
  return input
}

function dedupeBy<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = keyFn(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function dedupeObjects<T extends Record<string, unknown>>(items: T[]): T[] {
  return dedupeBy(items.filter((item) => Object.keys(item).length > 0), (item) => JSON.stringify(item))
}
