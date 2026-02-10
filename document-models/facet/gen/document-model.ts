import type { DocumentModelGlobalState } from "document-model";

export const documentModel: DocumentModelGlobalState = {
  author: {
    name: "Powerhouse",
    website: "https://www.powerhouse.inc/",
  },
  description:
    "Document model for defining categorical options (facets) used to customize service offerings. Examples include SNO Function, Legal Entity Type, Team configurations, and Anonymity settings.",
  extension: "",
  id: "powerhouse/facet",
  name: "Facet",
  specifications: [
    {
      changeLog: [],
      modules: [
        {
          description: "Operations for managing facet metadata",
          id: "facet-management",
          name: "Facet Management",
          operations: [
            {
              description: "Sets the facet name",
              errors: [],
              examples: [],
              id: "set-facet-name",
              name: "SET_FACET_NAME",
              reducer:
                "state.name = action.input.name;\nstate.lastModified = action.input.lastModified;",
              schema:
                "input SetFacetNameInput {\n    name: String!\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Sets the facet name",
            },
            {
              description: "Sets the facet description",
              errors: [],
              examples: [],
              id: "set-facet-description",
              name: "SET_FACET_DESCRIPTION",
              reducer:
                "state.description = action.input.description || null;\nstate.lastModified = action.input.lastModified;",
              schema:
                "input SetFacetDescriptionInput {\n    description: String\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Sets the facet description",
            },
          ],
        },
        {
          description: "Operations for managing facet options",
          id: "option-management",
          name: "Option Management",
          operations: [
            {
              description: "Adds a new option to the facet",
              errors: [
                {
                  code: "DUPLICATE_OPTION_ID",
                  description: "An option with this ID already exists",
                  id: "duplicate-option-id",
                  name: "DuplicateOptionIdError",
                  template: "",
                },
              ],
              examples: [],
              id: "add-option",
              name: "ADD_OPTION",
              reducer:
                "state.options.push({\n    id: action.input.id,\n    label: action.input.label,\n    description: action.input.description || null,\n    displayOrder: action.input.displayOrder || null,\n    isDefault: action.input.isDefault || false\n});\nstate.lastModified = action.input.lastModified;",
              schema:
                "input AddOptionInput {\n    id: OID!\n    label: String!\n    description: String\n    displayOrder: Int\n    isDefault: Boolean\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Adds a new option to the facet",
            },
            {
              description: "Updates an existing option",
              errors: [
                {
                  code: "OPTION_NOT_FOUND",
                  description: "Option with the specified ID does not exist",
                  id: "option-not-found",
                  name: "OptionNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "update-option",
              name: "UPDATE_OPTION",
              reducer:
                "const option = state.options.find(o => o.id === action.input.id);\nif (option) {\n    if (action.input.label) {\n        option.label = action.input.label;\n    }\n    if (action.input.description !== undefined) {\n        option.description = action.input.description || null;\n    }\n    if (action.input.displayOrder !== undefined && action.input.displayOrder !== null) {\n        option.displayOrder = action.input.displayOrder;\n    }\n    if (action.input.isDefault !== undefined && action.input.isDefault !== null) {\n        option.isDefault = action.input.isDefault;\n    }\n}\nstate.lastModified = action.input.lastModified;",
              schema:
                "input UpdateOptionInput {\n    id: OID!\n    label: String\n    description: String\n    displayOrder: Int\n    isDefault: Boolean\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Updates an existing option",
            },
            {
              description: "Removes an option from the facet",
              errors: [
                {
                  code: "REMOVE_OPTION_NOT_FOUND",
                  description: "Option with the specified ID does not exist",
                  id: "remove-option-not-found",
                  name: "RemoveOptionNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "remove-option",
              name: "REMOVE_OPTION",
              reducer:
                "const optionIndex = state.options.findIndex(o => o.id === action.input.id);\nif (optionIndex !== -1) {\n    state.options.splice(optionIndex, 1);\n}\nstate.lastModified = action.input.lastModified;",
              schema:
                "input RemoveOptionInput {\n    id: OID!\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Removes an option from the facet",
            },
            {
              description: "Reorders options in the facet",
              errors: [],
              examples: [],
              id: "reorder-options",
              name: "REORDER_OPTIONS",
              reducer:
                "const orderedOptions: typeof state.options = [];\naction.input.optionIds.forEach((id, index) => {\n    const option = state.options.find(o => o.id === id);\n    if (option) {\n        option.displayOrder = index;\n        orderedOptions.push(option);\n    }\n});\nstate.options.forEach(option => {\n    if (!action.input.optionIds.includes(option.id)) {\n        orderedOptions.push(option);\n    }\n});\nstate.options = orderedOptions;\nstate.lastModified = action.input.lastModified;",
              schema:
                "input ReorderOptionsInput {\n    optionIds: [OID!]!\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Reorders options in the facet",
            },
          ],
        },
      ],
      state: {
        global: {
          examples: [],
          initialValue:
            '{\n    "id": "",\n    "name": "",\n    "description": null,\n    "lastModified": "1970-01-01T00:00:00.000Z",\n    "options": []\n}',
          schema:
            "type FacetState {\n    id: PHID!\n    name: String!\n    description: String\n    lastModified: DateTime!\n    options: [FacetOption!]!\n}\n\ntype FacetOption {\n    id: OID!\n    label: String!\n    description: String\n    displayOrder: Int\n    isDefault: Boolean!\n}",
        },
        local: {
          examples: [],
          initialValue: "",
          schema: "",
        },
      },
      version: 1,
    },
  ],
};
