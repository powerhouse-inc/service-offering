import type { PHDriveEditorConfig } from "@powerhousedao/reactor-browser";

/** Editor config for the <%= pascalCaseDriveEditorName %> */
export const editorConfig: PHDriveEditorConfig = {
  isDragAndDropEnabled: false,
  allowedDocumentTypes: [
    "powerhouse/subscription-instance",
    "powerhouse/resource-instance",
  ],
};
