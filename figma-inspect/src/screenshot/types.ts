export type ScreenshotFormat = "png" | "jpg" | "svg" | "pdf"

export type ScreenshotExportOptions = {
  format: ScreenshotFormat
  scale?: number
}
