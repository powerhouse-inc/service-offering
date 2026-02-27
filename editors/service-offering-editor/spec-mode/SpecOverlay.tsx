import { createPortal } from "react-dom";
import { useSpecMode } from "./SpecModeContext.js";
import { DocModelCard } from "./DocModelCard.js";

/**
 * Renders the floating DocModelCard into a portal at document.body level,
 * so it's never clipped by editor overflow/z-index.
 */
export function SpecOverlay() {
  const { isActive, activeTarget, clearTarget } = useSpecMode();

  if (!isActive || !activeTarget) return null;

  return createPortal(
    <DocModelCard
      bindings={activeTarget.bindings}
      sourceRect={activeTarget.rect}
      pinned={activeTarget.pinned}
      onDismiss={clearTarget}
    />,
    document.body,
  );
}
