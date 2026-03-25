#!/usr/bin/env bash
# Find insights that are not linked from any other file (orphans)
echo "=== Orphan Insights (no incoming links) ==="
for file in knowledge/insights/*.md; do
  [ -f "$file" ] || continue
  basename=$(basename "$file" .md)
  [ "$basename" = "index" ] || [ "$basename" = "CLAUDE" ] && continue
  # Check if this insight is linked from anywhere
  if ! rg -q "\[\[$basename\]\]" knowledge/ --glob '!'"$file" 2>/dev/null; then
    echo "  $basename"
  fi
done
