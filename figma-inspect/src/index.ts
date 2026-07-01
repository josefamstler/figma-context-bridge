#!/usr/bin/env node
import { FigmaClient, getFigmaToken } from "./figma.js"
import { formatMarkdown } from "./format-markdown.js"
import { parseFigmaUrl } from "./parse-url.js"
import { summarizeFileResponse, summarizeNodeResponse } from "./extract.js"
import type { CliOptions } from "./types.js"

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2))
  const source = parseFigmaUrl(options.url)
  const client = new FigmaClient(getFigmaToken())

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

function parseArgs(args: string[]): CliOptions {
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printHelp()
    process.exit(args.length === 0 ? 1 : 0)
  }

  let json = false
  let raw = false
  let depth: number | undefined
  let url: string | undefined

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === "--json") json = true
    else if (arg === "--raw") raw = true
    else if (arg === "--depth") {
      const value = args[++i]
      if (!value || Number.isNaN(Number(value))) throw new Error("--depth requires a number")
      depth = Number(value)
    } else if (arg.startsWith("--depth=")) {
      depth = Number(arg.slice("--depth=".length))
      if (Number.isNaN(depth)) throw new Error("--depth requires a number")
    } else if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`)
    } else {
      url = arg
    }
  }

  if (!url) throw new Error("Missing Figma URL")
  return { url, depth, json, raw }
}

function printHelp(): void {
  print(`figma-inspect - summarize Figma design nodes for frontend implementation

Usage:
  figma-inspect [--depth N] [--json] <figma-url>
  figma-inspect --raw <figma-url>

Environment:
  FIGMA_TOKEN or FIGMA_API_KEY must contain a read-only Figma personal access token.

Examples:
  figma-inspect "https://www.figma.com/design/FILE_KEY/name?node-id=12-34"
  figma-inspect --json --depth 5 "https://www.figma.com/file/FILE_KEY/name?node-id=12%3A34"
`)
}

function printJson(value: unknown): void {
  print(`${JSON.stringify(value, null, 2)}\n`)
}

function print(value: string): void {
  process.stdout.write(value)
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  process.stderr.write(`figma-inspect: ${message}\n`)
  process.exit(1)
})
