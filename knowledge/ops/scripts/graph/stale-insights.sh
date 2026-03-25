#!/usr/bin/env bash
# Find insights with status 'open' that haven't been modified in 30+ days
echo "=== Stale Insights (open, not modified in 30+ days) ==="
THRESHOLD=$(date -d '30 days ago' +%s 2>/dev/null || date -v-30d +%s 2>/dev/null)
for file in knowledge/insights/*.md; do
  [ -f "$file" ] || continue
  basename=$(basename "$file" .md)
  [ "$basename" = "index" ] || [ "$basename" = "CLAUDE" ] && continue
  # Check status
  if rg -q '^status: open' "$file" 2>/dev/null; then
    mod_time=$(stat -c %Y "$file" 2>/dev/null || stat -f %m "$file" 2>/dev/null)
    if [ "$mod_time" -lt "$THRESHOLD" ] 2>/dev/null; then
      echo "  $basename ($(date -d @$mod_time +%Y-%m-%d 2>/dev/null || date -r $mod_time +%Y-%m-%d))"
    fi
  fi
done
