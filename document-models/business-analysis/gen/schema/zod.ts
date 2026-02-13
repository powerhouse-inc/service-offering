import * as z from "zod";
import type {
  AcceptanceCriterion,
  ActivityEntry,
  AddAcceptanceCriterionInput,
  AddAnalysisEntryInput,
  AddAnalysisInput,
  AddAssumptionInput,
  AddChangeRequestInput,
  AddDecisionInput,
  AddDeliverableInput,
  AddGlossaryTermInput,
  AddKpiInput,
  AddProcessInput,
  AddProcessStepInput,
  AddRequirementCategoryInput,
  AddRequirementInput,
  AddRiskInput,
  AddScopeItemInput,
  AddStakeholderInput,
  AnalysisArtifact,
  AnalysisEntry,
  AnalysisType,
  Assumption,
  AssumptionStatus,
  BusinessAnalysisState,
  BusinessProcess,
  ChangeImpact,
  ChangeRequest,
  ChangeRequestStatus,
  Decision,
  DecisionStatus,
  Deliverable,
  DeliverableStatus,
  DeliverableType,
  EngagementLevel,
  FeedbackStatus,
  FeedbackType,
  GlossaryTerm,
  Kpi,
  KpiMeasurement,
  KpiStatus,
  LinkRequirementsInput,
  LogActivityInput,
  MeasurementFrequency,
  Priority,
  ProcessStep,
  ProcessType,
  ProjectPhase,
  ProjectStatus,
  RecordKpiMeasurementInput,
  RemoveAcceptanceCriterionInput,
  RemoveAnalysisEntryInput,
  RemoveAnalysisInput,
  RemoveAssumptionInput,
  RemoveDecisionInput,
  RemoveDeliverableInput,
  RemoveFeedbackInput,
  RemoveGlossaryTermInput,
  RemoveKpiInput,
  RemoveProcessInput,
  RemoveProcessStepInput,
  RemoveRequirementCategoryInput,
  RemoveRequirementInput,
  RemoveRiskInput,
  RemoveScopeItemInput,
  RemoveStakeholderInput,
  ReorderProcessStepsInput,
  Requirement,
  RequirementCategory,
  RequirementStatus,
  RequirementType,
  ResolveFeedbackInput,
  RespondToFeedbackInput,
  Risk,
  RiskLevel,
  RiskStatus,
  ScopeItem,
  ScopeItemType,
  SetAssumptionStatusInput,
  SetChangeRequestStatusInput,
  SetDecisionStatusInput,
  SetDeliverableStatusInput,
  SetEngagementLevelInput,
  SetKpiStatusInput,
  SetProjectInfoInput,
  SetProjectPhaseInput,
  SetProjectStatusInput,
  SetRequirementStatusInput,
  SetRiskStatusInput,
  Stakeholder,
  StakeholderFeedback,
  StakeholderInfluence,
  StakeholderInterest,
  StepType,
  SubmitFeedbackInput,
  UpdateAcceptanceCriterionInput,
  UpdateAnalysisEntryInput,
  UpdateAnalysisInput,
  UpdateAssumptionInput,
  UpdateChangeRequestInput,
  UpdateDecisionInput,
  UpdateDeliverableInput,
  UpdateGlossaryTermInput,
  UpdateKpiInput,
  UpdateProcessInput,
  UpdateProcessStepInput,
  UpdateRequirementCategoryInput,
  UpdateRequirementInput,
  UpdateRiskInput,
  UpdateScopeItemInput,
  UpdateStakeholderInput,
} from "./types.js";

type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K]>;
}>;

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny =>
  v !== undefined && v !== null;

export const definedNonNullAnySchema = z
  .any()
  .refine((v) => isDefinedNonNullAny(v));

export const AnalysisTypeSchema = z.enum([
  "COST_BENEFIT",
  "CUSTOM",
  "FIVE_WHYS",
  "GAP_ANALYSIS",
  "MOSCOW",
  "PESTLE",
  "ROOT_CAUSE",
  "SWOT",
]);

export const AssumptionStatusSchema = z.enum([
  "ACTIVE",
  "INVALIDATED",
  "VALIDATED",
]);

export const ChangeImpactSchema = z.enum(["CRITICAL", "HIGH", "LOW", "MEDIUM"]);

export const ChangeRequestStatusSchema = z.enum([
  "APPROVED",
  "IMPLEMENTED",
  "REJECTED",
  "SUBMITTED",
  "UNDER_REVIEW",
]);

export const DecisionStatusSchema = z.enum([
  "DECIDED",
  "DEFERRED",
  "PROPOSED",
  "REVERSED",
  "UNDER_DISCUSSION",
]);

export const DeliverableStatusSchema = z.enum([
  "APPROVED",
  "DELIVERED",
  "IN_PROGRESS",
  "NOT_STARTED",
  "UNDER_REVIEW",
]);

