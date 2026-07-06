import { print } from "./output.js"

export function printHelp(): void {
  print(`figma-inspect - summarize Figma design nodes for frontend implementation

Usage:
  figma-inspect [--depth N] [--json] <figma-url>
  figma-inspect --raw <figma-url>
  figma-inspect --screenshot --output <path> [--format png|jpg|svg|pdf] [--scale N] <figma-url-with-node-id>

Environment:
  FIGMA_TOKEN or FIGMA_API_KEY must contain a read-only Figma personal access token.

Examples:
  figma-inspect "https://www.figma.com/design/FILE_KEY/name?node-id=12-34"
  figma-inspect --json --depth 5 "https://www.figma.com/file/FILE_KEY/name?node-id=12%3A34"
  figma-inspect --screenshot --output figma.png "https://www.figma.com/design/FILE_KEY/name?node-id=12-34"
`)
}
