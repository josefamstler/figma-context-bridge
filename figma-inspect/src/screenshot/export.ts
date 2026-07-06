import type { FigmaClient } from "../figma/client.js"
import type { FigmaUrlParts } from "../url/types.js"
import { downloadFile } from "./download.js"
import type { ScreenshotExportOptions } from "./types.js"

export async function exportFigmaScreenshot(
  client: FigmaClient,
  source: FigmaUrlParts,
  options: ScreenshotExportOptions,
): Promise<Buffer> {
  if (!source.nodeId) throw new Error("--screenshot requires a Figma URL with node-id.")

  const imageUrl = await client.getImageUrl(source.fileKey, source.nodeId, options)
  return downloadFile(imageUrl)
}
