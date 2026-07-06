import type { FigmaUrlParts } from "./types.js"

export function parseFigmaUrl(input: string): FigmaUrlParts {
  let url: URL
  try {
    url = new URL(input)
  } catch {
    throw new Error(`Invalid Figma URL: ${input}`)
  }

  if (!url.hostname.includes("figma.com")) {
    throw new Error(`Expected a figma.com URL, got: ${url.hostname}`)
  }

  const parts = url.pathname.split("/").filter(Boolean)
  const fileMarkerIndex = parts.findIndex((part) => part === "file" || part === "design")
  const fileKey = fileMarkerIndex >= 0 ? parts[fileMarkerIndex + 1] : undefined

  if (!fileKey) {
    throw new Error("Could not find Figma file key in URL. Expected /file/:key or /design/:key.")
  }

  const rawNodeId = url.searchParams.get("node-id") ?? undefined
  const nodeId = rawNodeId ? rawNodeId.replace(/-/g, ":") : undefined

  return { fileKey, nodeId }
}
