import { writeFile } from "node:fs/promises"

import type { CliOptions } from "../cli/types.js"
import { print } from "../cli/output.js"
import type { FigmaClient } from "../figma/client.js"
import { exportFigmaScreenshot } from "../screenshot/export.js"
import type { FigmaUrlParts } from "../url/types.js"

export async function runScreenshotCommand(client: FigmaClient, source: FigmaUrlParts, options: CliOptions): Promise<void> {
  if (!options.output) throw new Error("--screenshot requires --output <path>.")

  const image = await exportFigmaScreenshot(client, source, {
    format: options.format,
    scale: options.scale,
  })
  await writeFile(options.output, image)
  return print(`Wrote ${options.output}\n`)
}