export const DeliverableTypeSchema = z.enum([
  "BRD",
  "DATA_FLOW",
  "FUNCTIONAL_SPEC",
  "OTHER",
  "PRESENTATION",
  "PROCESS_MAP",
  "REPORT",
  "TEST_PLAN",
  "TRAINING_MATERIAL",
  "USE_CASE_DIAGRAM",
  "WIREFRAME",
]);

export const EngagementLevelSchema = z.enum([
  "CHAMPION",
  "NEUTRAL",
  "RESISTANT",
  "SUPPORTIVE",
  "UNAWARE",
]);

export const FeedbackStatusSchema = z.enum([
  "ACKNOWLEDGED",
  "INCORPORATED",
  "PENDING",
  "RESOLVED",
]);

export const FeedbackTypeSchema = z.enum([
  "APPROVAL",
  "CHANGE_REQUEST",
  "COMMENT",
  "QUESTION",
  "REJECTION",
]);

export const KpiStatusSchema = z.enum([
  "AT_RISK",
  "NOT_MEASURED",
  "OFF_TRACK",
  "ON_TRACK",
]);

export const MeasurementFrequencySchema = z.enum([
  "ANNUALLY",
  "BIWEEKLY",
  "DAILY",
  "MONTHLY",
  "QUARTERLY",
  "WEEKLY",
]);

export const PrioritySchema = z.enum([
  "COULD_HAVE",
  "MUST_HAVE",
  "SHOULD_HAVE",
  "WONT_HAVE",
]);

export const ProcessTypeSchema = z.enum(["AS_IS", "TO_BE"]);

export const ProjectPhaseSchema = z.enum([
  "ANALYSIS",
  "CLOSED",
  "DESIGN",
  "DISCOVERY",
  "ELICITATION",
  "IMPLEMENTATION",
  "VALIDATION",
]);

export const ProjectStatusSchema = z.enum([
  "CANCELLED",
  "COMPLETED",
  "IN_PROGRESS",
  "NOT_STARTED",
  "ON_HOLD",
]);

export const RequirementStatusSchema = z.enum([
  "APPROVED",
  "DEFERRED",
  "DRAFT",
  "IMPLEMENTED",
  "REJECTED",
  "UNDER_REVIEW",
  "VERIFIED",
]);

export const RequirementTypeSchema = z.enum([
  "BUSINESS_RULE",
  "CONSTRAINT",
  "FUNCTIONAL",
  "NON_FUNCTIONAL",
  "USER_STORY",
]);

export const RiskLevelSchema = z.enum(["CRITICAL", "HIGH", "LOW", "MEDIUM"]);

export const RiskStatusSchema = z.enum([
  "ACCEPTED",
  "ESCALATED",
  "IDENTIFIED",
  "MITIGATING",
  "RESOLVED",
]);

export const ScopeItemTypeSchema = z.enum([
  "DEFERRED",
  "IN_SCOPE",
  "OUT_OF_SCOPE",
]);

export const StakeholderInfluenceSchema = z.enum(["HIGH", "LOW", "MEDIUM"]);

export const StakeholderInterestSchema = z.enum(["HIGH", "LOW", "MEDIUM"]);

export const StepTypeSchema = z.enum([
  "DECISION",
  "END",
  "GATEWAY",
  "START",
  "SUBPROCESS",
  "TASK",
]);

export function AcceptanceCriterionSchema(): z.ZodObject<
  Properties<AcceptanceCriterion>
> {
  return z.object({
    __typename: z.literal("AcceptanceCriterion").optional(),
    description: z.string(),
    id: z.string(),
    verified: z.boolean().nullish(),
  });
}

export function ActivityEntrySchema(): z.ZodObject<Properties<ActivityEntry>> {
  return z.object({
    __typename: z.literal("ActivityEntry").optional(),
    action: z.string(),
    description: z.string().nullish(),
    entityId: z.string().nullish(),
    entityType: z.string().nullish(),
    id: z.string(),
    timestamp: z.string().datetime(),
  });
}

export function AddAcceptanceCriterionInputSchema(): z.ZodObject<
  Properties<AddAcceptanceCriterionInput>
> {
  return z.object({
    description: z.string(),
    id: z.string(),
    requirementId: z.string(),
  });
}

export function AddAnalysisEntryInputSchema(): z.ZodObject<
  Properties<AddAnalysisEntryInput>
> {
  return z.object({
    analysisId: z.string(),
    category: z.string(),
    content: z.string(),
    id: z.string(),
    impact: z.string().nullish(),
    likelihood: z.string().nullish(),
    notes: z.string().nullish(),
  });
}

export function AddAnalysisInputSchema(): z.ZodObject<
  Properties<AddAnalysisInput>
> {
  return z.object({
    createdAt: z.string().datetime(),
    id: z.string(),
    name: z.string(),
    summary: z.string().nullish(),
    type: AnalysisTypeSchema,
  });
}

export function AddAssumptionInputSchema(): z.ZodObject<
  Properties<AddAssumptionInput>
