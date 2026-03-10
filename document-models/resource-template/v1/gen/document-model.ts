import type { DocumentModelGlobalState } from "document-model";

export const documentModel: DocumentModelGlobalState = {
  id: "powerhouse/resource-template",
  name: "ResourceTemplate",
  author: {
    name: "Powerhouse",
    website: "https://www.powerhouse.inc/",
  },
  extension: "",
  description:
    "Document model for resource templates. Defines product-level configuration for service offerings including services, audiences, facet targeting, and content.",
  specifications: [
    {
      state: {
        local: {
          schema: "",
          examples: [],
          initialValue: "",
        },
        global: {
          schema:
            "type ResourceTemplateState {\n    id: PHID!\n    operatorId: PHID!\n    title: String!\n    summary: String!\n    description: String\n    thumbnailUrl: URL\n    infoLink: URL\n    status: TemplateStatus!\n    lastModified: DateTime!\n    targetAudiences: [TargetAudience!]!\n    setupServices: [String!]!\n    recurringServices: [String!]!\n    facetTargets: [FacetTarget!]!\n    services: [Service!]!\n    optionGroups: [OptionGroup!]!\n    faqFields: [FaqField!]!\n    contentSections: [ContentSection!]!\n}\n\nenum TemplateStatus {\n    DRAFT\n    COMING_SOON\n    ACTIVE\n    DEPRECATED\n}\n\ntype TargetAudience {\n    id: OID!\n    label: String!\n    color: String\n}\n\ntype FacetTarget {\n    id: OID!\n    categoryKey: String!\n    categoryLabel: String!\n    selectedOptions: [String!]!\n}\n\ntype Service {\n    id: OID!\n    title: String!\n    description: String\n    displayOrder: Int\n    parentServiceId: OID\n    isSetupFormation: Boolean!\n    optionGroupId: OID\n    facetBindings: [ResourceFacetBinding!]!\n}\n\ntype ResourceFacetBinding {\n    id: OID!\n    facetName: String!\n    facetType: PHID!\n    supportedOptions: [OID!]!\n}\n\ntype OptionGroup {\n    id: OID!\n    name: String!\n    description: String\n    isAddOn: Boolean!\n    defaultSelected: Boolean!\n}\n\ntype FaqField {\n    id: OID!\n    question: String\n    answer: String\n    displayOrder: Int!\n}\n\ntype ContentSection {\n    id: OID!\n    title: String!\n    content: String!\n    displayOrder: Int!\n}",
          examples: [],
          initialValue:
            '{"id": "", "operatorId": "", "title": "", "summary": "", "description": null, "thumbnailUrl": null, "infoLink": null, "status": "DRAFT", "lastModified": "1970-01-01T00:00:00.000Z", "targetAudiences": [], "setupServices": [], "recurringServices": [], "facetTargets": [], "services": [], "optionGroups": [], "faqFields": [], "contentSections": []}',
        },
      },
      modules: [
        {
          id: "template-management",
          name: "Template Management",
          description: "Operations for managing template metadata",
          operations: [
            {
              id: "update-template-info",
              name: "UPDATE_TEMPLATE_INFO",
              description: "Updates template info",
              schema:
                "input UpdateTemplateInfoInput {\n    title: String\n    summary: String\n    description: String\n    thumbnailUrl: URL\n    infoLink: URL\n    lastModified: DateTime!\n}",
              template: "Updates template info",
              reducer:
                "if (action.input.title) state.title = action.input.title;\nif (action.input.summary) state.summary = action.input.summary;\nif (action.input.description !== undefined) state.description = action.input.description || null;\nif (action.input.thumbnailUrl !== undefined) state.thumbnailUrl = action.input.thumbnailUrl || null;\nif (action.input.infoLink !== undefined) state.infoLink = action.input.infoLink || null;\nstate.lastModified = action.input.lastModified;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "update-template-status",
              name: "UPDATE_TEMPLATE_STATUS",
              description: "Updates template status",
              schema:
                "input UpdateTemplateStatusInput {\n    status: TemplateStatus!\n    lastModified: DateTime!\n}",
              template: "Updates template status",
              reducer:
                "state.status = action.input.status;\nstate.lastModified = action.input.lastModified;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "set-operator",
              name: "SET_OPERATOR",
              description: "Sets the operator",
              schema:
                "input SetOperatorInput {\n    operatorId: PHID!\n    lastModified: DateTime!\n}",
              template: "Sets the operator",
              reducer:
                "state.operatorId = action.input.operatorId;\nstate.lastModified = action.input.lastModified;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "set-template-id",
              name: "SET_TEMPLATE_ID",
              description: "Sets the template ID",
              schema:
                "input SetTemplateIdInput {\n    id: PHID!\n    lastModified: DateTime!\n}",
              template: "Sets the template ID",
              reducer:
                "state.id = action.input.id;\nstate.lastModified = action.input.lastModified;",
              errors: [],
              examples: [],
              scope: "global",
            },
          ],
        },
        {
          id: "audience-management",
          name: "Audience Management",
          description: "Operations for managing target audiences",
          operations: [
            {
              id: "add-target-audience",
              name: "ADD_TARGET_AUDIENCE",
              description: "Adds a target audience",
              schema:
                "input AddTargetAudienceInput {\n    id: OID!\n    label: String!\n    color: String\n    lastModified: DateTime!\n}",
              template: "Adds a target audience",
              reducer:
                "state.targetAudiences.push({ id: action.input.id, label: action.input.label, color: action.input.color || null });\nstate.lastModified = action.input.lastModified;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "remove-target-audience",
              name: "REMOVE_TARGET_AUDIENCE",
              description: "Removes a target audience",
              schema:
                "input RemoveTargetAudienceInput {\n    id: OID!\n    lastModified: DateTime!\n}",
              template: "Removes a target audience",
              reducer:
                "const audienceIndex = state.targetAudiences.findIndex(a => a.id === action.input.id);\nif (audienceIndex !== -1) { state.targetAudiences.splice(audienceIndex, 1); }\nstate.lastModified = action.input.lastModified;",
              errors: [],
              examples: [],
              scope: "global",
            },
          ],
        },
        {
          id: "facet-targeting",
          name: "Facet Targeting",
          description: "Operations for managing facet target configuration",
          operations: [
            {
              id: "set-facet-target",
              name: "SET_FACET_TARGET",
              description: "Sets a facet target",
              schema:
                "input SetFacetTargetInput {\n    id: OID!\n    categoryKey: String!\n    categoryLabel: String!\n    selectedOptions: [String!]!\n    lastModified: DateTime!\n}",
              template: "Sets a facet target",
              reducer:
                "const existingIndex = state.facetTargets.findIndex(ft => ft.categoryKey === action.input.categoryKey);\nif (existingIndex !== -1) {\n    state.facetTargets[existingIndex] = { id: action.input.id, categoryKey: action.input.categoryKey, categoryLabel: action.input.categoryLabel, selectedOptions: action.input.selectedOptions };\n} else {\n    state.facetTargets.push({ id: action.input.id, categoryKey: action.input.categoryKey, categoryLabel: action.input.categoryLabel, selectedOptions: action.input.selectedOptions });\n}\nstate.lastModified = action.input.lastModified;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "remove-facet-target",
              name: "REMOVE_FACET_TARGET",
              description: "Removes a facet target",
              schema:
                "input RemoveFacetTargetInput {\n    categoryKey: String!\n    lastModified: DateTime!\n}",
              template: "Removes a facet target",
              reducer:
                "const facetIndex = state.facetTargets.findIndex(ft => ft.categoryKey === action.input.categoryKey);\nif (facetIndex !== -1) { state.facetTargets.splice(facetIndex, 1); }\nstate.lastModified = action.input.lastModified;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "add-facet-option",
              name: "ADD_FACET_OPTION",
              description: "Adds an option to a facet target",
              schema:
                "input AddFacetOptionInput {\n    categoryKey: String!\n    optionId: String!\n    lastModified: DateTime!\n}",
              template: "Adds an option to a facet target",
              reducer:
                "const facetTarget = state.facetTargets.find(ft => ft.categoryKey === action.input.categoryKey);\nif (facetTarget && !facetTarget.selectedOptions.includes(action.input.optionId)) {\n    facetTarget.selectedOptions.push(action.input.optionId);\n}\nstate.lastModified = action.input.lastModified;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "remove-facet-option",
              name: "REMOVE_FACET_OPTION",
              description: "Removes an option from a facet target",
              schema:
                "input RemoveFacetOptionInput {\n    categoryKey: String!\n    optionId: String!\n    lastModified: DateTime!\n}",
              template: "Removes an option from a facet target",
              reducer:
                "const facetTarget = state.facetTargets.find(ft => ft.categoryKey === action.input.categoryKey);\nif (facetTarget) {\n    const optionIndex = facetTarget.selectedOptions.indexOf(action.input.optionId);\n    if (optionIndex !== -1) { facetTarget.selectedOptions.splice(optionIndex, 1); }\n}\nstate.lastModified = action.input.lastModified;",
              errors: [],
              examples: [],
              scope: "global",
            },
          ],
        },
        {
          id: "service-category-management",
          name: "Service Category Management",
          description: "Operations for managing setup/recurring service labels",
          operations: [
            {
              id: "set-setup-services",
              name: "SET_SETUP_SERVICES",
              description: "Sets setup service labels",
              schema:
                "input SetSetupServicesInput {\n    services: [String!]!\n    lastModified: DateTime!\n}",
              template: "Sets setup service labels",
              reducer:
                "state.setupServices = action.input.services;\nstate.lastModified = action.input.lastModified;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "set-recurring-services",
              name: "SET_RECURRING_SERVICES",
              description: "Sets recurring service labels",
              schema:
                "input SetRecurringServicesInput {\n    services: [String!]!\n    lastModified: DateTime!\n}",
              template: "Sets recurring service labels",
              reducer:
                "state.recurringServices = action.input.services;\nstate.lastModified = action.input.lastModified;",
              errors: [],
              examples: [],
              scope: "global",
            },
          ],
        },
        {
          id: "service-management",
          name: "Service Management",
          description: "Operations for managing services and facet bindings",
          operations: [
            {
              id: "add-service",
              name: "ADD_SERVICE",
              description: "Adds a service",
              schema:
                "input AddServiceInput {\n    id: OID!\n    title: String!\n    description: String\n    parentServiceId: OID\n    displayOrder: Int\n    isSetupFormation: Boolean\n    optionGroupId: OID\n    lastModified: DateTime!\n}",
              template: "Adds a service",
              reducer:
                "state.services.push({ id: action.input.id, title: action.input.title, description: action.input.description || null, parentServiceId: action.input.parentServiceId || null, displayOrder: action.input.displayOrder || null, isSetupFormation: action.input.isSetupFormation || false, optionGroupId: action.input.optionGroupId || null, facetBindings: [] });\nstate.lastModified = action.input.lastModified;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "update-service",
              name: "UPDATE_SERVICE",
              description: "Updates a service",
              schema:
                "input UpdateServiceInput {\n    id: OID!\n    title: String\n    description: String\n    parentServiceId: OID\n    displayOrder: Int\n    isSetupFormation: Boolean\n    optionGroupId: OID\n    lastModified: DateTime!\n}",
              template: "Updates a service",
              reducer:
                "const service = state.services.find(s => s.id === action.input.id);\nif (service) {\n    if (action.input.title) service.title = action.input.title;\n    if (action.input.description !== undefined && action.input.description !== null) service.description = action.input.description;\n    if (action.input.parentServiceId !== undefined) service.parentServiceId = action.input.parentServiceId || null;\n    if (action.input.displayOrder !== undefined && action.input.displayOrder !== null) service.displayOrder = action.input.displayOrder;\n    if (action.input.isSetupFormation !== undefined && action.input.isSetupFormation !== null) service.isSetupFormation = action.input.isSetupFormation;\n    if (action.input.optionGroupId !== undefined) service.optionGroupId = action.input.optionGroupId || null;\n}\nstate.lastModified = action.input.lastModified;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "delete-service",
              name: "DELETE_SERVICE",
              description: "Deletes a service",
              schema:
                "input DeleteServiceInput {\n    id: OID!\n    lastModified: DateTime!\n}",
              template: "Deletes a service",
              reducer:
                "const serviceIndex = state.services.findIndex(s => s.id === action.input.id);\nif (serviceIndex !== -1) { state.services.splice(serviceIndex, 1); }\nstate.lastModified = action.input.lastModified;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "add-facet-binding",
              name: "ADD_FACET_BINDING",
              description: "Adds a facet binding to a service",
              schema:
                "input AddFacetBindingInput {\n    serviceId: OID!\n    bindingId: OID!\n    facetName: String!\n    facetType: PHID!\n    supportedOptions: [OID!]!\n    lastModified: DateTime!\n}",
              template: "Adds a facet binding to a service",
              reducer:
                "const service = state.services.find(s => s.id === action.input.serviceId);\nif (service) {\n    service.facetBindings.push({ id: action.input.bindingId, facetName: action.input.facetName, facetType: action.input.facetType, supportedOptions: action.input.supportedOptions });\n}\nstate.lastModified = action.input.lastModified;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "remove-facet-binding",
              name: "REMOVE_FACET_BINDING",
              description: "Removes a facet binding from a service",
              schema:
                "input RemoveFacetBindingInput {\n    serviceId: OID!\n    bindingId: OID!\n    lastModified: DateTime!\n}",
              template: "Removes a facet binding from a service",
              reducer:
                "const service = state.services.find(s => s.id === action.input.serviceId);\nif (service) {\n    const bindingIndex = service.facetBindings.findIndex(fb => fb.id === action.input.bindingId);\n    if (bindingIndex !== -1) { service.facetBindings.splice(bindingIndex, 1); }\n}\nstate.lastModified = action.input.lastModified;",
              errors: [],
              examples: [],
              scope: "global",
            },
          ],
        },
        {
          id: "option-group-management",
          name: "Option Group Management",
          description: "Operations for managing option groups and FAQs",
          operations: [
            {
              id: "add-option-group",
              name: "ADD_OPTION_GROUP",
              description: "Adds an option group",
              schema:
                "input AddOptionGroupInput {\n    id: OID!\n    name: String!\n    description: String\n    isAddOn: Boolean!\n    defaultSelected: Boolean!\n    lastModified: DateTime!\n}",
              template: "Adds an option group",
              reducer:
                "state.optionGroups.push({ id: action.input.id, name: action.input.name, description: action.input.description || null, isAddOn: action.input.isAddOn, defaultSelected: action.input.defaultSelected });\nstate.lastModified = action.input.lastModified;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "update-option-group",
              name: "UPDATE_OPTION_GROUP",
              description: "Updates an option group",
              schema:
                "input UpdateOptionGroupInput {\n    id: OID!\n    name: String\n    description: String\n    isAddOn: Boolean\n    defaultSelected: Boolean\n    lastModified: DateTime!\n}",
              template: "Updates an option group",
              reducer:
                "const optionGroup = state.optionGroups.find(og => og.id === action.input.id);\nif (optionGroup) {\n    if (action.input.name) optionGroup.name = action.input.name;\n    if (action.input.description !== undefined) optionGroup.description = action.input.description || null;\n    if (action.input.isAddOn !== undefined && action.input.isAddOn !== null) optionGroup.isAddOn = action.input.isAddOn;\n    if (action.input.defaultSelected !== undefined && action.input.defaultSelected !== null) optionGroup.defaultSelected = action.input.defaultSelected;\n}\nstate.lastModified = action.input.lastModified;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "delete-option-group",
              name: "DELETE_OPTION_GROUP",
              description: "Deletes an option group",
              schema:
                "input DeleteOptionGroupInput {\n    id: OID!\n    lastModified: DateTime!\n}",
              template: "Deletes an option group",
              reducer:
                "const optionGroupIndex = state.optionGroups.findIndex(og => og.id === action.input.id);\nif (optionGroupIndex !== -1) {\n    state.services.forEach(service => { if (service.optionGroupId === action.input.id) { service.optionGroupId = null; } });\n    state.optionGroups.splice(optionGroupIndex, 1);\n}\nstate.lastModified = action.input.lastModified;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "add-faq",
              name: "ADD_FAQ",
              description: "Adds a FAQ field",
              schema:
                "input AddFaqInput {\n    id: OID!\n    question: String\n    answer: String\n    displayOrder: Int!\n}",
              template: "Adds a FAQ field",
              reducer:
                "state.faqFields.push({ id: action.input.id, question: action.input.question || null, answer: action.input.answer || null, displayOrder: action.input.displayOrder });",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "update-faq",
              name: "UPDATE_FAQ",
              description: "Updates a FAQ field",
              schema:
                "input UpdateFaqInput {\n    id: OID!\n    question: String\n    answer: String\n}",
              template: "Updates a FAQ field",
              reducer:
                "const faqField = state.faqFields.find(f => f.id === action.input.id);\nif (faqField) {\n    if (action.input.question !== undefined) faqField.question = action.input.question || null;\n    if (action.input.answer !== undefined) faqField.answer = action.input.answer || null;\n}",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "delete-faq",
              name: "DELETE_FAQ",
              description: "Deletes a FAQ field",
              schema: "input DeleteFaqInput {\n    id: OID!\n}",
              template: "Deletes a FAQ field",
              reducer:
                "const faqIndex = state.faqFields.findIndex(f => f.id === action.input.id);\nif (faqIndex !== -1) { state.faqFields.splice(faqIndex, 1); }",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "reorder-faqs",
              name: "REORDER_FAQS",
              description: "Reorders FAQ fields",
              schema:
                "input ReorderFaqsInput {\n    faqIds: [OID!]!\n    lastModified: DateTime!\n}",
              template: "Reorders FAQ fields",
              reducer:
                "action.input.faqIds.forEach((id, index) => {\n    const faq = state.faqFields.find(f => f.id === id);\n    if (faq) { faq.displayOrder = index; }\n});\nstate.lastModified = action.input.lastModified;",
              errors: [],
              examples: [],
              scope: "global",
            },
          ],
        },
        {
          id: "content-section-management",
          name: "Content Section Management",
          description: "Operations for managing expandable content sections",
          operations: [
            {
              id: "add-content-section",
              name: "ADD_CONTENT_SECTION",
              description: "Adds a content section",
              schema:
                "input AddContentSectionInput {\n    id: OID!\n    title: String!\n    content: String!\n    displayOrder: Int!\n    lastModified: DateTime!\n}",
              template: "Adds a content section",
              reducer:
                "state.contentSections.push({ id: action.input.id, title: action.input.title, content: action.input.content, displayOrder: action.input.displayOrder });\nstate.lastModified = action.input.lastModified;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "update-content-section",
              name: "UPDATE_CONTENT_SECTION",
              description: "Updates a content section",
              schema:
                "input UpdateContentSectionInput {\n    id: OID!\n    title: String\n    content: String\n    displayOrder: Int\n    lastModified: DateTime!\n}",
              template: "Updates a content section",
              reducer:
                "const section = state.contentSections.find(s => s.id === action.input.id);\nif (section) {\n    if (action.input.title) section.title = action.input.title;\n    if (action.input.content !== undefined && action.input.content !== null) section.content = action.input.content;\n    if (action.input.displayOrder !== undefined && action.input.displayOrder !== null) section.displayOrder = action.input.displayOrder;\n}\nstate.lastModified = action.input.lastModified;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "delete-content-section",
              name: "DELETE_CONTENT_SECTION",
              description: "Deletes a content section",
              schema:
                "input DeleteContentSectionInput {\n    id: OID!\n    lastModified: DateTime!\n}",
              template: "Deletes a content section",
              reducer:
                "const sectionIndex = state.contentSections.findIndex(s => s.id === action.input.id);\nif (sectionIndex !== -1) { state.contentSections.splice(sectionIndex, 1); }\nstate.lastModified = action.input.lastModified;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "reorder-content-sections",
              name: "REORDER_CONTENT_SECTIONS",
              description: "Reorders content sections",
              schema:
                "input ReorderContentSectionsInput {\n    sectionIds: [OID!]!\n    lastModified: DateTime!\n}",
              template: "Reorders content sections",
              reducer:
                "action.input.sectionIds.forEach((id, index) => {\n    const section = state.contentSections.find(s => s.id === id);\n    if (section) { section.displayOrder = index; }\n});\nstate.lastModified = action.input.lastModified;",
              errors: [],
              examples: [],
              scope: "global",
            },
          ],
        },
      ],
      version: 1,
      changeLog: [],
    },
  ],
};
