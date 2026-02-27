import { useCallback, useEffect, useRef, useState } from "react";
import type { ModelBinding } from "./SpecModeContext.js";
import { ConnectorLine } from "./ConnectorLine.js";

type DocModelCardProps = {
  bindings: ModelBinding[];
  sourceRect: DOMRect;
  pinned: boolean;
  onDismiss: () => void;
};

/**
 * Floating card that shows schema fields, GraphQL queries, and mutations
 * for the currently hovered/clicked editor component.
 */
export function DocModelCard({
  bindings,
  sourceRect,
  pinned,
  onDismiss,
}: DocModelCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Position: prefer right side of viewport, fall back to left
  const cardWidth = 400;
  const cardTop = Math.max(
    12,
    Math.min(
      sourceRect.top + sourceRect.height / 2 - 120,
      window.innerHeight - 320,
    ),
  );
  const spaceRight = window.innerWidth - sourceRect.right - 24;
  const cardLeft =
    spaceRight >= cardWidth + 16
      ? sourceRect.right + 24
      : sourceRect.left - cardWidth - 24;

  // Dismiss on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  const copyId = useCallback((modelId: string) => {
    void navigator.clipboard.writeText(modelId);
  }, []);

  return (
    <>
      <ConnectorLine sourceRect={sourceRect} targetRef={cardRef} />
      <div
        ref={cardRef}
        style={{
          position: "fixed",
          top: cardTop,
          left: cardLeft,
          width: cardWidth,
          zIndex: 9999,
          background: "#0f172a",
          border: "1px solid rgba(99,102,241,0.4)",
          borderRadius: 10,
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.4), 0 4px 16px rgba(99,102,241,0.15)",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize: 12,
          color: "#e2e8f0",
          overflow: "hidden",
          animation: "spec-card-in 120ms cubic-bezier(0.4,0,0.2,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{cardStyles}</style>

        {/* Header */}
        <div className="spec-card__header">
          <span className="spec-card__chip">SPEC MODE</span>
          {pinned && (
            <span className="spec-card__pinned">pinned · ESC to close</span>
          )}
          <button className="spec-card__close" onClick={onDismiss}>
            ✕
          </button>
        </div>

        {/* One section per model binding */}
        {bindings.map((binding, i) => (
          <ModelSection
            key={binding.modelId + i}
            binding={binding}
            onCopyId={copyId}
            isLast={i === bindings.length - 1}
          />
        ))}
      </div>
    </>
  );
}

function ModelSection({
  binding,
  onCopyId,
  isLast,
}: {
  binding: ModelBinding;
  onCopyId: (id: string) => void;
  isLast: boolean;
}) {
  const [copied, setCopied] = useClipboardFeedback();

  return (
    <div
      className="spec-card__model"
      style={{
        borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Model header */}
      <div className="spec-card__model-header">
        <div>
          <span className="spec-card__model-name">{binding.modelName}</span>
          <span className="spec-card__model-ext">{binding.extension}</span>
        </div>
        <button
          className="spec-card__copy-btn"
          title="Copy model ID"
          onClick={() => {
            onCopyId(binding.modelId);
            setCopied();
          }}
        >
          {copied ? "✓ copied" : "copy ID"}
        </button>
      </div>

      {/* Schema fields */}
      <div className="spec-card__section-label">SCHEMA FIELDS</div>
      <div className="spec-card__fields">
        {binding.fields.map((f) => (
          <div key={f.fieldPath} className="spec-card__field">
            <span className="spec-card__field-path">{f.fieldPath}</span>
            <span className="spec-card__field-type">{f.gqlType}</span>
          </div>
        ))}
      </div>

      {/* Read query */}
      <div className="spec-card__section-label">READ QUERY</div>
      <pre className="spec-card__query">{binding.readQuery}</pre>

      {/* Mutations */}
      <div className="spec-card__section-label">MUTATIONS</div>
      <div className="spec-card__mutations">
        {binding.mutations.map((m) => (
          <span key={m} className="spec-card__mutation-tag">
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Returns [copied, setCopied] — copied resets to false after 1.5s */
function useClipboardFeedback(): [boolean, () => void] {
  const [copied, setValue] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setCopied = useCallback(() => {
    setValue(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setValue(false), 1500);
  }, []);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  return [copied, setCopied];
}

const cardStyles = `
  @keyframes spec-card-in {
    from { opacity: 0; transform: translateX(8px) scale(0.97); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }

  .spec-card__header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: rgba(99,102,241,0.12);
    border-bottom: 1px solid rgba(99,102,241,0.2);
  }

  .spec-card__chip {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: rgba(165,180,252,1);
    background: rgba(99,102,241,0.2);
    padding: 2px 7px;
    border-radius: 100px;
  }

  .spec-card__pinned {
    font-size: 10px;
    color: rgba(148,163,184,0.7);
    flex: 1;
  }

  .spec-card__close {
    margin-left: auto;
    background: none;
    border: none;
    color: rgba(148,163,184,0.6);
    font-size: 11px;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
    line-height: 1;
  }

  .spec-card__close:hover { color: #e2e8f0; background: rgba(255,255,255,0.06); }

  .spec-card__model {
    padding: 12px;
  }

  .spec-card__model-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .spec-card__model-name {
    font-size: 13px;
    font-weight: 600;
    color: #f1f5f9;
    margin-right: 6px;
  }

  .spec-card__model-ext {
    font-size: 10px;
    color: rgba(99,102,241,0.9);
    font-family: 'DM Mono', monospace;
    background: rgba(99,102,241,0.12);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .spec-card__copy-btn {
    background: none;
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(148,163,184,0.8);
    font-size: 10px;
    cursor: pointer;
    padding: 3px 8px;
    border-radius: 4px;
    font-family: inherit;
    transition: all 100ms ease;
  }

  .spec-card__copy-btn:hover {
    border-color: rgba(99,102,241,0.5);
    color: rgba(165,180,252,1);
  }

  .spec-card__section-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: rgba(148,163,184,0.5);
    margin-bottom: 5px;
    margin-top: 10px;
  }

  .spec-card__fields {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .spec-card__field {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 3px 6px;
    background: rgba(255,255,255,0.03);
    border-radius: 4px;
    gap: 8px;
  }

  .spec-card__field-path {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #94a3b8;
  }

  .spec-card__field-type {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: rgba(52,211,153,0.8);
    flex-shrink: 0;
  }

  .spec-card__query {
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 6px;
    padding: 8px 10px;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: rgba(165,180,252,0.9);
    white-space: pre-wrap;
    word-break: break-all;
    margin: 0;
    max-height: 160px;
    overflow-y: auto;
    line-height: 1.5;
  }

  .spec-card__mutations {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding-bottom: 2px;
  }

  .spec-card__mutation-tag {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: rgba(251,191,36,0.85);
    background: rgba(251,191,36,0.08);
    border: 1px solid rgba(251,191,36,0.15);
    padding: 2px 7px;
    border-radius: 4px;
  }
`;
