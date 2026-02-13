import type { EditorModule } from "document-model";
import { lazy } from "react";

/** Document editor module for the "["powerhouse/business-analysis"]" document type */
export const BusinessAnalysisEditor: EditorModule = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["powerhouse/business-analysis"],
  config: {
    id: "business-analysis-editor",
    name: "BusinessAnalysisEditor",
  },
};