> {
  return z.object({
    category: z.string().nullish(),
    createdAt: z.string().datetime(),
    description: z.string(),
    id: z.string(),
    linkedRequirementIds: z.array(z.string()).nullish(),
    notes: z.string().nullish(),
  });
}

export function AddChangeRequestInputSchema(): z.ZodObject<
  Properties<AddChangeRequestInput>
> {
  return z.object({
    affectedRequirementIds: z.array(z.string()).nullish(),
    createdAt: z.string().datetime(),
    description: z.string().nullish(),
    id: z.string(),
    impact: ChangeImpactSchema.nullish(),
    impactAnalysis: z.string().nullish(),
    requestedBy: z.string().nullish(),
    title: z.string(),
  });
}

export function AddDecisionInputSchema(): z.ZodObject<
  Properties<AddDecisionInput>
> {
  return z.object({
    alternatives: z.array(z.string()).nullish(),
    createdAt: z.string().datetime(),
    description: z.string().nullish(),
    id: z.string(),
    linkedRequirementIds: z.array(z.string()).nullish(),
    stakeholderIds: z.array(z.string()).nullish(),
    title: z.string(),
  });
}

export function AddDeliverableInputSchema(): z.ZodObject<
  Properties<AddDeliverableInput>
> {
  return z.object({
    assignee: z.string().nullish(),
    description: z.string().nullish(),
    dueDate: z.string().datetime().nullish(),
    estimatedHours: z.number().nullish(),
    id: z.string(),
    linkedRequirementIds: z.array(z.string()).nullish(),
    name: z.string(),
    type: DeliverableTypeSchema.nullish(),
    url: z.string().url().nullish(),
  });
}

export function AddGlossaryTermInputSchema(): z.ZodObject<
  Properties<AddGlossaryTermInput>
> {
  return z.object({
    aliases: z.array(z.string()).nullish(),
    context: z.string().nullish(),
    createdAt: z.string().datetime(),
    definition: z.string(),
    id: z.string(),
    linkedRequirementIds: z.array(z.string()).nullish(),
    term: z.string(),
  });
}

export function AddKpiInputSchema(): z.ZodObject<Properties<AddKpiInput>> {
  return z.object({
    createdAt: z.string().datetime(),
    description: z.string().nullish(),
    frequency: MeasurementFrequencySchema.nullish(),
    id: z.string(),
    linkedRequirementIds: z.array(z.string()).nullish(),
    name: z.string(),
    owner: z.string().nullish(),
    targetValue: z.number().nullish(),
    unit: z.string().nullish(),
  });
}

export function AddProcessInputSchema(): z.ZodObject<
  Properties<AddProcessInput>
> {
  return z.object({
    createdAt: z.string().datetime(),
    description: z.string().nullish(),
    id: z.string(),
    name: z.string(),
    owner: z.string().nullish(),
    type: ProcessTypeSchema,
  });
}

export function AddProcessStepInputSchema(): z.ZodObject<
  Properties<AddProcessStepInput>
> {
  return z.object({
    actor: z.string().nullish(),
    automatable: z.boolean().nullish(),
    description: z.string().nullish(),
    duration: z.string().nullish(),
    id: z.string(),
    name: z.string(),
    order: z.number(),
    processId: z.string(),
    type: StepTypeSchema.nullish(),
  });
}

export function AddRequirementCategoryInputSchema(): z.ZodObject<
  Properties<AddRequirementCategoryInput>
> {
  return z.object({
    color: z.string().nullish(),
    description: z.string().nullish(),
    id: z.string(),
    name: z.string(),
  });
}

export function AddRequirementInputSchema(): z.ZodObject<
  Properties<AddRequirementInput>
> {
  return z.object({
    categoryId: z.string().nullish(),
    code: z.string().nullish(),
    createdAt: z.string().datetime(),
    description: z.string().nullish(),
    effort: z.string().nullish(),
    id: z.string(),
    parentRequirementId: z.string().nullish(),
    priority: PrioritySchema.nullish(),
    rationale: z.string().nullish(),
    source: z.string().nullish(),
    stakeholderIds: z.array(z.string()).nullish(),
    tags: z.array(z.string()).nullish(),
    title: z.string(),
    type: RequirementTypeSchema,
  });
}

export function AddRiskInputSchema(): z.ZodObject<Properties<AddRiskInput>> {
  return z.object({
    createdAt: z.string().datetime(),
    description: z.string().nullish(),
    id: z.string(),
    impact: RiskLevelSchema.nullish(),
    linkedRequirementIds: z.array(z.string()).nullish(),
    mitigation: z.string().nullish(),
    owner: z.string().nullish(),
    probability: RiskLevelSchema.nullish(),
    title: z.string(),
  });
}

export function AddScopeItemInputSchema(): z.ZodObject<
  Properties<AddScopeItemInput>
> {
  return z.object({
    createdAt: z.string().datetime(),
    description: z.string(),
    id: z.string(),
    linkedRequirementIds: z.array(z.string()).nullish(),
    rationale: z.string().nullish(),
    type: ScopeItemTypeSchema,
  });
}

