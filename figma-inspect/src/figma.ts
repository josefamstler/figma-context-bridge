import type { FigmaFileResponse, FigmaNodesResponse } from "./types.js"

const BASE_URL = "https://api.figma.com/v1"

export class FigmaClient {
  constructor(private readonly token: string) {}

  async getNode(fileKey: string, nodeId: string, depth?: number): Promise<FigmaNodesResponse> {
    const params = new URLSearchParams({ ids: nodeId })
    if (depth !== undefined) params.set("depth", String(depth))
    return this.get(`/files/${fileKey}/nodes?${params.toString()}`)
  }

  async getFile(fileKey: string, depth = 2): Promise<FigmaFileResponse> {
    const params = new URLSearchParams({ depth: String(depth) })
    return this.get(`/files/${fileKey}?${params.toString()}`)
  }

  private async get<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { "X-Figma-Token": this.token },
    })

    if (!response.ok) {
      const body = await response.text()
      if (response.status === 403) {
        throw new Error("Figma API returned 403. Check that FIGMA_TOKEN has read access to this file.")
      }
      if (response.status === 429) {
        throw new Error("Figma API rate limit reached. Try again later.")
      }
      throw new Error(`Figma API error ${response.status}: ${body}`)
    }

    return response.json() as Promise<T>
  }
}

export function getFigmaToken(): string {
  const token = process.env.FIGMA_TOKEN ?? process.env.FIGMA_API_KEY
  if (!token) {
    throw new Error("FIGMA_TOKEN is required. Add it to ~/.config/figma-inspect/env first.")
  }
  return token
}
