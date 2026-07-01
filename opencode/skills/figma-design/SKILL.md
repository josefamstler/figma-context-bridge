---
name: figma-design
description: Use when the user provides a Figma URL and asks to inspect, implement, recreate, match, update, or build frontend UI from the design. Strictly fetch and follow Figma via figma-inspect before coding; do not substitute different components unless explicitly allowed.
---

# Figma Design Implementation

Use this skill when the user provides a Figma URL and asks to create, implement, recreate, update, inspect, or match a frontend component/page/screen.

## Strict Figma Matching

- Always run `figma-inspect "<figma-url>"` before implementing or updating UI from a Figma URL.
- Do not ask the user to run the helper manually.
- Treat the Figma output as the source of truth for component hierarchy, component instance names, text, colors, spacing, sizing, typography, and asset candidates.
- Do not substitute different components than the ones listed in Figma unless the user explicitly says approximation, adaptation, or replacement is allowed.
- If Figma lists `Button / Primary`, search for and use the closest existing project Button/Primary component. Do not silently use an unrelated CTA/link/div implementation.
- If a matching project component does not exist, state that clearly and either create the closest faithful implementation or ask only if the task scope is ambiguous.
- Preserve Figma text content exactly unless the user asks for copy changes.
- Preserve Figma visual hierarchy and spacing as closely as the project styling system allows.
- Any intentional deviation from Figma must be mentioned in the final response.
- Never rely only on screenshot-like visual guessing when Figma API data is available.

## Workflow

1. Run the local helper first. This is mandatory for every Figma implementation/update request:

```bash
figma-inspect "<figma-url>"
```

2. If the Markdown output is not detailed enough, run:

```bash
figma-inspect --json "<figma-url>"
```

3. If debugging API output is necessary, run:

```bash
figma-inspect --raw "<figma-url>"
```

4. Inspect the current frontend project before writing code.

5. Search for existing components matching Figma component names, especially Button, Input, Card, Dialog, Icon, Avatar, Badge, Tabs, Select, Checkbox, Radio, Tooltip, and similar design-system primitives.

6. Reuse existing project components and tokens before creating new ones, but only when they match the Figma-listed component role and variant closely.

7. Use Figma dimensions, colors, typography, spacing, and hierarchy as implementation constraints, not as a reason to absolutely position everything.

8. Prefer responsive flex/grid layouts over absolute positioning unless the design clearly requires overlay positioning.

9. Treat asset candidates as export candidates only. First check whether the project already has a matching icon/image or icon library.

10. Implement the requested UI using the project’s existing styling conventions while staying faithful to Figma.

11. Run available format, lint, typecheck, or test commands when feasible.

## Figma Helper Notes

The helper expects a read-only token in `FIGMA_TOKEN` or `FIGMA_API_KEY`.

Default output is Markdown optimized for implementation. JSON output is available with `--json`.

## Interpretation Rules

- `Used Components` are Figma component instances. They are binding constraints, not loose suggestions. Map them to existing code components when possible and do not replace them with unrelated components.
- `Layout` describes the design structure. Convert auto-layout to flex/grid.
- `Colors` should be mapped to existing tokens/classes when the project has a design system.
- `Typography` should be mapped to existing text components or tokenized CSS when available.
- `Asset Candidates` should not be exported blindly.
- Absolute `x` and `y` coordinates are useful for relative placement, but should rarely become absolute CSS.

## If The Helper Fails

- Missing token: ask the user to set `FIGMA_TOKEN`.
- 403: explain that the token needs read access to the file.
- Missing node ID: ask the user to copy a link to the selected frame/component when possible.
- Very large output: rerun with a smaller selected node or lower `--depth`.
