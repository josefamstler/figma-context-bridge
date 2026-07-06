import { describe, expect, it } from "vitest"

import { summarizeFileResponse, summarizeNodeResponse } from "./extract.js"
import type { FigmaFileResponse, FigmaNodesResponse } from "../figma/types.js"

describe("design extraction", () => {
  it("summarizes node responses with layout, style, text, components, and assets", () => {
    const response: FigmaNodesResponse = {
      name: "Example File",
      components: { "component:1": { name: "Button / Primary" } },
      nodes: {
        "1:2": {
          document: {
            id: "1:2",
            name: "Card",
            type: "FRAME",
            absoluteBoundingBox: { x: 1.2, y: 2.5, width: 320.4, height: 120.6 },
            layoutMode: "VERTICAL",
            itemSpacing: 12,
            paddingTop: 8,
            paddingRight: 16,
            paddingBottom: 8,
            paddingLeft: 16,
            fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }],
            children: [
              {
                id: "1:3",
                name: "Title",
                type: "TEXT",
                characters: "Hello",
                style: { fontFamily: "Inter", fontSize: 16, fontWeight: 600 },
                fills: [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }],
              },
              {
                id: "1:4",
                name: "Primary Button",
                type: "INSTANCE",
                componentId: "component:1",
                absoluteBoundingBox: { x: 0, y: 0, width: 100, height: 40 },
                componentProperties: { "Label#123": { type: "TEXT", value: "Save" } },
              },
              {
                id: "1:5",
                name: "Icon",
                type: "VECTOR",
              },
              {
                id: "1:6",
                name: "Hidden",
                type: "TEXT",
                visible: false,
                characters: "Do not include",
              },
            ],
          },
        },
      },
    }

    const summary = summarizeNodeResponse(response, "FILE_KEY", "1:2")

    expect(summary.source).toEqual({ fileKey: "FILE_KEY", nodeId: "1:2" })
    expect(summary.fileName).toBe("Example File")
    expect(summary.target.box).toEqual({ x: 1.2, y: 2.5, width: 320.4, height: 120.6 })
    expect(summary.target.layout).toMatchObject({ mode: "vertical", gap: 12, padding: { top: 8, right: 16, bottom: 8, left: 16 } })
    expect(summary.target.children?.map((child) => child.name)).toEqual(["Title", "Primary Button", "Icon"])
    expect(summary.colors).toEqual(["#000000", "#FFFFFF"])
    expect(summary.textStyles).toEqual([{ value: undefined, fontFamily: "Inter", fontSize: 16, fontWeight: 600, color: "#000000" }])
    expect(summary.usedComponents).toEqual([
      {
        name: "Button / Primary",
        nodeId: "1:4",
        componentId: "component:1",
        size: { width: 100, height: 40 },
        props: { Label: "Save" },
      },
    ])
    expect(summary.assetCandidates).toEqual([{ name: "Icon", nodeId: "1:5", type: "IMAGE-SVG", recommendedFormat: "svg" }])
  })

  it("summarizes file responses", () => {
    const response: FigmaFileResponse = {
      name: "Whole File",
      document: { id: "0:1", name: "Page", type: "DOCUMENT" },
    }

    expect(summarizeFileResponse(response, "FILE_KEY")).toMatchObject({
      source: { fileKey: "FILE_KEY", nodeId: undefined },
      fileName: "Whole File",
      target: { id: "0:1", name: "Page", type: "DOCUMENT" },
    })
  })

  it("throws for missing nodes and missing file roots", () => {
    expect(() => summarizeNodeResponse({ nodes: {} }, "FILE_KEY", "1:2")).toThrow("did not include node")
    expect(() => summarizeFileResponse({}, "FILE_KEY")).toThrow("did not include a document root")
  })
})
