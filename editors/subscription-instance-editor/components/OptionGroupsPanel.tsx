import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  SubscriptionInstanceAction,
  SubscriptionInstanceDocument,
} from "@powerhousedao/service-offering/document-models/subscription-instance";
import type { ViewMode } from "../types.js";
import type { SelectedOptionGroup } from "../../../document-models/subscription-instance/gen/schema/types.js";
import { removeSelectedOptionGroup } from "../../../document-models/subscription-instance/gen/option-group/creators.js";
import { createClientRequest } from "../../../document-models/subscription-instance/gen/requests/creators.js";

interface OptionGroupsPanelProps {
  document: SubscriptionInstanceDocument;
  dispatch: DocumentDispatch<SubscriptionInstanceAction>;
  mode: ViewMode;
}

function OptionGroupCard({
  group,
  mode,
  onRemove,
}: {
  group: SelectedOptionGroup;
  mode: ViewMode;
  onRemove: (id: string) => void;
}) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  const billingCycleLabels: Record<string, string> = {
    MONTHLY: "/mo",
    ANNUAL: "/yr",
    QUARTERLY: "/qtr",
    SEMI_ANNUAL: "/6mo",
    ONE_TIME: "",
  };

  return (
    <div className="si-service-card">
      <div className="si-service-card__header">
        <h4 className="si-service-card__name">{group.name}</h4>
        <div className="si-service-card__header-right">
          {group.isAddOn && (
            <span className="si-badge si-badge--sm si-badge--violet">
              Add-on
            </span>
          )}
          {group.price != null && group.currency && (
            <span className="si-service-card__price">
              {formatCurrency(group.price, group.currency)}
              {group.billingCycle &&
                (billingCycleLabels[group.billingCycle] || "")}
            </span>
          )}
        </div>
      </div>
      {group.costType && (
        <div
          style={{
            fontSize: "0.8125rem",
            color: "var(--si-slate-500)",
            marginBottom: 4,
          }}
        >
          Cost type: {group.costType.replace(/_/g, " ").toLowerCase()}
        </div>
      )}
      {mode === "client" && (
        <div className="si-service-card__actions">
          <button
            type="button"
            className="si-btn si-btn--xs si-btn--danger-ghost"
            onClick={() => onRemove(group.id)}
          >
            Request Removal
          </button>
        </div>
      )}
    </div>
  );
}

export function OptionGroupsPanel({
  document,
  dispatch,
  mode,
}: OptionGroupsPanelProps) {
  const state = document.state.global;
  const groups = state.selectedOptionGroups;

  if (groups.length === 0) return null;

  const handleRemove = (id: string) => {
    if (mode === "operator") {
      dispatch(removeSelectedOptionGroup({ id }));
    } else {
      const group = groups.find((g) => g.id === id);
      dispatch(
        createClientRequest({
          id: generateId(),
          type: "REMOVE_OPTION",
          description: `Request to remove option: ${group?.name || "Unknown"}`,
          createdAt: new Date().toISOString(),
          optionGroupId: id,
          optionGroupName: group?.name || undefined,
        }),
      );
    }
  };

  return (
    <div className="si-panel">
      <div className="si-panel__header">
        <h3 className="si-panel__title">Selected Options</h3>
        <span className="si-panel__count">{groups.length} selected</span>
      </div>
      <div className="si-services-grid">
        {groups.map((group) => (
          <OptionGroupCard
            key={group.id}
            group={group}
            mode={mode}
            onRemove={handleRemove}
          />
        ))}
      </div>
    </div>
  );
}
