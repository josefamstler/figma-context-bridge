export type FigmaUrlParts = {
  fileKey: string
  nodeId?: string
}

export type CliOptions = {
  url: string
  depth?: number
  json: boolean
  raw: boolean
}

export type FigmaPaint = {
  type?: string
  visible?: boolean
  opacity?: number
  color?: { r: number; g: number; b: number; a?: number }
  imageRef?: string
}

export type FigmaNode = {
  id: string
  name: string
  type: string
  visible?: boolean
  children?: FigmaNode[]
  absoluteBoundingBox?: { x: number; y: number; width: number; height: number }
  absoluteRenderBounds?: { x: number; y: number; width: number; height: number } | null
  layoutMode?: "NONE" | "HORIZONTAL" | "VERTICAL" | "GRID"
  layoutWrap?: string
  itemSpacing?: number
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
  primaryAxisAlignItems?: string
  counterAxisAlignItems?: string
  primaryAxisSizingMode?: string
  counterAxisSizingMode?: string
  layoutAlign?: string
  layoutGrow?: number
  constraints?: { vertical?: string; horizontal?: string }
  fills?: FigmaPaint[]
  strokes?: FigmaPaint[]
  strokeWeight?: number
  strokeAlign?: string
  strokeDashes?: number[]
  cornerRadius?: number
  rectangleCornerRadii?: number[]
  effects?: Array<Record<string, unknown>>
  opacity?: number
  characters?: string
  style?: Record<string, unknown>
  componentId?: string
  componentProperties?: Record<string, { type: string; value: boolean | string }>
  componentPropertyReferences?: Record<string, string>
}

export type FigmaComponentMeta = {
  key?: string
  name?: string
  description?: string
  componentSetId?: string
}

export type FigmaNodesResponse = {
  name?: string
  lastModified?: string
  nodes?: Record<string, { document: FigmaNode; components?: Record<string, FigmaComponentMeta> }>
  components?: Record<string, FigmaComponentMeta>
  componentSets?: Record<string, FigmaComponentMeta>
  styles?: Record<string, { name?: string; styleType?: string; description?: string }>
}

export type FigmaFileResponse = FigmaNodesResponse & {
  document?: FigmaNode
}

export type SimplifiedNode = {
  id: string
  name: string
  type: string
  box?: { x: number; y: number; width: number; height: number }
  layout?: Record<string, unknown>
  style?: Record<string, unknown>
  text?: Record<string, unknown>
  component?: Record<string, unknown>
  children?: SimplifiedNode[]
}

export type UsedComponent = {
  name: string
  nodeId: string
  componentId?: string
  size?: { width: number; height: number }
  props?: Record<string, boolean | string>
}

export type AssetCandidate = {
  name: string
  nodeId: string
  type: string
  recommendedFormat: "svg" | "png"
}

export type DesignSummary = {
  source: FigmaUrlParts
  fileName?: string
  target: SimplifiedNode
  usedComponents: UsedComponent[]
  colors: string[]
  textStyles: Array<Record<string, unknown>>
  assetCandidates: AssetCandidate[]
  notes: string[]
}
