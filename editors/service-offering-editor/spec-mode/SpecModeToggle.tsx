import { useSpecMode } from "./SpecModeContext.js";

/**
 * Toggle button for entering/exiting spec mode.
 * Designed to sit in the editor toolbar/header row.
 */
export function SpecModeToggle() {
  const { isActive, toggle } = useSpecMode();

  return (
    <button
      onClick={toggle}
      title={
        isActive
          ? "Exit spec mode"
          : "Enter spec mode — inspect schema bindings"
      }
      style={{
        position: "fixed",
        top: 12,
        right: 12,
        zIndex: 9000,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        fontFamily: "inherit",
        fontSize: 12,
        fontWeight: 600,
        borderRadius: 6,
        border: isActive
          ? "1.5px solid rgba(99,102,241,0.6)"
          : "1.5px solid rgba(100,116,139,0.25)",
        background: isActive ? "rgba(99,102,241,0.12)" : "rgba(248,250,252,1)",
        color: isActive ? "rgba(99,102,241,1)" : "#475569",
        cursor: "pointer",
        transition: "all 150ms cubic-bezier(0.4,0,0.2,1)",
        letterSpacing: "0.01em",
        userSelect: "none",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      {/* Spec icon: stacked lines with a dot connector */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        style={{ flexShrink: 0 }}
      >
        <rect
          x="1"
          y="2"
          width="5"
          height="4"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <rect
          x="1"
          y="8"
          width="5"
          height="4"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <rect
          x="8"
          y="4.5"
          width="5"
          height="5"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <line
          x1="6"
          y1="4"
          x2="8"
          y2="5.5"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="1.5 1"
        />
        <line
          x1="6"
          y1="10"
          x2="8"
          y2="8.5"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="1.5 1"
        />
      </svg>
      {isActive ? "Exit Spec" : "Spec Mode"}
      {isActive && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "rgba(99,102,241,0.8)",
            animation: "spec-pulse 1.5s ease-in-out infinite",
          }}
        />
      )}
      <style>{`
        @keyframes spec-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </button>
  );
}
