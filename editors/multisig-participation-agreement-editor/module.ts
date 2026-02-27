import type { EditorModule } from "document-model";
import { lazy } from "react";

/** Document editor module for the "["powerhouse/multisig-participation-agreement"]" document type */
export const MultisigParticipationAgreementEditor: EditorModule = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["powerhouse/multisig-participation-agreement"],
  config: {
    id: "multisig-participation-agreement-editor",
    name: "MultisigParticipationAgreementEditor",
  },
};
