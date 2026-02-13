import type { Action } from "document-model";
import type {
  AddGlossaryTermInput,
  UpdateGlossaryTermInput,
  RemoveGlossaryTermInput,
} from "../types.js";

export type AddGlossaryTermAction = Action & {
  type: "ADD_GLOSSARY_TERM";
  input: AddGlossaryTermInput;
};
export type UpdateGlossaryTermAction = Action & {
  type: "UPDATE_GLOSSARY_TERM";
  input: UpdateGlossaryTermInput;
};
export type RemoveGlossaryTermAction = Action & {
  type: "REMOVE_GLOSSARY_TERM";
  input: RemoveGlossaryTermInput;
};

export type BusinessAnalysisGlossaryAction =
  | AddGlossaryTermAction
  | UpdateGlossaryTermAction
  | RemoveGlossaryTermAction;