export function AddStakeholderInputSchema(): z.ZodObject<
  Properties<AddStakeholderInput>
> {
  return z.object({
    createdAt: z.string().datetime(),
    email: z.string().nullish(),
    engagementLevel: EngagementLevelSchema.nullish(),
    id: z.string(),
    influence: StakeholderInfluenceSchema.nullish(),
    interest: StakeholderInterestSchema.nullish(),
    name: z.string(),
    notes: z.string().nullish(),
    organization: z.string().nullish(),
    role: z.string().nullish(),
  });
}

export function AnalysisArtifactSchema(): z.ZodObject<
  Properties<AnalysisArtifact>
> {
  return z.object({
    __typename: z.literal("AnalysisArtifact").optional(),
    createdAt: z.string().datetime().nullish(),
    entries: z.array(z.lazy(() => AnalysisEntrySchema())),
    id: z.string(),
    name: z.string(),
    summary: z.string().nullish(),
    type: AnalysisTypeSchema,
  });
}

export function AnalysisEntrySchema(): z.ZodObject<Properties<AnalysisEntry>> {
  return z.object({
    __typename: z.literal("AnalysisEntry").optional(),
    category: z.string(),
    content: z.string(),
    id: z.string(),
    impact: z.string().nullish(),
    likelihood: z.string().nullish(),
    notes: z.string().nullish(),
  });
}

export function AssumptionSchema(): z.ZodObject<Properties<Assumption>> {
  return z.object({
    __typename: z.literal("Assumption").optional(),
    category: z.string().nullish(),
    createdAt: z.string().datetime().nullish(),
    description: z.string(),
    id: z.string(),
    linkedRequirementIds: z.array(z.string()),
    notes: z.string().nullish(),
    status: AssumptionStatusSchema.nullish(),
    validatedAt: z.string().datetime().nullish(),
    validatedBy: z.string().nullish(),
  });
}

export function BusinessAnalysisStateSchema(): z.ZodObject<
  Properties<BusinessAnalysisState>
> {
  return z.object({
    __typename: z.literal("BusinessAnalysisState").optional(),
    activityLog: z.array(z.lazy(() => ActivityEntrySchema())),
    analyses: z.array(z.lazy(() => AnalysisArtifactSchema())),
    assumptions: z.array(z.lazy(() => AssumptionSchema())),
    changeRequests: z.array(z.lazy(() => ChangeRequestSchema())),
    decisions: z.array(z.lazy(() => DecisionSchema())),
    deliverables: z.array(z.lazy(() => DeliverableSchema())),
    feedback: z.array(z.lazy(() => StakeholderFeedbackSchema())),
    glossary: z.array(z.lazy(() => GlossaryTermSchema())),
    kpis: z.array(z.lazy(() => KpiSchema())),
    organization: z.string().nullish(),
    processes: z.array(z.lazy(() => BusinessProcessSchema())),
    projectDescription: z.string().nullish(),
    projectName: z.string().nullish(),
    projectPhase: ProjectPhaseSchema.nullish(),
    projectStatus: ProjectStatusSchema.nullish(),
    requirementCategories: z.array(z.lazy(() => RequirementCategorySchema())),
    requirements: z.array(z.lazy(() => RequirementSchema())),
    risks: z.array(z.lazy(() => RiskSchema())),
    scopeItems: z.array(z.lazy(() => ScopeItemSchema())),
    sponsor: z.string().nullish(),
    stakeholders: z.array(z.lazy(() => StakeholderSchema())),
    startDate: z.string().datetime().nullish(),
    targetEndDate: z.string().datetime().nullish(),
  });
}

export function BusinessProcessSchema(): z.ZodObject<
  Properties<BusinessProcess>
> {
  return z.object({
    __typename: z.literal("BusinessProcess").optional(),
    createdAt: z.string().datetime().nullish(),
    description: z.string().nullish(),
    id: z.string(),
    improvements: z.array(z.string()),
    linkedRequirementIds: z.array(z.string()),
    name: z.string(),
    owner: z.string().nullish(),
    painPoints: z.array(z.string()),
    steps: z.array(z.lazy(() => ProcessStepSchema())),
    type: ProcessTypeSchema,
  });
}

export function ChangeRequestSchema(): z.ZodObject<Properties<ChangeRequest>> {
  return z.object({
    __typename: z.literal("ChangeRequest").optional(),
    affectedRequirementIds: z.array(z.string()),
    createdAt: z.string().datetime().nullish(),
    description: z.string().nullish(),
    id: z.string(),
    impact: ChangeImpactSchema.nullish(),
    impactAnalysis: z.string().nullish(),
    requestedBy: z.string().nullish(),
    resolution: z.string().nullish(),
    resolvedAt: z.string().datetime().nullish(),
    status: ChangeRequestStatusSchema.nullish(),
    title: z.string(),
  });
}

