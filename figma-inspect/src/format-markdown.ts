import type { DesignSummary, SimplifiedNode } from "./types.js"

export function formatMarkdown(summary: DesignSummary): string {
  const lines: string[] = []
  const box = summary.target.box

  lines.push("# Figma Component Summary", "")
  if (summary.fileName) lines.push(`File: ${summary.fileName}`)
  lines.push(`Name: ${summary.target.name}`)
  lines.push(`Type: ${summary.target.type}`)
  if (box) lines.push(`Size: ${box.width} x ${box.height}`)
  lines.push(`File Key: ${summary.source.fileKey}`)
  if (summary.source.nodeId) lines.push(`Node ID: ${summary.source.nodeId}`)

  lines.push("", "## Used Components")
  if (summary.usedComponents.length === 0) {
    lines.push("- None detected")
  } else {
    for (const item of summary.usedComponents) {
      const size = item.size ? `, ${item.size.width} x ${item.size.height}` : ""
      const props = item.props ? `, props: ${JSON.stringify(item.props)}` : ""
      lines.push(`- ${item.name}${size}${props}`)
    }
  }

  lines.push("", "## Layout")
  lines.push(...formatNodeTree(summary.target, 0, 4))

  lines.push("", "## Colors")
  if (summary.colors.length === 0) lines.push("- None detected")
  else summary.colors.forEach((color) => lines.push(`- ${color}`))

  lines.push("", "## Typography")
  if (summary.textStyles.length === 0) lines.push("- None detected")
  else summary.textStyles.forEach((style) => lines.push(`- ${JSON.stringify(style)}`))

  lines.push("", "## Asset Candidates")
  if (summary.assetCandidates.length === 0) {
    lines.push("- None detected")
  } else {
    summary.assetCandidates.forEach((asset) => {
      lines.push(`- ${asset.name}: ${asset.type}, node ${asset.nodeId}, export ${asset.recommendedFormat} if needed`)
    })
  }

  lines.push("", "## Implementation Notes")
  summary.notes.forEach((note) => lines.push(`- ${note}`))

  return `${lines.join("\n")}\n`
}

function formatNodeTree(node: SimplifiedNode, depth: number, maxDepth: number): string[] {
  const indent = "  ".repeat(depth)
  const box = node.box ? ` ${node.box.width}x${node.box.height}` : ""
  const layout = node.layout ? ` layout=${JSON.stringify(node.layout)}` : ""
  const text = node.text?.value ? ` text=${JSON.stringify(node.text.value)}` : ""
  const component = node.component?.name ? ` component=${JSON.stringify(node.component.name)}` : ""
  const lines = [`${indent}- ${node.name} [${node.type}]${box}${component}${text}${layout}`]

  if (depth >= maxDepth && node.children?.length) {
    lines.push(`${indent}  - ... ${node.children.length} children omitted`)
    return lines
  }

  for (const child of node.children ?? []) {
    lines.push(...formatNodeTree(child, depth + 1, maxDepth))
  }

  return lines
}
