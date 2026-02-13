import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import {
  useDocumentById,
  useDocumentsInSelectedDrive,
  useDocumentsInSelectedFolder,
  useSelectedDocument,
} from "@powerhousedao/reactor-browser";
import type {
  WorkBreakdownAction,
  WorkBreakdownDocument,
} from "@powerhousedao/service-offering/document-models/work-breakdown";
import {
  assertIsWorkBreakdownDocument,
  isWorkBreakdownDocument,
} from "./gen/document-schema.js";

/** Hook to get a WorkBreakdown document by its id */
export function useWorkBreakdownDocumentById(
  documentId: string | null | undefined,
):
  | [WorkBreakdownDocument, DocumentDispatch<WorkBreakdownAction>]
  | [undefined, undefined] {
  const [document, dispatch] = useDocumentById(documentId);
  if (!isWorkBreakdownDocument(document)) return [undefined, undefined];
  return [document, dispatch];
}

/** Hook to get the selected WorkBreakdown document */
export function useSelectedWorkBreakdownDocument(): [
  WorkBreakdownDocument,
  DocumentDispatch<WorkBreakdownAction>,
] {
  const [document, dispatch] = useSelectedDocument();

  assertIsWorkBreakdownDocument(document);
  return [document, dispatch] as const;
}

/** Hook to get all WorkBreakdown documents in the selected drive */
export function useWorkBreakdownDocumentsInSelectedDrive() {
  const documentsInSelectedDrive = useDocumentsInSelectedDrive();
  return documentsInSelectedDrive?.filter(isWorkBreakdownDocument);
}

/** Hook to get all WorkBreakdown documents in the selected folder */
export function useWorkBreakdownDocumentsInSelectedFolder() {
  const documentsInSelectedFolder = useDocumentsInSelectedFolder();
  return documentsInSelectedFolder?.filter(isWorkBreakdownDocument);
}
