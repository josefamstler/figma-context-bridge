import type { ScreenshotFormat } from "../screenshot/types.js"
import { printHelp } from "./help.js"
import type { CliOptions } from "./types.js"

export function parseArgs(args: string[]): CliOptions {
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printHelp()
    process.exit(args.length === 0 ? 1 : 0)
  }

  let json = false
  let raw = false
  let screenshot = false
  let output: string | undefined
  let format: ScreenshotFormat = "png"
  let scale: number | undefined
  let depth: number | undefined
  let url: string | undefined

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === "--json") json = true
    else if (arg === "--raw") raw = true
    else if (arg === "--screenshot") screenshot = true
    else if (arg === "--output") {
      output = args[++i]
      if (!output) throw new Error("--output requires a path")
    } else if (arg.startsWith("--output=")) {
      output = arg.slice("--output=".length)
      if (!output) throw new Error("--output requires a path")
    } else if (arg === "--format") {
      format = parseScreenshotFormat(args[++i])
    } else if (arg.startsWith("--format=")) {
      format = parseScreenshotFormat(arg.slice("--format=".length))
    } else if (arg === "--scale") {
      scale = parseScale(args[++i])
    } else if (arg.startsWith("--scale=")) {
      scale = parseScale(arg.slice("--scale=".length))
    } else if (arg === "--depth") {
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
  if (screenshot && (json || raw)) throw new Error("--screenshot cannot be combined with --json or --raw")
  return { url, depth, json, raw, screenshot, output, format, scale }
}

function parseScreenshotFormat(value: string | undefined): ScreenshotFormat {
  if (value === "png" || value === "jpg" || value === "svg" || value === "pdf") return value
  throw new Error("--format must be one of: png, jpg, svg, pdf")
}

function parseScale(value: string | undefined): number {
  const scale = Number(value)
  if (!value || Number.isNaN(scale) || scale <= 0) throw new Error("--scale requires a positive number")
  return scale
}
