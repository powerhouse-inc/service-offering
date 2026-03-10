import type { PHDocument, PHBaseState } from "document-model";
import type { ResourceTemplateAction } from "./actions.js";
import type { ResourceTemplateState as ResourceTemplateGlobalState } from "./schema/types.js";

type ResourceTemplateLocalState = Record<PropertyKey, never>;

type ResourceTemplatePHState = PHBaseState & {
  global: ResourceTemplateGlobalState;
  local: ResourceTemplateLocalState;
};
type ResourceTemplateDocument = PHDocument<ResourceTemplatePHState>;

export * from "./schema/types.js";

export type {
  ResourceTemplateGlobalState,
  ResourceTemplateLocalState,
  ResourceTemplatePHState,
  ResourceTemplateAction,
  ResourceTemplateDocument,
};
