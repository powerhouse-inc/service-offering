#!/usr/bin/env bash
# Count insights grouped by type (decision, idea, pattern, context, solution)
echo "=== Insights by Type ==="
for type in decision idea pattern context solution; do
  count=$(rg -c "^type: $type" knowledge/insights/ 2>/dev/null | wc -l)
  printf "  %-12s %d\n" "$type" "$count"
done
