#!/usr/bin/env bash
# Session capture hook — runs at session end
# Archives session data for continuity

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VAULT="$REPO_ROOT/knowledge"
MARKER="$VAULT/.arscontexta"

[ -f "$MARKER" ] || exit 0

SESSION_FILE="$VAULT/ops/sessions/current.json"
[ -f "$SESSION_FILE" ] || exit 0

# Read session capture setting
CAPTURE=$(grep -oP 'session_capture:\s*\K\w+' "$MARKER" 2>/dev/null || echo "true")
[ "$CAPTURE" = "false" ] && exit 0

# Update last activity
if command -v jq &>/dev/null; then
  TEMP=$(mktemp)
  jq --arg ts "$(date -Iseconds)" '.last_activity = $ts' "$SESSION_FILE" > "$TEMP" && mv "$TEMP" "$SESSION_FILE"
fi

# Archive session
ARCHIVE_DIR="$VAULT/ops/sessions"
ARCHIVE_FILE="$ARCHIVE_DIR/$(date +%Y%m%d-%H%M%S).json"
cp "$SESSION_FILE" "$ARCHIVE_FILE" 2>/dev/null || true

echo "Session captured to $ARCHIVE_FILE"