export function DecisionSchema(): z.ZodObject<Properties<Decision>> {
  return z.object({
    __typename: z.literal("Decision").optional(),
    alternatives: z.array(z.string()),
    createdAt: z.string().datetime().nullish(),
    decidedAt: z.string().datetime().nullish(),
    description: z.string().nullish(),
    id: z.string(),
    linkedRequirementIds: z.array(z.string()),
    outcome: z.string().nullish(),
    rationale: z.string().nullish(),
    stakeholderIds: z.array(z.string()),
    status: DecisionStatusSchema.nullish(),
    title: z.string(),
  });
}

export function DeliverableSchema(): z.ZodObject<Properties<Deliverable>> {
  return z.object({
    __typename: z.literal("Deliverable").optional(),
    assignee: z.string().nullish(),
    completedAt: z.string().datetime().nullish(),
    description: z.string().nullish(),
    dueDate: z.string().datetime().nullish(),
    estimatedHours: z.number().nullish(),
    id: z.string(),
    linkedRequirementIds: z.array(z.string()),
    name: z.string(),
    status: DeliverableStatusSchema.nullish(),
    type: DeliverableTypeSchema.nullish(),
    url: z.string().url().nullish(),
  });
}

export function GlossaryTermSchema(): z.ZodObject<Properties<GlossaryTerm>> {
  return z.object({
    __typename: z.literal("GlossaryTerm").optional(),
    aliases: z.array(z.string()),
    context: z.string().nullish(),
    createdAt: z.string().datetime().nullish(),
    definition: z.string(),
    id: z.string(),
    linkedRequirementIds: z.array(z.string()),
    term: z.string(),
  });
}

export function KpiSchema(): z.ZodObject<Properties<Kpi>> {
  return z.object({
    __typename: z.literal("KPI").optional(),
    createdAt: z.string().datetime().nullish(),
    currentValue: z.number().nullish(),
    description: z.string().nullish(),
    frequency: MeasurementFrequencySchema.nullish(),
    id: z.string(),
    linkedRequirementIds: z.array(z.string()),
    measurements: z.array(z.lazy(() => KpiMeasurementSchema())),
    name: z.string(),
    owner: z.string().nullish(),
    status: KpiStatusSchema.nullish(),
    targetValue: z.number().nullish(),
    unit: z.string().nullish(),
  });
}

export function KpiMeasurementSchema(): z.ZodObject<
  Properties<KpiMeasurement>
> {
  return z.object({
    __typename: z.literal("KPIMeasurement").optional(),
    id: z.string(),
    notes: z.string().nullish(),
    recordedAt: z.string().datetime(),
    value: z.number(),
  });
}

export function LinkRequirementsInputSchema(): z.ZodObject<
  Properties<LinkRequirementsInput>
> {
  return z.object({
    id: z.string(),
    linkedProcessIds: z.array(z.string()).nullish(),
    linkedRequirementIds: z.array(z.string()).nullish(),
  });
}

export function LogActivityInputSchema(): z.ZodObject<
  Properties<LogActivityInput>
> {
  return z.object({
    action: z.string(),
    description: z.string().nullish(),
    entityId: z.string().nullish(),
    entityType: z.string().nullish(),
    id: z.string(),
    timestamp: z.string().datetime(),
  });
}

export function ProcessStepSchema(): z.ZodObject<Properties<ProcessStep>> {
  return z.object({
    __typename: z.literal("ProcessStep").optional(),
    actor: z.string().nullish(),
    automatable: z.boolean().nullish(),
    description: z.string().nullish(),
    duration: z.string().nullish(),
    id: z.string(),
    name: z.string(),
    order: z.number(),
    type: StepTypeSchema.nullish(),
  });
}

export function RecordKpiMeasurementInputSchema(): z.ZodObject<
  Properties<RecordKpiMeasurementInput>
> {
  return z.object({
    id: z.string(),
    kpiId: z.string(),
    notes: z.string().nullish(),
    recordedAt: z.string().datetime(),
    value: z.number(),
  });
}

export function RemoveAcceptanceCriterionInputSchema(): z.ZodObject<
  Properties<RemoveAcceptanceCriterionInput>
> {
  return z.object({
    id: z.string(),
    requirementId: z.string(),
  });
}

export function RemoveAnalysisEntryInputSchema(): z.ZodObject<
  Properties<RemoveAnalysisEntryInput>
> {
  return z.object({
    analysisId: z.string(),
    id: z.string(),
  });
}

export function RemoveAnalysisInputSchema(): z.ZodObject<
  Properties<RemoveAnalysisInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveAssumptionInputSchema(): z.ZodObject<
  Properties<RemoveAssumptionInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveDecisionInputSchema(): z.ZodObject<
  Properties<RemoveDecisionInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveDeliverableInputSchema(): z.ZodObject<
  Properties<RemoveDeliverableInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveFeedbackInputSchema(): z.ZodObject<
  Properties<RemoveFeedbackInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveGlossaryTermInputSchema(): z.ZodObject<
  Properties<RemoveGlossaryTermInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveKpiInputSchema(): z.ZodObject<
  Properties<RemoveKpiInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveProcessInputSchema(): z.ZodObject<
  Properties<RemoveProcessInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveProcessStepInputSchema(): z.ZodObject<
  Properties<RemoveProcessStepInput>
