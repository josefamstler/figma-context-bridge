#!/usr/bin/env node
import process from "node:process"

const mode = process.argv[2] === "uninstall" ? "Uninstall" : "Install"
const nonInteractive = process.argv.find((arg) => arg.startsWith("--target="))

const options = [
  { label: "OpenCode", value: "opencode" },
  { label: "Claude CLI", value: "claude" },
]

if (nonInteractive) {
  const value = nonInteractive.slice("--target=".length).toLowerCase()
  if (!options.some((option) => option.value === value)) {
    process.stderr.write(`Invalid target: ${value}. Expected opencode or claude.\n`)
    process.exit(1)
  }
  process.stdout.write(`${value}\n`)
  process.exit(0)
}

if (!process.stdin.isTTY || !process.stdout.isTTY) {
  process.stderr.write("No interactive terminal detected. Pass --target=opencode or --target=claude.\n")
  process.exit(1)
}

let selected = 0

function render() {
  process.stderr.write("\x1b[?25l")
  process.stderr.write("\x1b[2K\r")
  process.stderr.write(`? ${mode} integration for:\n`)
  for (let i = 0; i < options.length; i++) {
    const marker = i === selected ? "❯" : " "
    process.stderr.write(`${marker} ${options[i].label}\n`)
  }
  process.stderr.write(`\x1b[${options.length}A`)
}

function cleanup() {
  process.stdin.setRawMode(false)
  process.stdin.pause()
  process.stderr.write(`\x1b[${options.length}B`)
  process.stderr.write("\x1b[?25h")
}

process.stdin.setRawMode(true)
process.stdin.resume()
process.stdin.setEncoding("utf8")
render()

process.stdin.on("data", (key) => {
  if (key === "\u0003") {
    cleanup()
    process.exit(130)
  }

  if (key === "\r" || key === "\n") {
    const value = options[selected].value
    cleanup()
    process.stdout.write(`${value}\n`)
    process.exit(0)
  }

  if (key === "\u001b[A") {
    selected = (selected + options.length - 1) % options.length
    render()
  }

  if (key === "\u001b[B") {
    selected = (selected + 1) % options.length
    render()
  }
})
