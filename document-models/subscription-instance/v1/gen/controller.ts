import { PHDocumentController } from "document-model/core";
import { SubscriptionInstance } from "../module.js";
import type {
  SubscriptionInstanceAction,
  SubscriptionInstancePHState,
} from "./types.js";

export const SubscriptionInstanceController =
  PHDocumentController.forDocumentModel<
    SubscriptionInstancePHState,
    SubscriptionInstanceAction
  >(SubscriptionInstance);
