import type { FigmaUrlParts } from "../url/types.js"

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
