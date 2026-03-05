import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import "./MarkdownPreview.css";

interface ExpandButtonProps {
  shouldTruncate: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

function ExpandButton({
  shouldTruncate,
  isExpanded,
  onToggle,
}: ExpandButtonProps) {
  if (!shouldTruncate) return null;
  return (
    <button
      type="button"
      onClick={onToggle}
      className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
    >
      {isExpanded ? (
        <>
          Show less <ChevronUp size={16} />
        </>
      ) : (
        <>
          Read more <ChevronDown size={16} />
        </>
      )}
    </button>
  );
}

interface MarkdownPreviewProps {
  content: string;
  maxLength?: number;
  className?: string;
}

export function MarkdownPreview({
  content,
  maxLength = 300,
  className = "",
}: MarkdownPreviewProps) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [MarkdownRenderer, setMarkdownRenderer] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const shouldTruncate = content.length > maxLength;
  const displayContent =
    shouldTruncate && !isExpanded
      ? content.slice(0, maxLength) + "..."
      : content;

  useEffect(() => {
    import("@uiw/react-markdown-preview")
      .then((module) => {
        setMarkdownRenderer(() => module.default);
      })
      .catch(() => {
        // Silently fail - will use fallback
      });
  }, []);

  // Fallback to plain text if markdown renderer not loaded
  if (!MarkdownRenderer) {
    return (
      <div className={className}>
        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
          {displayContent}
        </p>
        <ExpandButton
          shouldTruncate={shouldTruncate}
          isExpanded={isExpanded}
          onToggle={() => setIsExpanded((prev) => !prev)}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="markdown-preview-content" data-color-mode="light">
        <MarkdownRenderer source={displayContent} disableCopy={true} />
      </div>
      <ExpandButton
        shouldTruncate={shouldTruncate}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded((prev) => !prev)}
      />
    </div>
  );
}
