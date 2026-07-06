# AGENTS.md

## Repo Shape

- Root scripts install/uninstall a local `figma-inspect` CLI and generated `figma-design` skill.
- The TypeScript CLI package lives in `figma-inspect/`; there is no root `package.json`.
- The installed skill is generated from `skill/figma-design.SKILL.md.template`; edit the template, not files under `~/.config/opencode/skills/` or `~/.claude/skills/`.
- `figma-inspect/src/index.ts` is only the CLI entrypoint; command flows live in `figma-inspect/src/commands/`.
- CLI parsing/output lives in `figma-inspect/src/cli/`, Figma API access in `figma-inspect/src/figma/`, design summary extraction/formatting in `figma-inspect/src/design/`, screenshot helpers in `figma-inspect/src/screenshot/`, and Figma URL parsing in `figma-inspect/src/url/`.

## Commands

- Install dependencies: `npm --prefix figma-inspect install`
- Typecheck: `npm --prefix figma-inspect run check`
- Build: `npm --prefix figma-inspect run build`
- Non-interactive install smoke path: `./install.sh --target=opencode` or `./install.sh --target=claude`
- Non-interactive uninstall: `./uninstall.sh --target=opencode` or `./uninstall.sh --target=claude`

## Verification

- There are no test or lint scripts currently; use `npm --prefix figma-inspect run check` and `npm --prefix figma-inspect run build`.
- The built CLI entrypoint is `figma-inspect/dist/index.js`, produced by `tsc`; `dist/` is ignored.
- Manual CLI calls require `FIGMA_TOKEN` or `FIGMA_API_KEY`, usually loaded by the installed wrapper from `~/.config/figma-inspect/env`.

## Operational Gotchas

- `install.sh` writes outside the repo: `~/.local/bin/figma-inspect`, `~/.config/figma-inspect/env`, and a tool-specific skill directory.
- Use `--target=opencode` or `--target=claude` in scripts when running without an interactive TTY.
- Installer requires Node.js >= 18 and npm; it tries to load `~/.nvm/nvm.sh` if Node/npm are missing.
- `uninstall.sh` keeps the CLI wrapper and token file unless passed `--remove-cli` or `--remove-token-file`.

## CLI Notes

- `figma-inspect` accepts `/file/:key` and `/design/:key` URLs.
- `node-id` URL dashes are converted to Figma colon IDs internally.
- Default output is Markdown; use `--json` for summarized JSON and `--raw` for raw Figma API output.
- Use `--screenshot --output <path>` to export the selected `node-id` frame/component image through the Figma images API.
- Without a node ID, the CLI fetches the whole file at default depth 2.