> {
  return z.object({
    id: z.string(),
    processId: z.string(),
  });
}

export function RemoveRequirementCategoryInputSchema(): z.ZodObject<
  Properties<RemoveRequirementCategoryInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveRequirementInputSchema(): z.ZodObject<
  Properties<RemoveRequirementInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveRiskInputSchema(): z.ZodObject<
  Properties<RemoveRiskInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveScopeItemInputSchema(): z.ZodObject<
  Properties<RemoveScopeItemInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveStakeholderInputSchema(): z.ZodObject<
  Properties<RemoveStakeholderInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function ReorderProcessStepsInputSchema(): z.ZodObject<
  Properties<ReorderProcessStepsInput>
> {
  return z.object({
    order: z.array(z.string()),
    processId: z.string(),
  });
}

export function RequirementSchema(): z.ZodObject<Properties<Requirement>> {
  return z.object({
    __typename: z.literal("Requirement").optional(),
    acceptanceCriteria: z.array(z.lazy(() => AcceptanceCriterionSchema())),
    categoryId: z.string().nullish(),
    code: z.string().nullish(),
    createdAt: z.string().datetime().nullish(),
    description: z.string().nullish(),
    effort: z.string().nullish(),
    id: z.string(),
    linkedProcessIds: z.array(z.string()),
    linkedRequirementIds: z.array(z.string()),
    parentRequirementId: z.string().nullish(),
    priority: PrioritySchema.nullish(),
    rationale: z.string().nullish(),
    source: z.string().nullish(),
    stakeholderIds: z.array(z.string()),
    status: RequirementStatusSchema.nullish(),
    tags: z.array(z.string()),
    title: z.string(),
    type: RequirementTypeSchema,
    updatedAt: z.string().datetime().nullish(),
  });
}

export function RequirementCategorySchema(): z.ZodObject<
  Properties<RequirementCategory>
> {
  return z.object({
    __typename: z.literal("RequirementCategory").optional(),
    color: z.string().nullish(),
    description: z.string().nullish(),
    id: z.string(),
    name: z.string(),
  });
}

export function ResolveFeedbackInputSchema(): z.ZodObject<
  Properties<ResolveFeedbackInput>
> {
  return z.object({
    analystResponse: z.string().nullish(),
    id: z.string(),
    resolvedAt: z.string().datetime(),
    status: FeedbackStatusSchema,
  });
}

export function RespondToFeedbackInputSchema(): z.ZodObject<
  Properties<RespondToFeedbackInput>
> {
  return z.object({
    analystResponse: z.string(),
    id: z.string(),
  });
}

export function RiskSchema(): z.ZodObject<Properties<Risk>> {
  return z.object({
    __typename: z.literal("Risk").optional(),
    createdAt: z.string().datetime().nullish(),
    description: z.string().nullish(),
    id: z.string(),
    impact: RiskLevelSchema.nullish(),
    linkedRequirementIds: z.array(z.string()),
    mitigation: z.string().nullish(),
    owner: z.string().nullish(),
    probability: RiskLevelSchema.nullish(),
    status: RiskStatusSchema.nullish(),
    title: z.string(),
  });
}

export function ScopeItemSchema(): z.ZodObject<Properties<ScopeItem>> {
  return z.object({
    __typename: z.literal("ScopeItem").optional(),
    createdAt: z.string().datetime().nullish(),
    description: z.string(),
    id: z.string(),
    linkedRequirementIds: z.array(z.string()),
    rationale: z.string().nullish(),
    type: ScopeItemTypeSchema,
  });
}

export function SetAssumptionStatusInputSchema(): z.ZodObject<
  Properties<SetAssumptionStatusInput>
> {
  return z.object({
    id: z.string(),
    status: AssumptionStatusSchema,
    validatedAt: z.string().datetime().nullish(),
    validatedBy: z.string().nullish(),
  });
}

export function SetChangeRequestStatusInputSchema(): z.ZodObject<
  Properties<SetChangeRequestStatusInput>
> {
  return z.object({
    id: z.string(),
    resolution: z.string().nullish(),
    resolvedAt: z.string().datetime().nullish(),
    status: ChangeRequestStatusSchema,
  });
}

export function SetDecisionStatusInputSchema(): z.ZodObject<
  Properties<SetDecisionStatusInput>
> {
  return z.object({
    decidedAt: z.string().datetime().nullish(),
    id: z.string(),
    status: DecisionStatusSchema,
  });
}

export function SetDeliverableStatusInputSchema(): z.ZodObject<
  Properties<SetDeliverableStatusInput>
> {
  return z.object({
    completedAt: z.string().datetime().nullish(),
    id: z.string(),
    status: DeliverableStatusSchema,
  });
}

export function SetEngagementLevelInputSchema(): z.ZodObject<
  Properties<SetEngagementLevelInput>
