import {
  BaseDocumentHeaderSchema,
  BaseDocumentStateSchema,
} from "document-model";
import { z } from "zod";
import { serviceSubscriptionDocumentType } from "./document-type.js";
import { ServiceSubscriptionStateSchema } from "./schema/zod.js";
import type {
  ServiceSubscriptionDocument,
  ServiceSubscriptionPHState,
} from "./types.js";

/** Schema for validating the header object of a ServiceSubscription document */
export const ServiceSubscriptionDocumentHeaderSchema =
  BaseDocumentHeaderSchema.extend({
    documentType: z.literal(serviceSubscriptionDocumentType),
  });

/** Schema for validating the state object of a ServiceSubscription document */
export const ServiceSubscriptionPHStateSchema = BaseDocumentStateSchema.extend({
  global: ServiceSubscriptionStateSchema(),
});

export const ServiceSubscriptionDocumentSchema = z.object({
  header: ServiceSubscriptionDocumentHeaderSchema,
  state: ServiceSubscriptionPHStateSchema,
  initialState: ServiceSubscriptionPHStateSchema,
});

/** Simple helper function to check if a state object is a ServiceSubscription document state object */
export function isServiceSubscriptionState(
  state: unknown,
): state is ServiceSubscriptionPHState {
  return ServiceSubscriptionPHStateSchema.safeParse(state).success;
}

/** Simple helper function to assert that a document state object is a ServiceSubscription document state object */
export function assertIsServiceSubscriptionState(
  state: unknown,
): asserts state is ServiceSubscriptionPHState {
  ServiceSubscriptionPHStateSchema.parse(state);
}

/** Simple helper function to check if a document is a ServiceSubscription document */
export function isServiceSubscriptionDocument(
  document: unknown,
): document is ServiceSubscriptionDocument {
  return ServiceSubscriptionDocumentSchema.safeParse(document).success;
}

/** Simple helper function to assert that a document is a ServiceSubscription document */
export function assertIsServiceSubscriptionDocument(
  document: unknown,
): asserts document is ServiceSubscriptionDocument {
  ServiceSubscriptionDocumentSchema.parse(document);
}
