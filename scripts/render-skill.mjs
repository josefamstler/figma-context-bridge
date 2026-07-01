#!/usr/bin/env node
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import process from "node:process"

const target = process.argv[2]
const outputPath = process.argv[3]

if (!target || !outputPath) {
  process.stderr.write("Usage: render-skill.mjs <opencode|claude> <output-path>\n")
  process.exit(1)
}

const targets = {
  opencode: {
    toolName: "OpenCode",
    restartNote: "Restart OpenCode after installing or updating this skill. OpenCode loads skills at startup.",
  },
  claude: {
    toolName: "Claude CLI",
    restartNote: "Restart Claude CLI/Claude Code after installing or updating this skill if it was already running.",
  },
}

const config = targets[target]
if (!config) {
  process.stderr.write(`Invalid target: ${target}. Expected opencode or claude.\n`)
  process.exit(1)
}

const rootDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..")
const templatePath = path.join(rootDir, "skill", "figma-design.SKILL.md.template")
const template = fs.readFileSync(templatePath, "utf8")

const rendered = template
  .replaceAll("{{TOOL_NAME}}", config.toolName)
  .replaceAll("{{TOOL_RESTART_NOTE}}", config.restartNote)

fs.mkdirSync(path.dirname(outputPath.replace(/^~/, os.homedir())), { recursive: true })
fs.writeFileSync(outputPath.replace(/^~/, os.homedir()), rendered)
