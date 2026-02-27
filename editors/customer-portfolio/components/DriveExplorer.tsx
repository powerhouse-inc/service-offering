import type { EditorProps } from "document-model";
import { FolderTree } from "./FolderTree.js";
import { DriveContents } from "./DriveContents.js";
import { OnboardingWrapper } from "../onboarding/OnboardingWrapper.js";

/**
 * Main drive explorer component with sidebar navigation and content area.
 * Layout: Left sidebar (folder tree) + Right content area (files/folders + document editor)
 */
export function DriveExplorer({ children }: EditorProps) {
  // if a document is selected then it's editor will be passed as children
  const showDocumentEditor = !!children;

  return (
    <div className="flex h-full">
      <FolderTree />
      <div className="flex-1 overflow-hidden">
        {/* Conditional rendering: Document editor or folder contents */}
        {showDocumentEditor ? (
          /* Document editor — wrapped with onboarding tab for subscription docs */
          <OnboardingWrapper>{children}</OnboardingWrapper>
        ) : (
          /* Folder contents view */
          <div className="overflow-y-auto p-4 h-full">
            <DriveContents />
          </div>
        )}
      </div>
    </div>
  );
}
