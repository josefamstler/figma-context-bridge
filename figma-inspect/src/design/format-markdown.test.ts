import { describe, expect, it } from "vitest"

import { formatMarkdown } from "./format-markdown.js"
import type { DesignSummary } from "./types.js"

describe("formatMarkdown", () => {
  it("formats the design summary sections", () => {
    const summary: DesignSummary = {
      source: { fileKey: "FILE_KEY", nodeId: "1:2" },
      fileName: "Example File",
      target: {
        id: "1:2",
        name: "Card",
        type: "FRAME",
        box: { x: 0, y: 0, width: 320, height: 120 },
        layout: { mode: "vertical", gap: 8 },
        children: [{ id: "1:3", name: "Title", type: "TEXT", text: { value: "Hello" } }],
      },
      usedComponents: [{ name: "Button / Primary", nodeId: "1:4", size: { width: 100, height: 40 }, props: { label: "Save" } }],
      colors: ["#FFFFFF"],
      textStyles: [{ fontFamily: "Inter", fontSize: 16 }],
      assetCandidates: [{ name: "Logo", nodeId: "1:5", type: "IMAGE-SVG", recommendedFormat: "svg" }],
      notes: ["Use components."],
    }

    const markdown = formatMarkdown(summary)

    expect(markdown).toContain("# Figma Component Summary")
    expect(markdown).toContain("File: Example File")
    expect(markdown).toContain("Size: 320 x 120")
    expect(markdown).toContain("- Button / Primary, 100 x 40, props: {\"label\":\"Save\"}")
    expect(markdown).toContain("- Card [FRAME] 320x120 layout={\"mode\":\"vertical\",\"gap\":8}")
    expect(markdown).toContain("  - Title [TEXT] text=\"Hello\"")
    expect(markdown).toContain("- #FFFFFF")
    expect(markdown).toContain("- Logo: IMAGE-SVG, node 1:5, export svg if needed")
    expect(markdown).toContain("- Use components.")
  })

  it("prints empty-section fallbacks", () => {
    const markdown = formatMarkdown({
      source: { fileKey: "FILE_KEY" },
      target: { id: "0:1", name: "Root", type: "DOCUMENT" },
      usedComponents: [],
      colors: [],
      textStyles: [],
      assetCandidates: [],
      notes: [],
    })

    expect(markdown.match(/- None detected/g)).toHaveLength(4)
  })
})
