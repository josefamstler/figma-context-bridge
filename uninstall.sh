#!/usr/bin/env bash
set -euo pipefail

REMOVE_TOKEN_FILE=false
if [ "${1:-}" = "--remove-token-file" ]; then
  REMOVE_TOKEN_FILE=true
fi

BIN_PATH="$HOME/.local/bin/figma-inspect"
OPENCODE_SKILL_DIR="$HOME/.config/opencode/skills/figma-design"
FIGMA_ENV_FILE="$HOME/.config/figma-inspect/env"

rm -f "$BIN_PATH"
rm -rf "$OPENCODE_SKILL_DIR"

if [ "$REMOVE_TOKEN_FILE" = true ]; then
  rm -f "$FIGMA_ENV_FILE"
  echo "Removed token file: $FIGMA_ENV_FILE"
else
  echo "Kept token file: $FIGMA_ENV_FILE"
fi

cat <<EOF
Uninstalled figma-opencode-integration.

Removed:
- $BIN_PATH
- $OPENCODE_SKILL_DIR

Restart OpenCode for skill removal to take effect.
EOF
