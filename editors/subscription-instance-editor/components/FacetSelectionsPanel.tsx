import type { SubscriptionInstanceDocument } from "@powerhousedao/service-offering/document-models/subscription-instance";
import type { ViewMode } from "../types.js";

interface FacetSelectionsPanelProps {
  document: SubscriptionInstanceDocument;
  mode: ViewMode;
}

export function FacetSelectionsPanel({ document }: FacetSelectionsPanelProps) {
  const state = document.state.global;
  const facets = state.facetSelections;

  if (facets.length === 0) return null;

  return (
    <div className="si-panel si-panel--compact">
      <div className="si-panel__header">
        <h3 className="si-panel__title">Facet Selections</h3>
      </div>
      <div className="si-customer-info">
        {facets.map((facet) => (
          <div key={facet.id} className="si-customer-info__section">
            <div
              className="si-customer-info__row"
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 6,
              }}
            >
              <span className="si-customer-info__label">
                {facet.categoryLabel}
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {facet.selectedOptions.map((opt) => (
                  <span
                    key={opt}
                    className="si-badge si-badge--sm si-badge--slate"
                  >
                    {opt}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
