#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLI_DIR="$ROOT_DIR/figma-inspect"
BIN_DIR="$HOME/.local/bin"
BIN_PATH="$BIN_DIR/figma-inspect"
OPENCODE_SKILL_DIR="$HOME/.config/opencode/skills/figma-design"
FIGMA_CONFIG_DIR="$HOME/.config/figma-inspect"
FIGMA_ENV_FILE="$FIGMA_CONFIG_DIR/env"

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  if [ -s "$HOME/.nvm/nvm.sh" ]; then
    # shellcheck disable=SC1090
    source "$HOME/.nvm/nvm.sh"
  fi
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js >= 18 is required. Install Node or nvm first." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required. Install npm or load nvm first." >&2
  exit 1
fi

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "Node.js >= 18 is required. Current version: $(node --version)" >&2
  exit 1
fi

echo "Installing figma-inspect dependencies..."
npm --prefix "$CLI_DIR" install

echo "Building figma-inspect..."
npm --prefix "$CLI_DIR" run build

echo "Installing figma-inspect command to $BIN_PATH..."
mkdir -p "$BIN_DIR"
cat > "$BIN_PATH" <<EOF
#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="\$HOME/.config/figma-inspect/env"
if [ -f "\$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  source "\$ENV_FILE"
fi

if ! command -v node >/dev/null 2>&1; then
  if [ -s "\$HOME/.nvm/nvm.sh" ]; then
    # shellcheck disable=SC1090
    source "\$HOME/.nvm/nvm.sh"
  fi
fi

if ! command -v node >/dev/null 2>&1; then
  echo "figma-inspect: node is required. Install Node or load nvm first." >&2
  exit 1
fi

exec node "$CLI_DIR/dist/index.js" "\$@"
EOF
chmod +x "$BIN_PATH"

echo "Installing OpenCode figma-design skill..."
mkdir -p "$OPENCODE_SKILL_DIR"
cp "$ROOT_DIR/opencode/skills/figma-design/SKILL.md" "$OPENCODE_SKILL_DIR/SKILL.md"

echo "Preparing Figma token env file..."
mkdir -p "$FIGMA_CONFIG_DIR"
if [ ! -f "$FIGMA_ENV_FILE" ]; then
  cp "$ROOT_DIR/examples/figma-env.example" "$FIGMA_ENV_FILE"
  chmod 600 "$FIGMA_ENV_FILE"
  echo "Created $FIGMA_ENV_FILE"
else
  chmod 600 "$FIGMA_ENV_FILE"
  echo "Kept existing $FIGMA_ENV_FILE"
fi

cat <<EOF

Installed successfully.

Next steps:
1. Edit $FIGMA_ENV_FILE and set your real read-only Figma token.
2. Ensure $BIN_DIR is in your PATH.
3. Restart OpenCode so it loads the figma-design skill.

Test command:
  figma-inspect --help

Normal OpenCode prompt:
  Implement this component from Figma:
  https://www.figma.com/design/FILE_KEY/name?node-id=12-34
EOF
