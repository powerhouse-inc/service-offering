import type { EditorModule } from "document-model";
import { lazy } from "react";

/** Document editor module for the "["powerhouse/work-breakdown"]" document type */
export const WorkBreakdownEditor: EditorModule = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["powerhouse/work-breakdown"],
  config: {
    id: "work-breakdown-editor",
    name: "WorkBreakdownEditor",
  },
};
