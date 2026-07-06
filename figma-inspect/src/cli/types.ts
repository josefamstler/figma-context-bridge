import type { ScreenshotFormat } from "../screenshot/types.js"

export type CliOptions = {
  url: string
  depth?: number
  json: boolean
  raw: boolean
  screenshot: boolean
  output?: string
  format: ScreenshotFormat
  scale?: number
}
