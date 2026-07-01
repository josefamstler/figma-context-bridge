# Figma OpenCode Integration

Use Figma design links in OpenCode without running a background MCP server.

This project installs:

- `figma-inspect`: a read-only Node/TypeScript CLI that fetches selected Figma nodes and summarizes them for frontend implementation.
- `figma-design`: an OpenCode skill that automatically tells OpenCode to run `figma-inspect` before implementing UI from a Figma URL.

## Requirements

- Node.js 18 or newer
- npm
- OpenCode
- A Figma personal access token with read access to the target file

If Node is installed through `nvm`, the installer and command wrapper try to load `~/.nvm/nvm.sh` automatically.

## Install

```bash
git clone <repo-url>
cd figma-opencode-integration
./install.sh
```

Then edit:

```text
~/.config/figma-inspect/env
```

Set your token:

```bash
export FIGMA_TOKEN="figd_your_token_here"
```

Keep the quotes.

Restart OpenCode after installation so it loads the skill.

## Usage

Inside any frontend project, ask OpenCode:

```text
Implement this component from Figma:
https://www.figma.com/design/FILE_KEY/name?node-id=12-34
```

OpenCode should:

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

The installed OpenCode skill tells OpenCode to treat Figma as the source of truth.

It should not substitute different components unless the user explicitly says approximation, adaptation, or replacement is allowed.

If Figma lists `Button / Primary`, OpenCode should search for the closest existing Button/Primary code component and use that instead of silently replacing it with an unrelated element.

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

The installer does not overwrite an existing token file.

Restart OpenCode after updating the skill.

## Uninstall

```bash
./uninstall.sh
```

This keeps the token file by default.

To remove the token file too:

```bash
./uninstall.sh --remove-token-file
```

Restart OpenCode after uninstalling.

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
