import { useState } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  WorkBreakdownAction,
  WorkBreakdownDocument,
  DemoStep,
  DemoSubstep,
} from "../../../document-models/work-breakdown/gen/types.js";
import {
  addStep,
  updateStep,
  removeStep,
  addSubstep,
  updateSubstep,
  removeSubstep,
} from "../../../document-models/work-breakdown/gen/creators.js";

interface Props {
  document: WorkBreakdownDocument;
  dispatch: DocumentDispatch<WorkBreakdownAction>;
}

export function ScenarioBuilder({ document, dispatch }: Props) {
  const state = document.state.global;
  const sortedSteps = [...state.steps].sort((a, b) => a.order - b.order);

  // AI extraction state
  const [isExtracting, setIsExtracting] = useState(false);

  // Expanded step tracking
  const [expandedStepIds, setExpandedStepIds] = useState<Set<string>>(
    new Set(),
  );

  // Add step form
  const [showAddStep, setShowAddStep] = useState(false);
  const [newStepName, setNewStepName] = useState("");
  const [newStepDescription, setNewStepDescription] = useState("");

  // Editing step
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editStepName, setEditStepName] = useState("");
  const [editStepDescription, setEditStepDescription] = useState("");
  const [editStepOrder, setEditStepOrder] = useState(1);

  // Add substep form
  const [addSubstepStepId, setAddSubstepStepId] = useState<string | null>(null);
  const [newSubstepName, setNewSubstepName] = useState("");
  const [newSubstepDescription, setNewSubstepDescription] = useState("");
  const [newSubstepCriteria, setNewSubstepCriteria] = useState("");

  // Editing substep
  const [editingSubstepKey, setEditingSubstepKey] = useState<string | null>(
    null,
  );
  const [editSubstepName, setEditSubstepName] = useState("");
  const [editSubstepDescription, setEditSubstepDescription] = useState("");
  const [editSubstepCriteria, setEditSubstepCriteria] = useState("");
  const [editSubstepOrder, setEditSubstepOrder] = useState(1);

  // Confirm delete
  const [confirmDeleteStepId, setConfirmDeleteStepId] = useState<string | null>(
    null,
  );

  function toggleExpand(stepId: string) {
    setExpandedStepIds((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  }

  // -- Add Step --
  function handleAddStep() {
    if (!newStepName.trim()) return;
    dispatch(
      addStep({
        id: generateId(),
        order: state.steps.length + 1,
        name: newStepName.trim(),
        description: newStepDescription.trim() || undefined,
      }),
    );
    setNewStepName("");
    setNewStepDescription("");
    setShowAddStep(false);
  }

  // -- Edit Step --
  function startEditStep(step: DemoStep) {
    setEditingStepId(step.id);
    setEditStepName(step.name);
    setEditStepDescription(step.description ?? "");
    setEditStepOrder(step.order);
  }

  function handleSaveStep(id: string) {
    dispatch(
      updateStep({
        id,
        name: editStepName.trim() || undefined,
        description: editStepDescription.trim() || undefined,
        order: editStepOrder,
      }),
    );
    setEditingStepId(null);
  }

  function cancelEditStep() {
    setEditingStepId(null);
  }

  // -- Remove Step --
  function handleRemoveStep(id: string) {
    dispatch(removeStep({ id }));
    setConfirmDeleteStepId(null);
  }

  // -- Add Substep --
  function startAddSubstep(stepId: string) {
    setAddSubstepStepId(stepId);
    setNewSubstepName("");
    setNewSubstepDescription("");
    setNewSubstepCriteria("");
    // Ensure step is expanded
    setExpandedStepIds((prev) => {
      const next = new Set(prev);
      next.add(stepId);
      return next;
    });
  }

  function handleAddSubstep(step: DemoStep) {
    if (!newSubstepName.trim()) return;
    dispatch(
      addSubstep({
        id: generateId(),
        stepId: step.id,
        order: step.substeps.length + 1,
        name: newSubstepName.trim(),
        description: newSubstepDescription.trim() || undefined,
        acceptanceCriteria: newSubstepCriteria.trim() || undefined,
      }),
    );
    setNewSubstepName("");
    setNewSubstepDescription("");
    setNewSubstepCriteria("");
    setAddSubstepStepId(null);
  }

  // -- Edit Substep --
  function startEditSubstep(substep: DemoSubstep) {
    setEditingSubstepKey(`${substep.stepId}:${substep.id}`);
    setEditSubstepName(substep.name);
    setEditSubstepDescription(substep.description ?? "");
    setEditSubstepCriteria(substep.acceptanceCriteria ?? "");
    setEditSubstepOrder(substep.order);
  }

  function handleSaveSubstep(substep: DemoSubstep) {
    dispatch(
      updateSubstep({
        id: substep.id,
        stepId: substep.stepId,
        name: editSubstepName.trim() || undefined,
        description: editSubstepDescription.trim() || undefined,
        acceptanceCriteria: editSubstepCriteria.trim() || undefined,
        order: editSubstepOrder,
      }),
    );
    setEditingSubstepKey(null);
  }

  function cancelEditSubstep() {
    setEditingSubstepKey(null);
  }

  // -- Remove Substep --
  function handleRemoveSubstep(substep: DemoSubstep) {
    dispatch(removeSubstep({ id: substep.id, stepId: substep.stepId }));
  }

  // -- Rule-Based Extraction from Inputs (Powervetra-informed) --
  // ALWAYS generates 7 steps with 7 substeps each
  function handleExtractFromInputs() {
    if (state.inputs.length === 0) {
      alert(
        "No stakeholder inputs to extract from. Add inputs in the Capture tab first.",
      );
      return;
    }

    if (state.steps.length > 0) {
      const confirm = window.confirm(
        "Steps already exist. Extraction will add 7 new steps with 7 substeps each. Continue?",
      );
      if (!confirm) return;
    }

    setIsExtracting(true);

    // Combine all inputs into one text
    const allInputText = state.inputs
      .map((input) => input.rawContent.toLowerCase())
      .join(" ");

    // Powervetra-informed keyword detection
    const keywords = {
      documentModel: /document\s*model|schema|graphql|state|operation|reducer/i,
      editor: /editor|ui|component|react|interface|form/i,
      subgraph: /subgraph|query|resolver|data|api/i,
      processor: /processor|event|transformation/i,
      driveApp: /drive\s*app|multi-document|drive-level/i,
      fullStack: /full[\s-]?stack|end[\s-]?to[\s-]?end|e2e/i,
    };

    const detected = {
      documentModel: keywords.documentModel.test(allInputText),
      editor: keywords.editor.test(allInputText),
      subgraph: keywords.subgraph.test(allInputText),
      processor: keywords.processor.test(allInputText),
      driveApp: keywords.driveApp.test(allInputText),
      fullStack: keywords.fullStack.test(allInputText),
    };

    // Determine workflow pattern based on detection
    let workflowSteps: Array<{
      name: string;
      description: string;
      substeps: Array<{ name: string; description: string }>;
    }> = [];

    if (detected.fullStack) {
      // Full-Stack Feature workflow (7 steps, 7 substeps each)
      workflowSteps = [
        {
          name: "Feature Scoping",
          description: "Define feature boundaries and acceptance criteria",
          substeps: [
            {
              name: "Elicit stakeholder requirements",
              description:
                "Interview stakeholders, gather needs and constraints",
            },
            {
              name: "Define feature scope",
              description: "Set clear boundaries for what's in/out of scope",
            },
            {
              name: "Identify success criteria",
              description: "Define measurable outcomes and KPIs",
            },
            {
              name: "Map user flows",
              description: "Document primary and edge case user journeys",
            },
            {
              name: "Technical feasibility assessment",
              description:
                "Validate technical approach and identify constraints",
            },
            {
              name: "Create acceptance test plan",
              description: "Define test scenarios for validation",
            },
            {
              name: "Document requirements",
              description: "Create comprehensive requirements documentation",
            },
          ],
        },
        {
          name: "Document Model Creation",
          description: "Schema, modules, operations, reducers",
          substeps: [
            {
              name: "Design GraphQL state schema",
              description: "Define types, scalars, enums for document state",
            },
            {
              name: "Plan module structure",
              description: "Group operations into logical modules",
            },
            {
              name: "Define operation input schemas",
              description: "Specify inputs for all document operations",
            },
            {
              name: "Create document model via MCP",
              description: "Use reactor-mcp to create and configure model",
            },
            {
              name: "Implement reducer logic",
              description: "Write pure synchronous reducers for all operations",
            },
            {
              name: "Add error handling",
              description:
                "Define operation errors with unique names per operation",
            },
            {
              name: "Run quality checks",
              description: "Execute npm run tsc && npm run lint:fix",
            },
          ],
        },
        {
          name: "Editor Implementation",
          description: "UI components with hooks and dispatch",
          substeps: [
            {
              name: "Create editor document",
              description:
                "Generate editor via MCP and confirm with SET_EDITOR_STATUS",
            },
            {
              name: "Review generated hooks",
              description: "Inspect useSelectedDocument and dispatch patterns",
            },
            {
              name: "Design component architecture",
              description: "Plan modular UI component structure",
            },
            {
              name: "Implement CRUD components",
              description: "Build forms, lists, and action handlers",
            },
            {
              name: "Wire dispatch operations",
              description:
                "Connect UI events to document operations via dispatch",
            },
            {
              name: "Style with Tailwind",
              description: "Apply responsive styling and design system",
            },
            {
              name: "Test editor functionality",
              description: "Validate all CRUD flows and edge cases",
            },
          ],
        },
        {
          name: "Subgraph/Processor Setup",
          description: "Data views, relational DB hooks if needed",
          substeps: [
            {
              name: "Define query requirements",
              description: "Identify data access patterns and queries needed",
            },
            {
              name: "Create subgraph schema",
              description: "Define GraphQL queries, mutations, and types",
            },
            {
              name: "Implement resolvers",
              description: "Write resolver logic for data fetching",
            },
            {
              name: "Set up processor (if needed)",
              description: "Configure event-driven data transformation",
            },
            {
              name: "Add database hooks",
              description: "Integrate PGlite/Kysely for relational views",
            },
            {
              name: "Test queries",
              description: "Validate query performance and correctness",
            },
            {
              name: "Integrate with gateway",
              description: "Stitch subgraph into supergraph",
            },
          ],
        },
        {
          name: "Integration Testing",
          description: "End-to-end flow verification",
          substeps: [
            {
              name: "Set up test environment",
              description: "Configure test database and mock dependencies",
            },
            {
              name: "Write integration tests",
              description: "Test full user flows across all layers",
            },
            {
              name: "Test document operations",
              description: "Validate all CRUD operations work correctly",
            },
            {
              name: "Test data queries",
              description: "Verify subgraph queries return correct data",
            },
            {
              name: "Test error scenarios",
              description: "Validate error handling and edge cases",
            },
            {
              name: "Performance testing",
              description: "Check response times and resource usage",
            },
            {
              name: "Fix integration issues",
              description: "Resolve any bugs found during testing",
            },
          ],
        },
        {
          name: "Drive & Preview Setup",
          description: "Populate preview drive with demo data",
          substeps: [
            {
              name: "Create preview documents",
              description: "Generate sample document instances",
            },
            {
              name: "Add to preview drive",
              description: "Organize documents in preview-{hash} drive",
            },
            {
              name: "Create demo scenarios",
              description: "Set up realistic test data for demonstrations",
            },
            {
              name: "Verify document rendering",
              description: "Ensure editors display documents correctly",
            },
            {
              name: "Test document operations",
              description: "Validate all CRUD operations on preview docs",
            },
            {
              name: "Document demo flows",
              description: "Create guide for demonstrating features",
            },
            {
              name: "Review with stakeholders",
              description: "Get feedback on demo data and flows",
            },
          ],
        },
        {
          name: "Deployment Preparation",
          description: "Build, publish, manifest verification",
          substeps: [
            {
              name: "Run production build",
              description: "Execute pnpm build and verify success",
            },
            {
              name: "Update manifest",
              description: "Verify powerhouse.manifest.json is current",
            },
            {
              name: "Version bump",
              description: "Update package.json version appropriately",
            },
            {
              name: "Generate changelog",
              description: "Document changes since last release",
            },
            {
              name: "Publish to npm",
              description: "Run npm publish --access public",
            },
            {
              name: "Verify publication",
              description: "Check package is available on npm registry",
            },
            {
              name: "Tag release",
              description: "Create git tag and push to repository",
            },
          ],
        },
      ];
    } else if (detected.documentModel && !detected.editor) {
      // Document Model Only workflow
      workflowSteps = [
        {
          name: "Requirements Gathering",
          description: "Elicit stakeholder needs, define domain entities",
          substeps: [
            {
              name: "Interview stakeholders",
              description: "Gather requirements from users and domain experts",
            },
            {
              name: "Identify domain entities",
              description: "Map out core domain objects and relationships",
            },
            {
              name: "Define state structure",
              description: "Sketch out document state shape",
            },
            {
              name: "List required operations",
              description: "Enumerate all needed CRUD and business operations",
            },
            {
              name: "Identify validation rules",
              description: "Document business logic and constraints",
            },
            {
              name: "Define success criteria",
              description: "Set clear acceptance criteria for completion",
            },
            {
              name: "Document requirements",
              description: "Create comprehensive requirements doc",
            },
          ],
        },
        {
          name: "Schema Design",
          description: "Define GraphQL state types, scalars, enums",
          substeps: [
            {
              name: "Design state type",
              description: "Create DocumentModelState type in GraphQL",
            },
            {
              name: "Define custom types",
              description: "Create domain-specific object types",
            },
            {
              name: "Select scalar types",
              description: "Choose appropriate scalars (OID, DateTime, etc)",
            },
            {
              name: "Define enums",
              description: "Create enums for status codes and categories",
            },
            {
              name: "Design array structures",
              description: "Ensure arrays are [ObjectType!]! with id: OID!",
            },
            {
              name: "Set field optionality",
              description: "Determine which fields are required vs optional",
            },
            {
              name: "Review schema",
              description: "Validate schema follows Powerhouse conventions",
            },
          ],
        },
        {
          name: "Module & Operation Planning",
          description: "Group operations into modules, define inputs",
          substeps: [
            {
              name: "Identify module boundaries",
              description: "Group related operations into logical modules",
            },
            {
              name: "Design operation inputs",
              description: "Create input types for each operation",
            },
            {
              name: "Define operation outputs",
              description: "Specify expected operation results",
            },
            {
              name: "Plan error scenarios",
              description: "Identify failure modes for each operation",
            },
            {
              name: "Create operation examples",
              description: "Write example inputs/outputs for documentation",
            },
            {
              name: "Review naming conventions",
              description: "Ensure operations follow naming standards",
            },
            {
              name: "Document operation specs",
              description: "Write detailed specifications for each operation",
            },
          ],
        },
        {
          name: "MCP Implementation",
          description: "Create document model via reactor-mcp, set schemas",
          substeps: [
            {
              name: "Create document model",
              description: "Use mcp__reactor-mcp__createDocument",
            },
            {
              name: "Set basic metadata",
              description: "Use SET_MODEL_NAME, SET_MODEL_DESCRIPTION, etc",
            },
            {
              name: "Set state schema",
              description: "Use SET_STATE_SCHEMA with GraphQL schema",
            },
            {
              name: "Add modules",
              description: "Create modules using ADD_MODULE",
            },
            {
              name: "Add operations",
              description: "Create operations using ADD_OPERATION",
            },
            {
              name: "Set operation schemas",
              description: "Define input/output with SET_OPERATION_SCHEMA",
            },
            {
              name: "Add to vetra drive",
              description: "Use ADD_FILE to add document to vetra-{hash}",
            },
          ],
        },
        {
          name: "Reducer Implementation",
          description: "Write pure synchronous reducer logic",
          substeps: [
            {
              name: "Review generated stubs",
              description:
                "Check src/reducers/ for placeholder implementations",
            },
            {
              name: "Implement CRUD reducers",
              description: "Write add/update/remove reducer logic",
            },
            {
              name: "Handle state mutations",
              description: "Use Mutative's direct mutation style",
            },
            {
              name: "Validate inputs",
              description: "Add input validation and error throwing",
            },
            {
              name: "Update via MCP",
              description: "Use SET_OPERATION_REDUCER to update model",
            },
            {
              name: "Test reducer purity",
              description: "Verify no side effects or randomness",
            },
            {
              name: "Update source files",
              description: "Manually update src/reducers/*.ts files",
            },
          ],
        },
        {
          name: "Error Handling",
          description: "Define operation errors, edge cases",
          substeps: [
            {
              name: "Identify error scenarios",
              description: "List all possible failure modes per operation",
            },
            {
              name: "Define error types",
              description:
                "Create unique error names (prefixed with operation name)",
            },
            {
              name: "Add via MCP",
              description: "Use ADD_OPERATION_ERROR for each error",
            },
            {
              name: "Set error codes",
              description: "Assign uppercase snake_case error codes",
            },
            {
              name: "Write error messages",
              description: "Create clear, actionable error descriptions",
            },
            {
              name: "Implement error throwing",
              description: "Add throw statements in reducers",
            },
            {
              name: "Test error cases",
              description: "Verify errors are thrown correctly",
            },
          ],
        },
        {
          name: "Quality Assurance",
          description: "TypeScript checks, linting, testing",
          substeps: [
            {
              name: "Run TypeScript check",
              description: "Execute npm run tsc to verify types",
            },
            {
              name: "Fix type errors",
              description: "Resolve any TypeScript compilation errors",
            },
            {
              name: "Run linter",
              description: "Execute npm run lint:fix",
            },
            {
              name: "Fix lint warnings",
              description: "Address ESLint issues",
            },
            {
              name: "Write unit tests",
              description: "Test individual reducer functions",
            },
            {
              name: "Test operation flows",
              description: "Validate end-to-end operation sequences",
            },
            {
              name: "Document usage",
              description: "Create usage examples and documentation",
            },
          ],
        },
      ];
    } else if (detected.editor && !detected.documentModel) {
      // Editor Only workflow
      workflowSteps = [
        {
          name: "Model Review",
          description: "Understand document model state and operations",
          substeps: [
            {
              name: "Read document model schema",
              description: "Review GraphQL state types and structure",
            },
            {
              name: "Review available operations",
              description: "List all operations and their input schemas",
            },
            {
              name: "Understand state flow",
              description: "Map how operations transform state",
            },
            {
              name: "Identify UI requirements",
              description: "Determine what UI is needed for each operation",
            },
            {
              name: "Review existing hooks",
              description: "Check what hooks are available",
            },
            {
              name: "Plan component structure",
              description: "Sketch component hierarchy",
            },
            {
              name: "Document architecture",
              description: "Create architecture documentation",
            },
          ],
        },
        {
          name: "Editor Scaffolding",
          description: "Create editor document, confirm via MCP",
          substeps: [
            {
              name: "Create editor document",
              description:
                "Use mcp__reactor-mcp__createDocument with type powerhouse/document-editor",
            },
            {
              name: "Set editor name",
              description: "Use SET_EDITOR_NAME with descriptive name",
            },
            {
              name: "Add document types",
              description: "Use ADD_DOCUMENT_TYPE to specify target models",
            },
            {
              name: "Confirm editor",
              description: "Use SET_EDITOR_STATUS with status: CONFIRMED",
            },
            {
              name: "Add to vetra drive",
              description: "Use ADD_FILE action to add to vetra-{hash}",
            },
            {
              name: "Wait for generation",
              description: "Allow code generator to create editor files",
            },
            {
              name: "Review generated files",
              description: "Check editors/{name}/ folder structure",
            },
          ],
        },
        {
          name: "Hook Integration",
          description: "Wire useSelectedDocument and dispatch hooks",
          substeps: [
            {
              name: "Import document hook",
              description: "Import useSelected{Model}Document from hooks/",
            },
            {
              name: "Import action creators",
              description:
                "Import operations from document-models/.../gen/creators",
            },
            {
              name: "Set up dispatch pattern",
              description: "Destructure [document, dispatch] from hook",
            },
            {
              name: "Access document state",
              description: "Use document.state.global to read state",
            },
            {
              name: "Generate IDs properly",
              description:
                "Use generateId() from document-model/core for new items",
            },
            {
              name: "Handle timestamps",
              description: "Pass new Date().toISOString() for DateTime fields",
            },
            {
              name: "Test dispatch flow",
              description: "Verify operations correctly update state",
            },
          ],
        },
        {
          name: "Component Architecture",
          description: "Design modular UI components",
          substeps: [
            {
              name: "Create component files",
              description: "Set up components/ folder with modular files",
            },
            {
              name: "Build list components",
              description: "Create components to display collections",
            },
            {
              name: "Build form components",
              description: "Create components for data entry",
            },
            {
              name: "Build detail components",
              description: "Create components for viewing single items",
            },
            {
              name: "Separate business logic",
              description: "Extract handlers and logic from presentation",
            },
            {
              name: "Use design system",
              description:
                "Import components from @powerhousedao/design-system",
            },
            {
              name: "Keep DocumentToolbar",
              description: "Ensure <DocumentToolbar /> remains in editor",
            },
          ],
        },
        {
          name: "Form & Interaction Logic",
          description: "Implement CRUD flows, validation",
          substeps: [
            {
              name: "Implement create forms",
              description: "Build forms for adding new items",
            },
            {
              name: "Implement update forms",
              description: "Build forms for editing existing items",
            },
            {
              name: "Add delete confirmations",
              description: "Implement safe delete with confirmation",
            },
            {
              name: "Add client-side validation",
              description: "Validate inputs before dispatch",
            },
            {
              name: "Handle form state",
              description: "Use React state for form inputs",
            },
            {
              name: "Add keyboard shortcuts",
              description: "Support Cmd/Ctrl+Enter for form submission",
            },
            {
              name: "Test all CRUD flows",
              description: "Verify create, read, update, delete all work",
            },
          ],
        },
        {
          name: "Styling & Polish",
          description: "Tailwind/scoped styles, responsive layout",
          substeps: [
            {
              name: "Apply Tailwind classes",
              description: "Style components with utility classes",
            },
            {
              name: "Add scoped styles",
              description: "Use style tags with specific selectors",
            },
            {
              name: "Make responsive",
              description: "Ensure layout works on mobile and desktop",
            },
            {
              name: "Add loading states",
              description: "Show loading indicators where appropriate",
            },
            {
              name: "Add empty states",
              description: "Design helpful empty state messages",
            },
            {
              name: "Polish animations",
              description: "Add subtle transitions and animations",
            },
            {
              name: "Review accessibility",
              description: "Check ARIA labels and keyboard navigation",
            },
          ],
        },
        {
          name: "Testing & Review",
          description: "Visual review, type checking, lint",
          substeps: [
            {
              name: "Run TypeScript check",
              description: "Execute npm run tsc",
            },
            {
              name: "Fix type errors",
              description: "Resolve TypeScript issues",
            },
            {
              name: "Run linter",
              description: "Execute npm run lint:fix",
            },
            {
              name: "Visual testing",
              description: "Test editor in browser with real documents",
            },
            {
              name: "Test all operations",
              description: "Manually verify each CRUD operation",
            },
            {
              name: "Test edge cases",
              description: "Verify error handling and boundary conditions",
            },
            {
              name: "Get user feedback",
              description: "Review with stakeholders",
            },
          ],
        },
      ];
    } else if (detected.subgraph) {
      // Subgraph Integration workflow
      workflowSteps = [
        {
          name: "Data Requirements",
          description: "Identify query patterns and data sources",
          substeps: [
            {
              name: "Identify data consumers",
              description: "Determine who/what needs data from subgraph",
            },
            {
              name: "Map query patterns",
              description: "Document expected queries and mutations",
            },
            {
              name: "Identify data sources",
              description:
                "Determine where data comes from (documents, DB, etc)",
            },
            {
              name: "Define performance requirements",
              description: "Set SLAs for query response times",
            },
            {
              name: "Plan caching strategy",
              description: "Decide what data needs caching",
            },
            {
              name: "Document authorization needs",
              description: "Define who can access what data",
            },
            {
              name: "Create requirements doc",
              description: "Write comprehensive data requirements",
            },
          ],
        },
        {
          name: "Schema Definition",
          description: "GraphQL types, queries, mutations",
          substeps: [
            {
              name: "Define GraphQL types",
              description: "Create types for all domain entities",
            },
            {
              name: "Define query operations",
              description: "Create queries for data retrieval",
            },
            {
              name: "Define mutations",
              description: "Create mutations for data modification",
            },
            {
              name: "Add input types",
              description: "Define input types for queries and mutations",
            },
            {
              name: "Define interfaces and unions",
              description: "Create shared interfaces where appropriate",
            },
            {
              name: "Add pagination support",
              description: "Implement cursor or offset pagination",
            },
            {
              name: "Document schema",
              description: "Add descriptions to all types and fields",
            },
          ],
        },
        {
          name: "Resolver Implementation",
          description: "Data fetching and transformation logic",
          substeps: [
            {
              name: "Implement query resolvers",
              description: "Write resolver functions for all queries",
            },
            {
              name: "Implement mutation resolvers",
              description: "Write resolver functions for mutations",
            },
            {
              name: "Add data loaders",
              description: "Implement DataLoader for batching and caching",
            },
            {
              name: "Handle nested resolvers",
              description: "Implement resolvers for nested fields",
            },
            {
              name: "Add error handling",
              description: "Handle and format errors appropriately",
            },
            {
              name: "Implement authorization",
              description: "Add permission checks in resolvers",
            },
            {
              name: "Test resolvers",
              description: "Unit test all resolver logic",
            },
          ],
        },
        {
          name: "Processor Setup",
          description: "Event-driven data transformation if needed",
          substeps: [
            {
              name: "Identify events to process",
              description: "List document operations to react to",
            },
            {
              name: "Design transformation logic",
              description: "Plan how events transform into data",
            },
            {
              name: "Implement processor",
              description: "Write event handler functions",
            },
            {
              name: "Add error handling",
              description: "Handle processor failures gracefully",
            },
            {
              name: "Implement retry logic",
              description: "Add retry for transient failures",
            },
            {
              name: "Add monitoring",
              description: "Log processor activity and errors",
            },
            {
              name: "Test processor",
              description: "Verify events are processed correctly",
            },
          ],
        },
        {
          name: "Gateway Integration",
          description: "Supergraph stitching, routing verification",
          substeps: [
            {
              name: "Configure gateway",
              description: "Add subgraph to gateway configuration",
            },
            {
              name: "Implement schema stitching",
              description: "Connect subgraph to supergraph",
            },
            {
              name: "Set up routing",
              description: "Configure query routing to subgraph",
            },
            {
              name: "Add federation support",
              description: "Implement @key directives if using federation",
            },
            {
              name: "Test cross-subgraph queries",
              description: "Verify queries spanning multiple subgraphs work",
            },
            {
              name: "Configure CORS",
              description: "Set up CORS for client access",
            },
            {
              name: "Deploy gateway changes",
              description: "Update gateway deployment",
            },
          ],
        },
        {
          name: "Database Hooks",
          description: "PGlite/Kysely relational views",
          substeps: [
            {
              name: "Design relational schema",
              description: "Plan tables and indexes for PGlite",
            },
            {
              name: "Create migration scripts",
              description: "Write database schema migrations",
            },
            {
              name: "Implement Kysely models",
              description: "Define TypeScript types for database tables",
            },
            {
              name: "Write query builders",
              description: "Create helper functions for common queries",
            },
            {
              name: "Add transaction support",
              description: "Implement transactional operations",
            },
            {
              name: "Optimize indexes",
              description: "Add indexes for query performance",
            },
            {
              name: "Test database operations",
              description: "Verify CRUD operations work correctly",
            },
          ],
        },
        {
          name: "Validation & Monitoring",
          description: "Query testing, performance verification",
          substeps: [
            {
              name: "Write integration tests",
              description: "Test full query flows end-to-end",
            },
            {
              name: "Load test queries",
              description: "Verify performance under load",
            },
            {
              name: "Set up monitoring",
              description: "Add query performance tracking",
            },
            {
              name: "Add error tracking",
              description: "Implement error logging and alerting",
            },
            {
              name: "Validate data accuracy",
              description: "Verify query results match expectations",
            },
            {
              name: "Review security",
              description: "Audit authorization and data access",
            },
            {
              name: "Document API",
              description: "Create API documentation for consumers",
            },
          ],
        },
      ];
    } else if (detected.driveApp) {
      // Drive App workflow
      workflowSteps = [
        {
          name: "App Requirements",
          description: "Define app scope, target document types",
          substeps: [
            {
              name: "Define app purpose",
              description: "Clarify what the drive app will do",
            },
            {
              name: "Identify target document types",
              description: "List which document models app will manage",
            },
            {
              name: "Define user workflows",
              description: "Map out primary user journeys",
            },
            {
              name: "Plan navigation structure",
              description: "Design app navigation and routing",
            },
            {
              name: "Identify cross-document features",
              description: "Plan features that span multiple documents",
            },
            {
              name: "Define success criteria",
              description: "Set measurable goals for app",
            },
            {
              name: "Document requirements",
              description: "Create comprehensive requirements doc",
            },
          ],
        },
        {
          name: "Document Model Dependencies",
          description: "Verify/create needed document models",
          substeps: [
            {
              name: "List required document models",
              description: "Enumerate all document types needed",
            },
            {
              name: "Check existing models",
              description: "Verify which models already exist",
            },
            {
              name: "Create missing models",
              description: "Build any missing document models",
            },
            {
              name: "Verify model operations",
              description: "Ensure operations support app needs",
            },
            {
              name: "Add missing operations",
              description: "Extend models with needed operations",
            },
            {
              name: "Test model integration",
              description: "Verify models work together",
            },
            {
              name: "Document model dependencies",
              description: "Record which models app depends on",
            },
          ],
        },
        {
          name: "App Scaffolding",
          description: "Create app document, confirm via MCP",
          substeps: [
            {
              name: "Create app document",
              description:
                "Use mcp__reactor-mcp__createDocument with type powerhouse/app",
            },
            {
              name: "Set app name",
              description: "Use SET_APP_NAME with descriptive name",
            },
            {
              name: "Add document types",
              description: "Use ADD_DOCUMENT_TYPE to specify managed types",
            },
            {
              name: "Confirm app",
              description: "Use SET_APP_STATUS with status: CONFIRMED",
            },
            {
              name: "Add to vetra drive",
              description: "Use ADD_FILE to add to vetra-{hash}",
            },
            {
              name: "Wait for generation",
              description: "Allow code generator to create app files",
            },
            {
              name: "Review generated structure",
              description: "Check generated app folder structure",
            },
          ],
        },
        {
          name: "Multi-Document UI",
          description: "Implement drive-level views and navigation",
          substeps: [
            {
              name: "Build document list view",
              description: "Create view showing all documents in drive",
            },
            {
              name: "Add document filtering",
              description: "Implement filtering by type, date, etc",
            },
            {
              name: "Add document search",
              description: "Implement search across documents",
            },
            {
              name: "Build navigation",
              description: "Create sidebar or top nav for app sections",
            },
            {
              name: "Add routing",
              description: "Implement client-side routing between views",
            },
            {
              name: "Build dashboard view",
              description: "Create overview showing stats and summaries",
            },
            {
              name: "Add breadcrumbs",
              description: "Show user's location in app hierarchy",
            },
          ],
        },
        {
          name: "Cross-Document Operations",
          description: "Link documents, aggregate data",
          substeps: [
            {
              name: "Implement document linking",
              description: "Allow documents to reference each other",
            },
            {
              name: "Build aggregation views",
              description: "Show data aggregated across documents",
            },
            {
              name: "Add bulk operations",
              description: "Support operating on multiple documents at once",
            },
            {
              name: "Implement document export",
              description: "Allow exporting multiple documents",
            },
            {
              name: "Add document import",
              description: "Support importing multiple documents",
            },
            {
              name: "Build reporting features",
              description: "Create reports spanning multiple documents",
            },
            {
              name: "Test cross-document flows",
              description: "Verify multi-document operations work",
            },
          ],
        },
        {
          name: "User Experience Polish",
          description: "Responsive design, accessibility",
          substeps: [
            {
              name: "Make fully responsive",
              description: "Ensure app works on all screen sizes",
            },
            {
              name: "Add loading states",
              description: "Show loading indicators for async operations",
            },
            {
              name: "Add empty states",
              description: "Design helpful empty state messages",
            },
            {
              name: "Improve error messages",
              description: "Show clear, actionable error messages",
            },
            {
              name: "Add keyboard shortcuts",
              description: "Support power user keyboard navigation",
            },
            {
              name: "Review accessibility",
              description: "Ensure WCAG compliance",
            },
            {
              name: "User testing",
              description: "Get feedback from real users",
            },
          ],
        },
        {
          name: "Build & Publish",
          description: "Package verification, npm publish",
          substeps: [
            {
              name: "Run production build",
              description: "Execute pnpm build",
            },
            {
              name: "Verify build output",
              description: "Check dist/ folder for correct files",
            },
            {
              name: "Update package.json",
              description: "Set version, dependencies, metadata",
            },
            {
              name: "Generate changelog",
              description: "Document changes since last version",
            },
            {
              name: "Publish to npm",
              description: "Run npm publish --access public",
            },
            {
              name: "Tag release",
              description: "Create git tag for release",
            },
            {
              name: "Document deployment",
              description: "Update docs with deployment instructions",
            },
          ],
        },
      ];
    } else {
      // Generic/Fallback workflow - still 7 steps with 7 substeps
      workflowSteps = [
        {
          name: "Planning & Requirements",
          description: "Define project scope and requirements",
          substeps: [
            {
              name: "Gather stakeholder input",
              description: "Interview users and stakeholders",
            },
            {
              name: "Define project goals",
              description: "Set clear, measurable objectives",
            },
            {
              name: "Identify constraints",
              description: "Document technical and resource limitations",
            },
            {
              name: "Create user stories",
              description: "Write user stories for key features",
            },
            {
              name: "Prioritize requirements",
              description: "Order requirements by business value",
            },
            {
              name: "Define acceptance criteria",
              description: "Specify what constitutes done",
            },
            {
              name: "Document requirements",
              description: "Create comprehensive requirements doc",
            },
          ],
        },
        {
          name: "Technical Design",
          description: "Architecture and technical planning",
          substeps: [
            {
              name: "Review existing systems",
              description: "Understand current architecture",
            },
            {
              name: "Design data model",
              description: "Plan data structures and relationships",
            },
            {
              name: "Plan module structure",
              description: "Break system into logical modules",
            },
            {
              name: "Select technologies",
              description: "Choose appropriate tools and frameworks",
            },
            {
              name: "Design interfaces",
              description: "Define APIs and integration points",
            },
            {
              name: "Plan for scalability",
              description: "Design for growth and performance",
            },
            {
              name: "Document architecture",
              description: "Create technical design documentation",
            },
          ],
        },
        {
          name: "Core Implementation",
          description: "Build fundamental functionality",
          substeps: [
            {
              name: "Set up project structure",
              description: "Create folder structure and configuration",
            },
            {
              name: "Implement data layer",
              description: "Build data models and persistence",
            },
            {
              name: "Implement business logic",
              description: "Write core application logic",
            },
            {
              name: "Build API layer",
              description: "Create APIs for external access",
            },
            {
              name: "Add error handling",
              description: "Implement comprehensive error handling",
            },
            {
              name: "Write unit tests",
              description: "Test individual components",
            },
            {
              name: "Code review",
              description: "Review implementation for quality",
            },
          ],
        },
        {
          name: "User Interface",
          description: "Build user-facing components",
          substeps: [
            {
              name: "Design UI mockups",
              description: "Create visual designs for interfaces",
            },
            {
              name: "Build component library",
              description: "Create reusable UI components",
            },
            {
              name: "Implement layouts",
              description: "Build page layouts and navigation",
            },
            {
              name: "Wire up data flow",
              description: "Connect UI to backend data",
            },
            {
              name: "Add interactivity",
              description: "Implement user interactions and feedback",
            },
            {
              name: "Style and polish",
              description: "Apply final styling and UX improvements",
            },
            {
              name: "Test UI flows",
              description: "Validate all user journeys work",
            },
          ],
        },
        {
          name: "Integration & Testing",
          description: "Connect components and validate",
          substeps: [
            {
              name: "Integration testing",
              description: "Test component interactions",
            },
            {
              name: "End-to-end testing",
              description: "Test complete user workflows",
            },
            {
              name: "Performance testing",
              description: "Verify performance meets requirements",
            },
            {
              name: "Security testing",
              description: "Check for security vulnerabilities",
            },
            {
              name: "Fix bugs",
              description: "Resolve issues found in testing",
            },
            {
              name: "User acceptance testing",
              description: "Validate with real users",
            },
            {
              name: "Address feedback",
              description: "Make changes based on testing feedback",
            },
          ],
        },
        {
          name: "Documentation",
          description: "Create comprehensive documentation",
          substeps: [
            {
              name: "Write user documentation",
              description: "Create guides for end users",
            },
            {
              name: "Write API documentation",
              description: "Document all APIs and interfaces",
            },
            {
              name: "Create architecture docs",
              description: "Document system architecture",
            },
            {
              name: "Write deployment guide",
              description: "Document deployment procedures",
            },
            {
              name: "Create troubleshooting guide",
              description: "Document common issues and solutions",
            },
            {
              name: "Add code comments",
              description: "Improve inline code documentation",
            },
            {
              name: "Review documentation",
              description: "Validate docs are complete and accurate",
            },
          ],
        },
        {
          name: "Deployment & Launch",
          description: "Deploy to production and launch",
          substeps: [
            {
              name: "Prepare production environment",
              description: "Set up production infrastructure",
            },
            {
              name: "Create deployment pipeline",
              description: "Automate deployment process",
            },
            {
              name: "Deploy to staging",
              description: "Deploy to staging environment first",
            },
            {
              name: "Validate staging deployment",
              description: "Verify everything works in staging",
            },
            {
              name: "Deploy to production",
              description: "Deploy to production environment",
            },
            {
              name: "Monitor deployment",
              description: "Watch for issues during rollout",
            },
            {
              name: "Announce launch",
              description: "Communicate launch to stakeholders",
            },
          ],
        },
      ];
    }

    // Add all 7 steps with 7 substeps each to the document
    workflowSteps.forEach((step, stepIndex) => {
      const stepId = generateId();
      dispatch(
        addStep({
          id: stepId,
          order: state.steps.length + stepIndex + 1,
          name: step.name,
          description: step.description,
        }),
      );

      // Add all 7 substeps
      step.substeps.forEach((substep, subIndex) => {
        dispatch(
          addSubstep({
            id: generateId(),
            stepId,
            order: subIndex + 1,
            name: substep.name,
            description: substep.description,
            acceptanceCriteria: undefined,
          }),
        );
      });
    });

    setIsExtracting(false);
    alert(
      `Successfully extracted 7 steps with 7 substeps each (49 total substeps)!`,
    );
  }

  // -- Empty State --
  if (sortedSteps.length === 0 && !showAddStep) {
    return (
      <div className="wb-panel">
        <div className="wb-panel-empty">
          <svg
            style={{ width: 40, height: 40, opacity: 0.4 }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          <p className="wb-panel-empty__text">
            No demo steps defined yet. Add your first step to build out the
            scenario.
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {state.inputs.length > 0 ? (
              <button
                className="wb-btn"
                onClick={handleExtractFromInputs}
                type="button"
                disabled={isExtracting}
              >
                <svg
                  className="wb-btn__icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                {isExtracting ? "Extracting..." : "Extract from Inputs"}
              </button>
            ) : null}
            <button
              className="wb-btn wb-btn--primary"
              onClick={() => setShowAddStep(true)}
              type="button"
            >
              Add First Step
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="wb-panel">
        <div className="wb-panel__header">
          <div>
            <h2 className="wb-panel__title">Scenario Builder</h2>
            <p className="wb-panel__subtitle">
              Define the demo steps and substeps for this work breakdown
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="wb-btn wb-btn--sm"
              onClick={handleExtractFromInputs}
              type="button"
              disabled={isExtracting || state.inputs.length === 0}
              title={
                state.inputs.length === 0
                  ? "No inputs to extract from"
                  : "Use AI to extract steps from stakeholder inputs"
              }
            >
              <svg
                className="wb-btn__icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              {isExtracting ? "Extracting..." : "Extract from Inputs"}
            </button>
            <button
              className="wb-btn wb-btn--primary wb-btn--sm"
              onClick={() => setShowAddStep(true)}
              type="button"
            >
              + Add Step
            </button>
          </div>
        </div>

        {/* Add Step Form */}
        {showAddStep && (
          <div
            className="wb-card"
            style={{ marginBottom: 16, background: "var(--wb-surface-alt)" }}
          >
            <div style={{ marginBottom: 10 }}>
              <label className="wb-label" htmlFor="wb-scenario-new-step-name">
                Step Name *
              </label>
              <input
                id="wb-scenario-new-step-name"
                className="wb-input"
                type="text"
                value={newStepName}
                onChange={(e) => setNewStepName(e.target.value)}
                placeholder="e.g. Environment Setup"
                autoFocus
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label className="wb-label" htmlFor="wb-scenario-new-step-desc">
                Description
              </label>
              <textarea
                id="wb-scenario-new-step-desc"
                className="wb-textarea"
                value={newStepDescription}
                onChange={(e) => setNewStepDescription(e.target.value)}
                placeholder="Optional description of this step"
                style={{ minHeight: 60 }}
              />
            </div>
            <div className="wb-card__actions">
              <button
                className="wb-btn wb-btn--primary wb-btn--sm"
                onClick={handleAddStep}
                type="button"
                disabled={!newStepName.trim()}
              >
                Add Step
              </button>
              <button
                className="wb-btn wb-btn--sm"
                onClick={() => {
                  setShowAddStep(false);
                  setNewStepName("");
                  setNewStepDescription("");
                }}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Step Cards */}
        {sortedSteps.map((step) => {
          const isExpanded = expandedStepIds.has(step.id);
          const isEditing = editingStepId === step.id;
          const isConfirmingDelete = confirmDeleteStepId === step.id;
          const sortedSubsteps = [...step.substeps].sort(
            (a, b) => a.order - b.order,
          );

          return (
            <div key={step.id} className="wb-card">
              {isEditing ? (
                /* -- Editing Step -- */
                <div>
                  <div className="wb-grid-2" style={{ marginBottom: 10 }}>
                    <div>
                      <label
                        className="wb-label"
                        htmlFor={`wb-scenario-edit-name-${step.id}`}
                      >
                        Name
                      </label>
                      <input
                        id={`wb-scenario-edit-name-${step.id}`}
                        className="wb-input"
                        type="text"
                        value={editStepName}
                        onChange={(e) => setEditStepName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        className="wb-label"
                        htmlFor={`wb-scenario-edit-order-${step.id}`}
                      >
                        Order
                      </label>
                      <input
                        id={`wb-scenario-edit-order-${step.id}`}
                        className="wb-input"
                        type="number"
                        min={1}
                        value={editStepOrder}
                        onChange={(e) =>
                          setEditStepOrder(parseInt(e.target.value, 10) || 1)
                        }
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label
                      className="wb-label"
                      htmlFor={`wb-scenario-edit-desc-${step.id}`}
                    >
                      Description
                    </label>
                    <textarea
                      id={`wb-scenario-edit-desc-${step.id}`}
                      className="wb-textarea"
                      value={editStepDescription}
                      onChange={(e) => setEditStepDescription(e.target.value)}
                      style={{ minHeight: 60 }}
                    />
                  </div>
                  <div className="wb-card__actions">
                    <button
                      className="wb-btn wb-btn--primary wb-btn--sm"
                      onClick={() => handleSaveStep(step.id)}
                      type="button"
                    >
                      Save
                    </button>
                    <button
                      className="wb-btn wb-btn--sm"
                      onClick={cancelEditStep}
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* -- Display Step -- */
                <div>
                  <div className="wb-card__header">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        cursor: "pointer",
                        flex: 1,
                      }}
                      onClick={() => toggleExpand(step.id)}
                    >
                      <span
                        className="wb-mono"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: "var(--wb-indigo-50)",
                          color: "var(--wb-indigo-600)",
                          fontWeight: 700,
                          fontSize: 12,
                          flexShrink: 0,
                        }}
                      >
                        {step.order}
                      </span>
                      <div style={{ flex: 1 }}>
                        <h3 className="wb-card__title">{step.name}</h3>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span className="wb-card__meta">
                          {step.substeps.length}{" "}
                          {step.substeps.length === 1 ? "substep" : "substeps"}
                        </span>
                        {step.templateStepId && (
                          <span className="wb-status wb-status--extracted">
                            TEMPLATE
                          </span>
                        )}
                        <svg
                          style={{
                            width: 16,
                            height: 16,
                            transition: "transform 180ms ease",
                            transform: isExpanded
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                            color: "var(--wb-text-muted)",
                          }}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {step.description && (
                    <p className="wb-card__body" style={{ marginBottom: 6 }}>
                      {step.description}
                    </p>
                  )}

                  {/* Step Actions */}
                  <div className="wb-card__actions">
                    <button
                      className="wb-btn wb-btn--ghost wb-btn--sm"
                      onClick={() => startEditStep(step)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="wb-btn wb-btn--ghost wb-btn--sm"
                      onClick={() => startAddSubstep(step.id)}
                      type="button"
                    >
                      + Substep
                    </button>
                    {isConfirmingDelete ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--wb-rose-600)",
                          }}
                        >
                          Remove this step?
                        </span>
                        <button
                          className="wb-btn wb-btn--danger wb-btn--sm"
                          onClick={() => handleRemoveStep(step.id)}
                          type="button"
                        >
                          Yes
                        </button>
                        <button
                          className="wb-btn wb-btn--sm"
                          onClick={() => setConfirmDeleteStepId(null)}
                          type="button"
                        >
                          No
                        </button>
                      </span>
                    ) : (
                      <button
                        className="wb-btn wb-btn--ghost wb-btn--sm wb-btn--danger"
                        onClick={() => setConfirmDeleteStepId(step.id)}
                        type="button"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Expanded Substeps */}
                  {isExpanded && (
                    <div
                      style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: "1px solid var(--wb-border)",
                        paddingLeft: 38,
                      }}
                    >
                      {sortedSubsteps.length === 0 &&
                        addSubstepStepId !== step.id && (
                          <p
                            className="wb-card__meta"
                            style={{
                              fontStyle: "italic",
                              marginBottom: 8,
                            }}
                          >
                            No substeps yet.
                          </p>
                        )}

                      {sortedSubsteps.map((substep) => {
                        const substepKey = `${substep.stepId}:${substep.id}`;
                        const isEditingSubstep =
                          editingSubstepKey === substepKey;

                        return (
                          <div
                            key={substep.id}
                            style={{
                              padding: "10px 12px",
                              borderLeft: "2px solid var(--wb-indigo-200)",
                              marginBottom: 8,
                              background: "var(--wb-surface-alt)",
                              borderRadius:
                                "0 var(--wb-radius-sm) var(--wb-radius-sm) 0",
                            }}
                          >
                            {isEditingSubstep ? (
                              /* -- Editing Substep -- */
                              <div>
                                <div
                                  className="wb-grid-2"
                                  style={{ marginBottom: 8 }}
                                >
                                  <div>
                                    <label
                                      className="wb-label"
                                      htmlFor={`wb-scenario-edit-substep-name-${substep.id}`}
                                    >
                                      Name
                                    </label>
                                    <input
                                      id={`wb-scenario-edit-substep-name-${substep.id}`}
                                      className="wb-input"
                                      type="text"
                                      value={editSubstepName}
                                      onChange={(e) =>
                                        setEditSubstepName(e.target.value)
                                      }
                                    />
                                  </div>
                                  <div>
                                    <label
                                      className="wb-label"
                                      htmlFor={`wb-scenario-edit-substep-order-${substep.id}`}
                                    >
                                      Order
                                    </label>
                                    <input
                                      id={`wb-scenario-edit-substep-order-${substep.id}`}
                                      className="wb-input"
                                      type="number"
                                      min={1}
                                      value={editSubstepOrder}
                                      onChange={(e) =>
                                        setEditSubstepOrder(
                                          parseInt(e.target.value, 10) || 1,
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                  <label
                                    className="wb-label"
                                    htmlFor={`wb-scenario-edit-substep-desc-${substep.id}`}
                                  >
                                    Description
                                  </label>
                                  <textarea
                                    id={`wb-scenario-edit-substep-desc-${substep.id}`}
                                    className="wb-textarea"
                                    value={editSubstepDescription}
                                    onChange={(e) =>
                                      setEditSubstepDescription(e.target.value)
                                    }
                                    style={{ minHeight: 50 }}
                                  />
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                  <label
                                    className="wb-label"
                                    htmlFor={`wb-scenario-edit-substep-criteria-${substep.id}`}
                                  >
                                    Acceptance Criteria
                                  </label>
                                  <textarea
                                    id={`wb-scenario-edit-substep-criteria-${substep.id}`}
                                    className="wb-textarea"
                                    value={editSubstepCriteria}
                                    onChange={(e) =>
                                      setEditSubstepCriteria(e.target.value)
                                    }
                                    style={{ minHeight: 50 }}
                                  />
                                </div>
                                <div className="wb-card__actions">
                                  <button
                                    className="wb-btn wb-btn--primary wb-btn--sm"
                                    onClick={() => handleSaveSubstep(substep)}
                                    type="button"
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="wb-btn wb-btn--sm"
                                    onClick={cancelEditSubstep}
                                    type="button"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* -- Display Substep -- */
                              <div>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    justifyContent: "space-between",
                                    gap: 8,
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: 8,
                                      alignItems: "flex-start",
                                    }}
                                  >
                                    <span
                                      className="wb-mono"
                                      style={{
                                        fontSize: 11,
                                        color: "var(--wb-text-muted)",
                                        flexShrink: 0,
                                        marginTop: 2,
                                      }}
                                    >
                                      {step.order}.{substep.order}
                                    </span>
                                    <div>
                                      <span
                                        style={{
                                          fontSize: 13,
                                          fontWeight: 600,
                                          color: "var(--wb-text)",
                                        }}
                                      >
                                        {substep.name}
                                      </span>
                                      {substep.description && (
                                        <p
                                          style={{
                                            fontSize: 12,
                                            color: "var(--wb-text-secondary)",
                                            margin: "2px 0 0",
                                          }}
                                        >
                                          {substep.description}
                                        </p>
                                      )}
                                      {substep.acceptanceCriteria && (
                                        <p
                                          style={{
                                            fontSize: 11,
                                            color: "var(--wb-text-muted)",
                                            margin: "4px 0 0",
                                            fontStyle: "italic",
                                          }}
                                        >
                                          Criteria: {substep.acceptanceCriteria}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: 4,
                                      flexShrink: 0,
                                    }}
                                  >
                                    <button
                                      className="wb-btn wb-btn--ghost wb-btn--sm"
                                      onClick={() => startEditSubstep(substep)}
                                      type="button"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="wb-btn wb-btn--ghost wb-btn--sm wb-btn--danger"
                                      onClick={() =>
                                        handleRemoveSubstep(substep)
                                      }
                                      type="button"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Add Substep Form (inline within expanded step) */}
                      {addSubstepStepId === step.id && (
                        <div
                          style={{
                            padding: "12px",
                            borderLeft: "2px solid var(--wb-emerald-500)",
                            marginBottom: 8,
                            background: "var(--wb-surface-alt)",
                            borderRadius:
                              "0 var(--wb-radius-sm) var(--wb-radius-sm) 0",
                          }}
                        >
                          <div style={{ marginBottom: 8 }}>
                            <label
                              className="wb-label"
                              htmlFor={`wb-scenario-new-substep-name-${step.id}`}
                            >
                              Substep Name *
                            </label>
                            <input
                              id={`wb-scenario-new-substep-name-${step.id}`}
                              className="wb-input"
                              type="text"
                              value={newSubstepName}
                              onChange={(e) =>
                                setNewSubstepName(e.target.value)
                              }
                              placeholder="e.g. Configure database"
                              autoFocus
                            />
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <label
                              className="wb-label"
                              htmlFor={`wb-scenario-new-substep-desc-${step.id}`}
                            >
                              Description
                            </label>
                            <textarea
                              id={`wb-scenario-new-substep-desc-${step.id}`}
                              className="wb-textarea"
                              value={newSubstepDescription}
                              onChange={(e) =>
                                setNewSubstepDescription(e.target.value)
                              }
                              placeholder="Optional description"
                              style={{ minHeight: 50 }}
                            />
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <label
                              className="wb-label"
                              htmlFor={`wb-scenario-new-substep-criteria-${step.id}`}
                            >
                              Acceptance Criteria
                            </label>
                            <textarea
                              id={`wb-scenario-new-substep-criteria-${step.id}`}
                              className="wb-textarea"
                              value={newSubstepCriteria}
                              onChange={(e) =>
                                setNewSubstepCriteria(e.target.value)
                              }
                              placeholder="What defines done for this substep?"
                              style={{ minHeight: 50 }}
                            />
                          </div>
                          <div className="wb-card__actions">
                            <button
                              className="wb-btn wb-btn--primary wb-btn--sm"
                              onClick={() => handleAddSubstep(step)}
                              type="button"
                              disabled={!newSubstepName.trim()}
                            >
                              Add Substep
                            </button>
                            <button
                              className="wb-btn wb-btn--sm"
                              onClick={() => setAddSubstepStepId(null)}
                              type="button"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
