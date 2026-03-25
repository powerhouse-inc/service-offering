#!/usr/bin/env bash
# Find insights that reference multiple document models (integration points)
echo "=== Cross-Model Insights ==="
for file in knowledge/insights/*.md; do
  [ -f "$file" ] || continue
  basename=$(basename "$file" .md)
  [ "$basename" = "index" ] || [ "$basename" = "CLAUDE" ] && continue
  models_found=0
  models=""
  for model in ServiceOffering SubscriptionInstance ResourceTemplate ResourceInstance Facet; do
    if rg -q "$model" "$file" 2>/dev/null; then
      models_found=$((models_found + 1))
      models="$models $model"
    fi
  done
  if [ "$models_found" -ge 2 ]; then
    echo "  $basename →$models"
  fi
done
