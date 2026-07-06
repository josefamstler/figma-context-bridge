import { formatMarkdown } from "../design/format-markdown.js"
import { summarizeFileResponse, summarizeNodeResponse } from "../design/extract.js"
import type { FigmaClient } from "../figma/client.js"
import { print, printJson } from "../cli/output.js"
import type { CliOptions } from "../cli/types.js"
import type { FigmaUrlParts } from "../url/types.js"

export async function runInspectCommand(client: FigmaClient, source: FigmaUrlParts, options: CliOptions): Promise<void> {
  if (source.nodeId) {
    const raw = await client.getNode(source.fileKey, source.nodeId, options.depth)
    if (options.raw) return printJson(raw)
    const summary = summarizeNodeResponse(raw, source.fileKey, source.nodeId)
    return options.json ? printJson(summary) : print(formatMarkdown(summary))
  }

  const raw = await client.getFile(source.fileKey, options.depth ?? 2)
  if (options.raw) return printJson(raw)
  const summary = summarizeFileResponse(raw, source.fileKey)
  return options.json ? printJson(summary) : print(formatMarkdown(summary))
}
