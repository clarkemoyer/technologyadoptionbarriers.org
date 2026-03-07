#!/bin/bash
set -euo pipefail

# Only run in remote (web) sessions
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Install dependencies if node_modules is missing
if [ ! -d "$CLAUDE_PROJECT_DIR/node_modules" ]; then
  cd "$CLAUDE_PROJECT_DIR"
  npm install
fi

# Install Playwright browsers if missing
if ! npx playwright install --dry-run chromium >/dev/null 2>&1; then
  npx playwright install --with-deps chromium
fi

# Load .env file and export variables to the session via CLAUDE_ENV_FILE
if [ -n "${CLAUDE_ENV_FILE:-}" ] && [ -f "$CLAUDE_PROJECT_DIR/.env" ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    # Skip empty lines and comments
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    # Export the variable
    echo "export $line" >> "$CLAUDE_ENV_FILE"
  done < "$CLAUDE_PROJECT_DIR/.env"
fi
