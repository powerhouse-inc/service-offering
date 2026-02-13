import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import {
  useDocumentById,
  useDocumentsInSelectedDrive,
  useDocumentsInSelectedFolder,
  useSelectedDocument,
} from "@powerhousedao/reactor-browser";
import type {
  BusinessAnalysisAction,
  BusinessAnalysisDocument,
} from "@powerhousedao/service-offering/document-models/business-analysis";
import {
  assertIsBusinessAnalysisDocument,
  isBusinessAnalysisDocument,
} from "./gen/document-schema.js";

/** Hook to get a BusinessAnalysis document by its id */
export function useBusinessAnalysisDocumentById(
  documentId: string | null | undefined,
):
  | [BusinessAnalysisDocument, DocumentDispatch<BusinessAnalysisAction>]
  | [undefined, undefined] {
  const [document, dispatch] = useDocumentById(documentId);
  if (!isBusinessAnalysisDocument(document)) return [undefined, undefined];
  return [document, dispatch];
}

/** Hook to get the selected BusinessAnalysis document */
export function useSelectedBusinessAnalysisDocument(): [
  BusinessAnalysisDocument,
  DocumentDispatch<BusinessAnalysisAction>,
] {
  const [document, dispatch] = useSelectedDocument();

  assertIsBusinessAnalysisDocument(document);
  return [document, dispatch] as const;
}

/** Hook to get all BusinessAnalysis documents in the selected drive */
export function useBusinessAnalysisDocumentsInSelectedDrive() {
  const documentsInSelectedDrive = useDocumentsInSelectedDrive();
  return documentsInSelectedDrive?.filter(isBusinessAnalysisDocument);
}

/** Hook to get all BusinessAnalysis documents in the selected folder */
export function useBusinessAnalysisDocumentsInSelectedFolder() {
  const documentsInSelectedFolder = useDocumentsInSelectedFolder();
  return documentsInSelectedFolder?.filter(isBusinessAnalysisDocument);
}
