#!/usr/bin/env bash
set -euo pipefail

BIN_DIR="$HOME/.local/bin"
NODE_SRC="/Applications/Cursor.app/Contents/Resources/app/resources/helpers/node"
PNPM_VERSION="9.15.4"
PNPM_URL="https://github.com/pnpm/pnpm/releases/download/v${PNPM_VERSION}/pnpm-macos-arm64"

mkdir -p "$BIN_DIR"

if [[ ! -x "$NODE_SRC" ]]; then
  echo "Node not found at $NODE_SRC"
  echo "Install Node.js 20+ from https://nodejs.org/ then run: corepack enable && corepack prepare pnpm@9.15.4 --activate"
  exit 1
fi

ln -sf "$NODE_SRC" "$BIN_DIR/node"

if [[ ! -x "$BIN_DIR/pnpm" ]]; then
  echo "Downloading pnpm ${PNPM_VERSION}..."
  curl -fsSL -o "$BIN_DIR/pnpm" "$PNPM_URL"
  chmod +x "$BIN_DIR/pnpm"
fi

ZSHRC="$HOME/.zshrc"
PATH_LINE='export PATH="$HOME/.local/bin:$PATH"'
if [[ ! -f "$ZSHRC" ]] || ! grep -q '.local/bin' "$ZSHRC" 2>/dev/null; then
  echo "$PATH_LINE" >> "$ZSHRC"
  echo "Updated $ZSHRC"
fi

export PATH="$BIN_DIR:$PATH"
echo "Node: $(node -v)"
echo "pnpm: $(pnpm -v)"
echo ""
echo "Done. Restart your terminal or run: source ~/.zshrc"
