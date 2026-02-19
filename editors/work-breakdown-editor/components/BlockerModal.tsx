import { useState } from "react";
import type {
  Task,
  Prerequisite,
} from "../../../document-models/work-breakdown/gen/schema/types.js";

interface Props {
  taskName: string;
  tasks: Task[];
  prerequisites: Prerequisite[];
  /** Currently selected item won't appear in the list */
  currentItemId: string;
  onConfirm: (reason: string, blockedByItemId: string | null) => void;
  onCancel: () => void;
}

export function BlockerModal({
  taskName,
  tasks,
  prerequisites,
  currentItemId,
  onConfirm,
  onCancel,
}: Props) {
  const [reason, setReason] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const linkableItems: Array<{
    id: string;
    name: string;
    type: "TASK" | "CHECKPOINT";
  }> = [
    ...tasks
      .filter((t) => t.id !== currentItemId)
      .map((t) => ({ id: t.id, name: t.name, type: "TASK" as const })),
    ...prerequisites.map((p) => ({
      id: p.id,
      name: p.name,
      type: "CHECKPOINT" as const,
    })),
  ];

  function handleConfirm() {
    onConfirm(reason.trim(), selectedItemId);
  }

  return (
    <div className="wbg-modal-overlay" onClick={onCancel}>
      <div className="wbg-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wbg-modal__header wbg-modal__header--blocked">
          <div className="wbg-modal__header-left">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
            <span className="wbg-modal__title">MARK AS BLOCKED</span>
          </div>
          <button className="wbg-modal__close" onClick={onCancel} type="button">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="wbg-modal__task-name">{taskName}</div>

        <div className="wbg-modal__body">
          <label className="wbg-modal__label">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            REASON FOR BLOCKAGE
          </label>
          <textarea
            className="wbg-modal__textarea"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe why this item is blocked..."
          />

          <label className="wbg-modal__label" style={{ marginTop: 20 }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            LINK INTERNAL ITEM (OPTIONAL)
          </label>

          <div className="wbg-modal__item-list">
            {/* External / info only option */}
            <button
              className={`wbg-modal__item ${selectedItemId === null ? "wbg-modal__item--selected" : ""}`}
              onClick={() => setSelectedItemId(null)}
              type="button"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <div className="wbg-modal__item-info">
                <span className="wbg-modal__item-name">
                  INFORMATION ONLY / EXTERNAL
                </span>
              </div>
            </button>

            {linkableItems.map((item) => (
              <button
                key={item.id}
                className={`wbg-modal__item ${selectedItemId === item.id ? "wbg-modal__item--selected" : ""}`}
                onClick={() => setSelectedItemId(item.id)}
                type="button"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  {item.type === "TASK" ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  )}
                </svg>
                <div className="wbg-modal__item-info">
                  <span className="wbg-modal__item-name">{item.name}</span>
                  <span className="wbg-modal__item-type">{item.type}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="wbg-modal__footer">
          <button
            className="wbg-btn wbg-btn--ghost"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="wbg-btn wbg-btn--danger"
            onClick={handleConfirm}
            type="button"
          >
            Confirm Blockage
          </button>
        </div>
      </div>
    </div>
  );
}
