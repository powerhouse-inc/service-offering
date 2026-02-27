import { useCallback, useRef } from "react";
import type { ModelBinding } from "./SpecModeContext.js";
import { useSpecMode } from "./SpecModeContext.js";

type SpecTargetProps = {
  id: string;
  bindings: ModelBinding[];
  children: React.ReactNode;
  /** Optional extra className on the wrapper div */
  className?: string;
};

/**
 * Wraps any editor component to make it annotatable in spec mode.
 * In live mode this is a transparent passthrough — zero overhead.
 */
export function SpecTarget({
  id,
  bindings,
  children,
  className,
}: SpecTargetProps) {
  const { isActive, activeTarget, setHover, setClick, clearTarget } =
    useSpecMode();
  const ref = useRef<HTMLDivElement>(null);
  const isSelected = activeTarget?.id === id;

  const getRect = useCallback((): DOMRect | null => {
    return ref.current?.getBoundingClientRect() ?? null;
  }, []);

  if (!isActive) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={`spec-target ${className ?? ""}`}
      style={{
        position: "relative",
        outline: isSelected
          ? "2px solid rgba(99, 102, 241, 0.9)"
          : "2px dashed rgba(99, 102, 241, 0.4)",
        outlineOffset: "3px",
        borderRadius: "6px",
        cursor: "pointer",
        transition: "outline 120ms ease, background 120ms ease",
        background: isSelected ? "rgba(99, 102, 241, 0.06)" : undefined,
        boxShadow: isSelected
          ? "0 0 0 4px rgba(99, 102, 241, 0.12)"
          : undefined,
      }}
      onMouseEnter={() => {
        const rect = getRect();
        if (rect) setHover(id, rect, bindings);
      }}
      onMouseLeave={() => clearTarget()}
      onClick={(e) => {
        e.stopPropagation();
        const rect = getRect();
        if (rect) setClick(id, rect, bindings);
      }}
    >
      {children}
    </div>
  );
}