> {
  return z.object({
    engagementLevel: EngagementLevelSchema,
    id: z.string(),
  });
}

export function SetKpiStatusInputSchema(): z.ZodObject<
  Properties<SetKpiStatusInput>
> {
  return z.object({
    id: z.string(),
    status: KpiStatusSchema,
  });
}

export function SetProjectInfoInputSchema(): z.ZodObject<
  Properties<SetProjectInfoInput>
> {
  return z.object({
    organization: z.string().nullish(),
    projectDescription: z.string().nullish(),
    projectName: z.string().nullish(),
    sponsor: z.string().nullish(),
    startDate: z.string().datetime().nullish(),
    targetEndDate: z.string().datetime().nullish(),
  });
}

export function SetProjectPhaseInputSchema(): z.ZodObject<
  Properties<SetProjectPhaseInput>
> {
  return z.object({
    phase: ProjectPhaseSchema,
    timestamp: z.string().datetime(),
  });
}

export function SetProjectStatusInputSchema(): z.ZodObject<
  Properties<SetProjectStatusInput>
> {
  return z.object({
    status: ProjectStatusSchema,
    timestamp: z.string().datetime(),
  });
}

export function SetRequirementStatusInputSchema(): z.ZodObject<
  Properties<SetRequirementStatusInput>
> {
  return z.object({
    id: z.string(),
    status: RequirementStatusSchema,
    updatedAt: z.string().datetime(),
  });
}

export function SetRiskStatusInputSchema(): z.ZodObject<
  Properties<SetRiskStatusInput>
> {
  return z.object({
    id: z.string(),
    status: RiskStatusSchema,
  });
}

export function StakeholderSchema(): z.ZodObject<Properties<Stakeholder>> {
  return z.object({
    __typename: z.literal("Stakeholder").optional(),
    createdAt: z.string().datetime().nullish(),
    email: z.string().nullish(),
    engagementLevel: EngagementLevelSchema.nullish(),
    id: z.string(),
    influence: StakeholderInfluenceSchema.nullish(),
    interest: StakeholderInterestSchema.nullish(),
    name: z.string(),
    notes: z.string().nullish(),
    organization: z.string().nullish(),
    role: z.string().nullish(),
  });
}

export function StakeholderFeedbackSchema(): z.ZodObject<
  Properties<StakeholderFeedback>
> {
  return z.object({
    __typename: z.literal("StakeholderFeedback").optional(),
    analystResponse: z.string().nullish(),
    content: z.string(),
    createdAt: z.string().datetime(),
    entityId: z.string(),
    entityType: z.string(),
    id: z.string(),
    resolvedAt: z.string().datetime().nullish(),
    stakeholderId: z.string(),
    status: FeedbackStatusSchema.nullish(),
    type: FeedbackTypeSchema,
  });
}

export function SubmitFeedbackInputSchema(): z.ZodObject<
  Properties<SubmitFeedbackInput>
> {
  return z.object({
    content: z.string(),
    createdAt: z.string().datetime(),
    entityId: z.string(),
    entityType: z.string(),
    id: z.string(),
    stakeholderId: z.string(),
    type: FeedbackTypeSchema,
  });
}

export function UpdateAcceptanceCriterionInputSchema(): z.ZodObject<
  Properties<UpdateAcceptanceCriterionInput>
> {
  return z.object({
    description: z.string().nullish(),
    id: z.string(),
    requirementId: z.string(),
    verified: z.boolean().nullish(),
  });
}

export function UpdateAnalysisEntryInputSchema(): z.ZodObject<
  Properties<UpdateAnalysisEntryInput>
> {
  return z.object({
    analysisId: z.string(),
    category: z.string().nullish(),
    content: z.string().nullish(),
    id: z.string(),
    impact: z.string().nullish(),
    likelihood: z.string().nullish(),
    notes: z.string().nullish(),
  });
}

export function UpdateAnalysisInputSchema(): z.ZodObject<
  Properties<UpdateAnalysisInput>
> {
  return z.object({
    id: z.string(),
    name: z.string().nullish(),
    summary: z.string().nullish(),
    type: AnalysisTypeSchema.nullish(),
  });
}

export function UpdateAssumptionInputSchema(): z.ZodObject<
  Properties<UpdateAssumptionInput>
> {
  return z.object({
    category: z.string().nullish(),
    description: z.string().nullish(),
    id: z.string(),
    linkedRequirementIds: z.array(z.string()).nullish(),
    notes: z.string().nullish(),
  });
}

export function UpdateChangeRequestInputSchema(): z.ZodObject<
  Properties<UpdateChangeRequestInput>
> {
  return z.object({
    affectedRequirementIds: z.array(z.string()).nullish(),
    description: z.string().nullish(),
    id: z.string(),
    impact: ChangeImpactSchema.nullish(),
    impactAnalysis: z.string().nullish(),
    title: z.string().nullish(),
  });
}

export function UpdateDecisionInputSchema(): z.ZodObject<
  Properties<UpdateDecisionInput>
