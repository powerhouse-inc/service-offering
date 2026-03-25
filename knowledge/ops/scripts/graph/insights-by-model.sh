#!/usr/bin/env bash
# Count insights that affect each document model
echo "=== Insights by Document Model ==="
for model in ServiceOffering SubscriptionInstance ResourceTemplate ResourceInstance Facet; do
  count=$(rg -l "$model" knowledge/insights/ 2>/dev/null | wc -l)
  printf "  %-25s %d\n" "$model" "$count"
done
