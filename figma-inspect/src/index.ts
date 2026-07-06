#!/usr/bin/env node
import { parseArgs } from "./cli/parse-args.js"
import { runInspectCommand } from "./commands/inspect.js"
import { runScreenshotCommand } from "./commands/screenshot.js"
import { getFigmaToken } from "./figma/auth.js"
import { FigmaClient } from "./figma/client.js"
import { parseFigmaUrl } from "./url/parse-figma-url.js"

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2))
  const source = parseFigmaUrl(options.url)
  const client = new FigmaClient(getFigmaToken())

  if (options.screenshot) {
    return runScreenshotCommand(client, source, options)
  }

  return runInspectCommand(client, source, options)
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  process.stderr.write(`figma-inspect: ${message}\n`)
  process.exit(1)
})
