import type { SignalDispatch, Action } from "document-model";

// Types for FacetPreset operations (aligned with document model schema)
// These are defined locally until code generation properly includes them
interface FacetPreset {
  id: string;
  categoryKey: string;
  categoryLabel: string;
  description: string | null;
  icon: string | null;
  isRecommended: boolean;
  suggestedOptions: string[];
}

interface ResourceTemplateStateWithPresets {
  facetPresets: FacetPreset[];
  lastModified: string;
}

interface SetFacetPresetInput {
  id: string;
  categoryKey: string;
  categoryLabel: string;
  description?: string | null;
  icon?: string | null;
  isRecommended?: boolean;
  suggestedOptions: string[];
  lastModified: string;
}

interface RemoveFacetPresetInput {
  id: string;
  lastModified: string;
}

interface AddPresetOptionInput {
  presetId: string;
  option: string;
  lastModified: string;
}

interface RemovePresetOptionInput {
  presetId: string;
  option: string;
  lastModified: string;
}

type SetFacetPresetAction = Action & { input: SetFacetPresetInput };
type RemoveFacetPresetAction = Action & { input: RemoveFacetPresetInput };
type AddPresetOptionAction = Action & { input: AddPresetOptionInput };
type RemovePresetOptionAction = Action & { input: RemovePresetOptionInput };

export interface ResourceTemplateFacetPresetManagementOperations {
  setFacetPresetOperation: (
    state: ResourceTemplateStateWithPresets,
    action: SetFacetPresetAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeFacetPresetOperation: (
    state: ResourceTemplateStateWithPresets,
    action: RemoveFacetPresetAction,
    dispatch?: SignalDispatch,
  ) => void;
  addPresetOptionOperation: (
    state: ResourceTemplateStateWithPresets,
    action: AddPresetOptionAction,
    dispatch?: SignalDispatch,
  ) => void;
  removePresetOptionOperation: (
    state: ResourceTemplateStateWithPresets,
    action: RemovePresetOptionAction,
    dispatch?: SignalDispatch,
  ) => void;
}

export const resourceTemplateFacetPresetManagementOperations: ResourceTemplateFacetPresetManagementOperations =
  {
    setFacetPresetOperation(state, action) {
      const existingIndex = state.facetPresets.findIndex(
        (fp) => fp.id === action.input.id,
      );
      if (existingIndex !== -1) {
        state.facetPresets[existingIndex] = {
          id: action.input.id,
          categoryKey: action.input.categoryKey,
          categoryLabel: action.input.categoryLabel,
          description: action.input.description || null,
          icon: action.input.icon || null,
          isRecommended: action.input.isRecommended || false,
          suggestedOptions: action.input.suggestedOptions,
        };
      } else {
        state.facetPresets.push({
          id: action.input.id,
          categoryKey: action.input.categoryKey,
          categoryLabel: action.input.categoryLabel,
          description: action.input.description || null,
          icon: action.input.icon || null,
          isRecommended: action.input.isRecommended || false,
          suggestedOptions: action.input.suggestedOptions,
        });
      }
      state.lastModified = action.input.lastModified;
    },
    removeFacetPresetOperation(state, action) {
      const presetIndex = state.facetPresets.findIndex(
        (fp) => fp.id === action.input.id,
      );
      if (presetIndex !== -1) {
        state.facetPresets.splice(presetIndex, 1);
      }
      state.lastModified = action.input.lastModified;
    },
    addPresetOptionOperation(state, action) {
      const preset = state.facetPresets.find(
        (fp) => fp.id === action.input.presetId,
      );
      if (preset && !preset.suggestedOptions.includes(action.input.option)) {
        preset.suggestedOptions.push(action.input.option);
      }
      state.lastModified = action.input.lastModified;
    },
    removePresetOptionOperation(state, action) {
      const preset = state.facetPresets.find(
        (fp) => fp.id === action.input.presetId,
      );
      if (preset) {
        const optionIndex = preset.suggestedOptions.indexOf(
          action.input.option,
        );
        if (optionIndex !== -1) {
          preset.suggestedOptions.splice(optionIndex, 1);
        }
      }
      state.lastModified = action.input.lastModified;
    },
  };
