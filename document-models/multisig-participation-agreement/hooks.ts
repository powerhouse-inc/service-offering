import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import {
  useDocumentById,
  useDocumentsInSelectedDrive,
  useDocumentsInSelectedFolder,
  useSelectedDocument,
} from "@powerhousedao/reactor-browser";
import type {
  MultisigParticipationAgreementAction,
  MultisigParticipationAgreementDocument,
} from "@powerhousedao/service-offering/document-models/multisig-participation-agreement";
import {
  assertIsMultisigParticipationAgreementDocument,
  isMultisigParticipationAgreementDocument,
} from "./gen/document-schema.js";

/** Hook to get a MultisigParticipationAgreement document by its id */
export function useMultisigParticipationAgreementDocumentById(
  documentId: string | null | undefined,
):
  | [
      MultisigParticipationAgreementDocument,
      DocumentDispatch<MultisigParticipationAgreementAction>,
    ]
  | [undefined, undefined] {
  const [document, dispatch] = useDocumentById(documentId);
  if (!isMultisigParticipationAgreementDocument(document))
    return [undefined, undefined];
  return [document, dispatch];
}

/** Hook to get the selected MultisigParticipationAgreement document */
export function useSelectedMultisigParticipationAgreementDocument(): [
  MultisigParticipationAgreementDocument,
  DocumentDispatch<MultisigParticipationAgreementAction>,
] {
  const [document, dispatch] = useSelectedDocument();

  assertIsMultisigParticipationAgreementDocument(document);
  return [document, dispatch] as const;
}

/** Hook to get all MultisigParticipationAgreement documents in the selected drive */
export function useMultisigParticipationAgreementDocumentsInSelectedDrive() {
  const documentsInSelectedDrive = useDocumentsInSelectedDrive();
  return documentsInSelectedDrive?.filter(
    isMultisigParticipationAgreementDocument,
  );
}

/** Hook to get all MultisigParticipationAgreement documents in the selected folder */
export function useMultisigParticipationAgreementDocumentsInSelectedFolder() {
  const documentsInSelectedFolder = useDocumentsInSelectedFolder();
  return documentsInSelectedFolder?.filter(
    isMultisigParticipationAgreementDocument,
  );
}
