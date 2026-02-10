import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import {
  useDocumentById,
  useDocumentsInSelectedDrive,
  useDocumentsInSelectedFolder,
  useSelectedDocument,
} from "@powerhousedao/reactor-browser";
import type {
  FacetAction,
  FacetDocument,
} from "@powerhousedao/service-offering/document-models/facet";
import {
  assertIsFacetDocument,
  isFacetDocument,
} from "./gen/document-schema.js";

/** Hook to get a Facet document by its id */
export function useFacetDocumentById(
  documentId: string | null | undefined,
): [FacetDocument, DocumentDispatch<FacetAction>] | [undefined, undefined] {
  const [document, dispatch] = useDocumentById(documentId);
  if (!isFacetDocument(document)) return [undefined, undefined];
  return [document, dispatch];
}

/** Hook to get the selected Facet document */
export function useSelectedFacetDocument(): [
  FacetDocument,
  DocumentDispatch<FacetAction>,
] {
  const [document, dispatch] = useSelectedDocument();

  assertIsFacetDocument(document);
  return [document, dispatch] as const;
}

/** Hook to get all Facet documents in the selected drive */
export function useFacetDocumentsInSelectedDrive() {
  const documentsInSelectedDrive = useDocumentsInSelectedDrive();
  return documentsInSelectedDrive?.filter(isFacetDocument);
}

/** Hook to get all Facet documents in the selected folder */
export function useFacetDocumentsInSelectedFolder() {
  const documentsInSelectedFolder = useDocumentsInSelectedFolder();
  return documentsInSelectedFolder?.filter(isFacetDocument);
}