> {
  return z.object({
    alternatives: z.array(z.string()).nullish(),
    description: z.string().nullish(),
    id: z.string(),
    linkedRequirementIds: z.array(z.string()).nullish(),
    outcome: z.string().nullish(),
    rationale: z.string().nullish(),
    stakeholderIds: z.array(z.string()).nullish(),
    title: z.string().nullish(),
  });
}

export function UpdateDeliverableInputSchema(): z.ZodObject<
  Properties<UpdateDeliverableInput>
> {
  return z.object({
    assignee: z.string().nullish(),
    description: z.string().nullish(),
    dueDate: z.string().datetime().nullish(),
    estimatedHours: z.number().nullish(),
    id: z.string(),
    linkedRequirementIds: z.array(z.string()).nullish(),
    name: z.string().nullish(),
    type: DeliverableTypeSchema.nullish(),
    url: z.string().url().nullish(),
  });
}

export function UpdateGlossaryTermInputSchema(): z.ZodObject<
  Properties<UpdateGlossaryTermInput>
> {
  return z.object({
    aliases: z.array(z.string()).nullish(),
    context: z.string().nullish(),
    definition: z.string().nullish(),
    id: z.string(),
    linkedRequirementIds: z.array(z.string()).nullish(),
    term: z.string().nullish(),
  });
}

export function UpdateKpiInputSchema(): z.ZodObject<
  Properties<UpdateKpiInput>
> {
  return z.object({
    description: z.string().nullish(),
    frequency: MeasurementFrequencySchema.nullish(),
    id: z.string(),
    linkedRequirementIds: z.array(z.string()).nullish(),
    name: z.string().nullish(),
    owner: z.string().nullish(),
    targetValue: z.number().nullish(),
    unit: z.string().nullish(),
  });
}

export function UpdateProcessInputSchema(): z.ZodObject<
  Properties<UpdateProcessInput>
> {
  return z.object({
    description: z.string().nullish(),
    id: z.string(),
    improvements: z.array(z.string()).nullish(),
    linkedRequirementIds: z.array(z.string()).nullish(),
    name: z.string().nullish(),
    owner: z.string().nullish(),
    painPoints: z.array(z.string()).nullish(),
    type: ProcessTypeSchema.nullish(),
  });
}

export function UpdateProcessStepInputSchema(): z.ZodObject<
  Properties<UpdateProcessStepInput>
> {
  return z.object({
    actor: z.string().nullish(),
    automatable: z.boolean().nullish(),
    description: z.string().nullish(),
    duration: z.string().nullish(),
    id: z.string(),
    name: z.string().nullish(),
    order: z.number().nullish(),
    processId: z.string(),
    type: StepTypeSchema.nullish(),
  });
}

export function UpdateRequirementCategoryInputSchema(): z.ZodObject<
  Properties<UpdateRequirementCategoryInput>
> {
  return z.object({
    color: z.string().nullish(),
    description: z.string().nullish(),
    id: z.string(),
    name: z.string().nullish(),
  });
}

export function UpdateRequirementInputSchema(): z.ZodObject<
  Properties<UpdateRequirementInput>
> {
  return z.object({
    categoryId: z.string().nullish(),
    code: z.string().nullish(),
    description: z.string().nullish(),
    effort: z.string().nullish(),
    id: z.string(),
    parentRequirementId: z.string().nullish(),
    priority: PrioritySchema.nullish(),
    rationale: z.string().nullish(),
    source: z.string().nullish(),
    stakeholderIds: z.array(z.string()).nullish(),
    tags: z.array(z.string()).nullish(),
    title: z.string().nullish(),
    type: RequirementTypeSchema.nullish(),
    updatedAt: z.string().datetime(),
  });
}

export function UpdateRiskInputSchema(): z.ZodObject<
  Properties<UpdateRiskInput>
> {
  return z.object({
    description: z.string().nullish(),
    id: z.string(),
    impact: RiskLevelSchema.nullish(),
    linkedRequirementIds: z.array(z.string()).nullish(),
    mitigation: z.string().nullish(),
    owner: z.string().nullish(),
    probability: RiskLevelSchema.nullish(),
    title: z.string().nullish(),
  });
}

export function UpdateScopeItemInputSchema(): z.ZodObject<
  Properties<UpdateScopeItemInput>
> {
  return z.object({
    description: z.string().nullish(),
    id: z.string(),
    linkedRequirementIds: z.array(z.string()).nullish(),
    rationale: z.string().nullish(),
    type: ScopeItemTypeSchema.nullish(),
  });
}

export function UpdateStakeholderInputSchema(): z.ZodObject<
  Properties<UpdateStakeholderInput>
> {
  return z.object({
    email: z.string().nullish(),
    id: z.string(),
    influence: StakeholderInfluenceSchema.nullish(),
    interest: StakeholderInterestSchema.nullish(),
    name: z.string().nullish(),
    notes: z.string().nullish(),
    organization: z.string().nullish(),
    role: z.string().nullish(),
  });
}
