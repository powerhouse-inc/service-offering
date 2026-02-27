import { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };

type ConnectorLineProps = {
  sourceRect: DOMRect;
  targetRef: React.RefObject<HTMLDivElement | null>;
};

/**
 * Renders an SVG connector line between the hovered/clicked editor element
 * and the floating DocModelCard. Positioned fixed over the viewport.
 */
export function ConnectorLine({ sourceRect, targetRef }: ConnectorLineProps) {
  const [points, setPoints] = useState<{ from: Point; to: Point } | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      const cardEl = targetRef.current;
      if (!cardEl) return;

      const cardRect = cardEl.getBoundingClientRect();

      // Source: right-center of the highlighted element
      const from: Point = {
        x: sourceRect.right,
        y: sourceRect.top + sourceRect.height / 2,
      };

      // Target: left-center of the card
      const to: Point = {
        x: cardRect.left,
        y: cardRect.top + cardRect.height / 2,
      };

      setPoints({ from, to });
      animFrameRef.current = requestAnimationFrame(update);
    };

    animFrameRef.current = requestAnimationFrame(update);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [sourceRect, targetRef]);

  if (!points) return null;

  const { from, to } = points;
  const dx = to.x - from.x;
  const cy1 = from.y;
  const cy2 = to.y;
  const cx1 = from.x + dx * 0.4;
  const cx2 = to.x - dx * 0.4;

  const d = `M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`;

  return (
    <svg
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9998,
        overflow: "visible",
      }}
    >
      <defs>
        <marker
          id="spec-arrowhead"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L8,3 z" fill="rgba(99,102,241,0.7)" />
        </marker>
      </defs>
      <path
        d={d}
        fill="none"
        stroke="rgba(99,102,241,0.6)"
        strokeWidth="1.5"
        strokeDasharray="6 3"
        markerEnd="url(#spec-arrowhead)"
      />
      {/* Source dot */}
      <circle cx={from.x} cy={from.y} r="4" fill="rgba(99,102,241,0.8)" />
    </svg>
  );
}
