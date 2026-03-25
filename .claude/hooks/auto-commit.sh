#!/usr/bin/env bash
# Auto-commit hook — runs after Write tool (async)
# Commits knowledge/ changes to git automatically

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VAULT="$REPO_ROOT/knowledge"
MARKER="$VAULT/.arscontexta"

[ -f "$MARKER" ] || exit 0

# Check git setting in marker
GIT_ENABLED=$(grep -oP 'git:\s*\K\w+' "$MARKER" 2>/dev/null || echo "true")
[ "$GIT_ENABLED" = "false" ] && exit 0

# Get the file that was just written
FILE="${CLAUDE_TOOL_INPUT_FILE_PATH:-}"
[ -z "$FILE" ] && exit 0

# Only auto-commit files inside knowledge/
case "$FILE" in
  */knowledge/*) ;;
  *) exit 0 ;;
esac

cd "$REPO_ROOT"

# Check if there are knowledge/ changes to commit
if git diff --quiet knowledge/ && git diff --cached --quiet knowledge/; then
  # Check for untracked files in knowledge/
  UNTRACKED=$(git ls-files --others --exclude-standard knowledge/ 2>/dev/null)
  [ -z "$UNTRACKED" ] && exit 0
fi

# Stage and commit knowledge/ changes only
git add knowledge/
git commit -m "knowledge: auto-capture $(date +%Y-%m-%d)" --no-verify 2>/dev/null || true
