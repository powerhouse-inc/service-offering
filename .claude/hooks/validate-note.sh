#!/usr/bin/env bash
# Validate note hook — runs after Write tool
# Checks that notes written to knowledge/ have valid frontmatter

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VAULT="$REPO_ROOT/knowledge"
MARKER="$VAULT/.arscontexta"

[ -f "$MARKER" ] || exit 0

# Get the file that was just written from the tool input
FILE="${CLAUDE_TOOL_INPUT_FILE_PATH:-}"
[ -z "$FILE" ] && exit 0

# Only validate files inside knowledge/insights/ or knowledge/inbox/
case "$FILE" in
  */knowledge/insights/*.md|*/knowledge/inbox/*.md) ;;
  *) exit 0 ;;
esac

# Skip CLAUDE.md and index.md
BASENAME=$(basename "$FILE")
case "$BASENAME" in
  CLAUDE.md|index.md) exit 0 ;;
esac

# Check for YAML frontmatter
if ! head -1 "$FILE" | grep -q '^---'; then
  echo "WARNING: $BASENAME is missing YAML frontmatter"
  exit 0
fi

# Check for summary field
if ! grep -q '^summary:' "$FILE"; then
  echo "WARNING: $BASENAME is missing 'summary' field in frontmatter"
fi

# Check for topics field (insights only)
case "$FILE" in
  */knowledge/insights/*.md)
    if ! grep -q '^topics:' "$FILE" && ! grep -q '^type: moc' "$FILE"; then
      echo "WARNING: $BASENAME is missing 'topics' field — insight may become orphaned"
    fi
    ;;
esac

exit 0
