import { useState } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  WorkBreakdownAction,
  WorkBreakdownDocument,
} from "@powerhousedao/service-offering/document-models/work-breakdown";
import {
  addInput,
  setPhase,
} from "../../../document-models/work-breakdown/gen/creators.js";

interface Props {
  document: WorkBreakdownDocument;
  dispatch: DocumentDispatch<WorkBreakdownAction>;
}

export function CaptureView({ document, dispatch }: Props) {
  const state = document.state.global;
  const [rawContent, setRawContent] = useState("");

  function handleProcessAndStructure() {
    const trimmed = rawContent.trim();
    if (trimmed) {
      dispatch(
        addInput({
          id: generateId(),
          rawContent: trimmed,
          source: "Manual Ingestion",
          createdAt: new Date().toISOString(),
        }),
      );
      setRawContent("");
    }
    dispatch(
      setPhase({ phase: "STRUCTURE", timestamp: new Date().toISOString() }),
    );
  }

  return (
    <div className="wbg-capture">
      <h2 className="wbg-capture__title">Capture & Ingest</h2>
      <p className="wbg-capture__desc">
        Paste raw stakeholder requirements or session notes to begin
        decomposition.
      </p>

      <div className="wbg-capture__card">
        <textarea
          className="wbg-capture__textarea"
          placeholder="Awaiting stakeholder input..."
          value={rawContent}
          onChange={(e) => setRawContent(e.target.value)}
        />
        <div className="wbg-capture__footer">
          <span className="wbg-capture__source">SOURCE: MANUAL INGESTION</span>
          <button
            className="wbg-btn wbg-btn--dark"
            onClick={handleProcessAndStructure}
            type="button"
          >
            Process & Structure
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Show existing inputs */}
      {state.inputs.length > 0 && (
        <div className="wbg-capture__existing">
          <h3 className="wbg-capture__existing-title">
            Previous Inputs ({state.inputs.length})
          </h3>
          {state.inputs.map((input) => (
            <div key={input.id} className="wbg-capture__input-card">
              <p className="wbg-capture__input-text">{input.rawContent}</p>
              <span className="wbg-capture__input-meta">
                {input.source ?? "Manual"}{" "}
                {input.submittedBy ? `by ${input.submittedBy}` : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
