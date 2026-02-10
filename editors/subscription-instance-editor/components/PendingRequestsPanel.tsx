import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  SubscriptionInstanceAction,
  SubscriptionInstanceDocument,
} from "@powerhousedao/service-offering/document-models/subscription-instance";

// Note: The requests module (pendingRequests, ClientRequest, RequestType, RequestStatus)
// has been removed from the SubscriptionInstance document model.
// This component is stubbed out until the feature is re-implemented.

interface PendingRequestsPanelProps {
  document: SubscriptionInstanceDocument;
  dispatch: DocumentDispatch<SubscriptionInstanceAction>;
}

export function PendingRequestsPanel(_props: PendingRequestsPanelProps) {
  // Requests functionality has been removed from the document model
  return null;
}
