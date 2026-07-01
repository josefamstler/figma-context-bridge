# Figma AI Coding Integration

Use Figma design links in OpenCode or Claude CLI without running a background MCP server.

This project installs:

- `figma-inspect`: a read-only Node/TypeScript CLI that fetches selected Figma nodes and summarizes them for frontend implementation.
- `figma-design`: a generated skill for either OpenCode or Claude CLI that tells the agent to run `figma-inspect` before implementing UI from a Figma URL.

## Requirements

- Node.js 18 or newer
- npm
- OpenCode or Claude CLI/Claude Code
- A Figma personal access token with read access to the target file

If Node is installed through `nvm`, the installer and command wrapper try to load `~/.nvm/nvm.sh` automatically.

## Install

```bash
git clone <repo-url>
cd figma-context-bridge
./install.sh
```

The installer asks where to install the skill:

```text
? Install integration for:
❯ OpenCode
  Claude CLI
```

Use arrow keys and Enter.

For non-interactive installs:

```bash
./install.sh --target=opencode
./install.sh --target=claude
```

The installer always installs the shared `figma-inspect` command and token env file. It installs the skill only for the selected tool.

## Installed Paths

Shared CLI wrapper:

```text
~/.local/bin/figma-inspect
```

Token file:

```text
~/.config/figma-inspect/env
```

OpenCode skill:

```text
~/.config/opencode/skills/figma-design/SKILL.md
```

Claude CLI skill:

```text
~/.claude/skills/figma-design/SKILL.md
```

The source skill is maintained once as:

```text
skill/figma-design.SKILL.md.template
```

The installer injects tool-specific wording when it writes the final skill.

## Token Setup

Edit:

```text
~/.config/figma-inspect/env
```

Set your token:

```bash
export FIGMA_TOKEN="figd_your_token_here"
```

Keep the quotes.

The installer does not overwrite an existing token file.

## Usage

Restart the selected tool after installation so it loads the skill.

Inside any frontend project, ask:

```text
Implement this component from Figma:
https://www.figma.com/design/FILE_KEY/name?node-id=12-34
```

The agent should:

1. Trigger the `figma-design` skill.
2. Run `figma-inspect "<figma-url>"` automatically.
3. Read the latest Figma data.
4. Inspect your frontend project.
5. Reuse matching project components and tokens.
6. Implement the UI while staying faithful to Figma.

## Manual Debugging

You do not need to run this manually during normal use. It is useful for troubleshooting only.

```bash
figma-inspect "https://www.figma.com/design/FILE_KEY/name?node-id=12-34"
figma-inspect --json "https://www.figma.com/design/FILE_KEY/name?node-id=12-34"
figma-inspect --raw "https://www.figma.com/design/FILE_KEY/name?node-id=12-34"
```

## What The Helper Extracts

- Target node name, type, id, width, and height
- Component instances listed in Figma
- Component properties for text/boolean/variant props
- Auto-layout mode, gap, padding, alignment, constraints
- Fills, strokes, opacity, border radius, effects
- Text content and typography
- Used colors
- Asset candidates for SVG/PNG export

## Strict Figma Matching

The installed skill tells the agent to treat Figma as the source of truth.

It should not substitute different components unless the user explicitly says approximation, adaptation, or replacement is allowed.

If Figma lists `Button / Primary`, the agent should search for the closest existing Button/Primary code component and use that instead of silently replacing it with an unrelated element.

## Token Security

The token is stored outside the repo:

```text
~/.config/figma-inspect/env
```

Permissions are set to `600` by the installer.

The tool only performs Figma `GET` requests. It does not write to Figma.

## PATH Note

The installer writes a wrapper to:

```text
~/.local/bin/figma-inspect
```

If `figma-inspect --help` is not found, add this to your shell profile:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

Then restart your terminal.

## Update

```bash
git pull
./install.sh
```

Or update a specific tool non-interactively:

```bash
./install.sh --target=opencode
./install.sh --target=claude
```

Restart the selected tool after updating the skill.

## Uninstall

Interactive uninstall:

```bash
./uninstall.sh
```

Non-interactive uninstall:

```bash
./uninstall.sh --target=opencode
./uninstall.sh --target=claude
```

By default, uninstall removes only the selected tool's skill and keeps the shared CLI/token file.

Remove the CLI wrapper too:

```bash
./uninstall.sh --target=opencode --remove-cli
```

Remove the token file too:

```bash
./uninstall.sh --target=opencode --remove-token-file
```

Restart the selected tool after uninstalling.

## Troubleshooting

Missing token:

```text
FIGMA_TOKEN is required
```

Fix `~/.config/figma-inspect/env`.

403 from Figma:

```text
Figma API returned 403
```

The token does not have read access to the file.

No node data:

```text
Figma response did not include node
```

Copy a link to the selected frame/component in Figma so the URL includes `node-id`.
