#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REMOVE_TOKEN_FILE=false
REMOVE_CLI=false
TARGET_ARG=""

for arg in "$@"; do
  case "$arg" in
    --target=opencode|--target=claude)
      TARGET_ARG="$arg"
      ;;
    --remove-token-file)
      REMOVE_TOKEN_FILE=true
      ;;
    --remove-cli)
      REMOVE_CLI=true
      ;;
    *)
      echo "Unknown option: $arg" >&2
      echo "Usage: ./uninstall.sh [--target=opencode|--target=claude] [--remove-cli] [--remove-token-file]" >&2
      exit 1
      ;;
  esac
done

if ! command -v node >/dev/null 2>&1; then
  if [ -s "$HOME/.nvm/nvm.sh" ]; then
    # shellcheck disable=SC1090
    source "$HOME/.nvm/nvm.sh"
  fi
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required for the interactive selector. Install Node, load nvm, or pass --target=opencode/--target=claude after loading Node." >&2
  exit 1
fi

TARGET="$(node "$ROOT_DIR/scripts/select-target.mjs" uninstall ${TARGET_ARG:+"$TARGET_ARG"})"

case "$TARGET" in
  opencode)
    TOOL_NAME="OpenCode"
    SKILL_DIR="$HOME/.config/opencode/skills/figma-design"
    ;;
  claude)
    TOOL_NAME="Claude CLI"
    SKILL_DIR="$HOME/.claude/skills/figma-design"
    ;;
  *)
    echo "Invalid target: $TARGET" >&2
    exit 1
    ;;
esac

BIN_PATH="$HOME/.local/bin/figma-inspect"
FIGMA_ENV_FILE="$HOME/.config/figma-inspect/env"

rm -rf "$SKILL_DIR"
echo "Removed $TOOL_NAME skill: $SKILL_DIR"

if [ "$REMOVE_CLI" = true ]; then
  rm -f "$BIN_PATH"
  echo "Removed CLI wrapper: $BIN_PATH"
else
  echo "Kept CLI wrapper: $BIN_PATH"
fi

if [ "$REMOVE_TOKEN_FILE" = true ]; then
  rm -f "$FIGMA_ENV_FILE"
  echo "Removed token file: $FIGMA_ENV_FILE"
else
  echo "Kept token file: $FIGMA_ENV_FILE"
fi

cat <<EOF

Uninstalled figma-context-bridge for $TOOL_NAME.

Restart $TOOL_NAME if it was already running.
EOF
