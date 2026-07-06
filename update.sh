#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLI_DIR="$ROOT_DIR/figma-inspect"
BIN_PATH="$HOME/.local/bin/figma-inspect"
TARGET_ARG=""

for arg in "$@"; do
  case "$arg" in
    --target=opencode|--target=claude)
      TARGET_ARG="$arg"
      ;;
    *)
      echo "Unknown option: $arg" >&2
      echo "Usage: ./update.sh [--target=opencode|--target=claude]" >&2
      exit 1
      ;;
  esac
done

if ! command -v node >/dev/null 2>&1 || ! command -v pnpm >/dev/null 2>&1; then
  if [ -s "$HOME/.nvm/nvm.sh" ]; then
    # shellcheck disable=SC1090
    source "$HOME/.nvm/nvm.sh"
  fi
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js >= 18 is required. Install Node or nvm first." >&2
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm is required. Install pnpm or load nvm first." >&2
  exit 1
fi

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "Node.js >= 18 is required. Current version: $(node --version)" >&2
  exit 1
fi

TARGET="$(node "$ROOT_DIR/scripts/select-target.mjs" update ${TARGET_ARG:+"$TARGET_ARG"})"

case "$TARGET" in
  opencode)
    TOOL_NAME="OpenCode"
    SKILL_DIR="$HOME/.config/opencode/skills/figma-design"
    RESTART_NOTE="Restart OpenCode so it loads the updated figma-design skill."
    ;;
  claude)
    TOOL_NAME="Claude CLI"
    SKILL_DIR="$HOME/.claude/skills/figma-design"
    RESTART_NOTE="Restart Claude CLI/Claude Code if it was already running."
    ;;
  *)
    echo "Invalid target: $TARGET" >&2
    exit 1
    ;;
esac

echo "Updating figma-inspect dependencies..."
pnpm --dir "$CLI_DIR" install

echo "Building figma-inspect..."
pnpm --dir "$CLI_DIR" run build

if [ ! -x "$BIN_PATH" ]; then
  echo "Warning: CLI wrapper not found at $BIN_PATH. Run ./install.sh if figma-inspect is not on your PATH." >&2
fi

echo "Replacing $TOOL_NAME figma-design skill..."
mkdir -p "$SKILL_DIR"
node "$ROOT_DIR/scripts/render-skill.mjs" "$TARGET" "$SKILL_DIR/SKILL.md"

cat <<EOF

Updated figma-context-bridge for $TOOL_NAME.

Updated:
1. figma-inspect dependencies and build output.
2. $TOOL_NAME figma-design skill at $SKILL_DIR/SKILL.md.

Kept your Figma token env file unchanged.

Next step:
1. $RESTART_NOTE
EOF
