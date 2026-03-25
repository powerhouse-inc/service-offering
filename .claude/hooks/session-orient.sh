#!/usr/bin/env bash
# Session orientation hook — runs at session start
# Reads vault state and surfaces context for the agent

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VAULT="$REPO_ROOT/knowledge"
MARKER="$VAULT/.arscontexta"

# Only run if vault marker exists in knowledge/
[ -f "$MARKER" ] || exit 0

# Session ID from environment or timestamp
SESSION_ID="${CLAUDE_CONVERSATION_ID:-$(date +%Y%m%d-%H%M%S)}"
SESSION_FILE="$VAULT/ops/sessions/current.json"

# Create/update session file
mkdir -p "$VAULT/ops/sessions"
cat > "$SESSION_FILE" << EOF
{
  "session_id": "$SESSION_ID",
  "start_time": "$(date -Iseconds)",
  "notes_created": [],
  "notes_modified": [],
  "discoveries": [],
  "last_activity": "$(date -Iseconds)"
}
EOF

# Count vault state for orientation
INSIGHT_COUNT=$(find "$VAULT/insights" -name '*.md' ! -name 'index.md' ! -name 'CLAUDE.md' 2>/dev/null | wc -l)
INBOX_COUNT=$(find "$VAULT/inbox" -name '*.md' 2>/dev/null | wc -l)
OBS_COUNT=$(find "$VAULT/ops/observations" -name '*.md' 2>/dev/null | wc -l)

echo "Knowledge vault: $INSIGHT_COUNT insights, $INBOX_COUNT inbox items, $OBS_COUNT observations"
