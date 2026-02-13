export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Address: { input: `${string}:0x${string}`; output: `${string}:0x${string}` };
  Amount: {
    input: { unit?: string; value?: number };
    output: { unit?: string; value?: number };
  };
  Amount_Crypto: {
    input: { unit: string; value: string };
    output: { unit: string; value: string };
  };
  Amount_Currency: {
    input: { unit: string; value: string };
    output: { unit: string; value: string };
  };
  Amount_Fiat: {
    input: { unit: string; value: number };
    output: { unit: string; value: number };
  };
  Amount_Money: { input: number; output: number };
  Amount_Percentage: { input: number; output: number };
  Amount_Tokens: { input: number; output: number };
  Attachment: { input: string; output: string };
  Currency: { input: string; output: string };
  Date: { input: string; output: string };
  DateTime: { input: string; output: string };
  EmailAddress: { input: string; output: string };
  EthereumAddress: { input: string; output: string };
  OID: { input: string; output: string };
  OLabel: { input: string; output: string };
  PHID: { input: string; output: string };
  URL: { input: string; output: string };
  Unknown: { input: unknown; output: unknown };
  Upload: { input: File; output: File };
};

export type AcceptanceCriterion = {
  description: Scalars["String"]["output"];
  id: Scalars["OID"]["output"];
  verified: Maybe<Scalars["Boolean"]["output"]>;
};

export type ActivityEntry = {
  action: Scalars["String"]["output"];
  description: Maybe<Scalars["String"]["output"]>;
  entityId: Maybe<Scalars["OID"]["output"]>;
  entityType: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  timestamp: Scalars["DateTime"]["output"];
};

export type AddAcceptanceCriterionInput = {
  description: Scalars["String"]["input"];
  id: Scalars["OID"]["input"];
  requirementId: Scalars["OID"]["input"];
};

export type AddAnalysisEntryInput = {
  analysisId: Scalars["OID"]["input"];
  category: Scalars["String"]["input"];
  content: Scalars["String"]["input"];
  id: Scalars["OID"]["input"];
  impact?: InputMaybe<Scalars["String"]["input"]>;
  likelihood?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
};

export type AddAnalysisInput = {
  createdAt: Scalars["DateTime"]["input"];
  id: Scalars["OID"]["input"];
  name: Scalars["String"]["input"];
  summary?: InputMaybe<Scalars["String"]["input"]>;
  type: AnalysisType;
};

export type AddAssumptionInput = {
  category?: InputMaybe<Scalars["String"]["input"]>;
  createdAt: Scalars["DateTime"]["input"];
  description: Scalars["String"]["input"];
  id: Scalars["OID"]["input"];
  linkedRequirementIds?: InputMaybe<Array<Scalars["OID"]["input"]>>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
};

export type AddChangeRequestInput = {
  affectedRequirementIds?: InputMaybe<Array<Scalars["OID"]["input"]>>;
  createdAt: Scalars["DateTime"]["input"];
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  impact?: InputMaybe<ChangeImpact>;
  impactAnalysis?: InputMaybe<Scalars["String"]["input"]>;
  requestedBy?: InputMaybe<Scalars["String"]["input"]>;
  title: Scalars["String"]["input"];
};

export type AddDecisionInput = {
  alternatives?: InputMaybe<Array<Scalars["String"]["input"]>>;
  createdAt: Scalars["DateTime"]["input"];
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  linkedRequirementIds?: InputMaybe<Array<Scalars["OID"]["input"]>>;
  stakeholderIds?: InputMaybe<Array<Scalars["OID"]["input"]>>;
  title: Scalars["String"]["input"];
};

export type AddDeliverableInput = {
  assignee?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  dueDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  estimatedHours?: InputMaybe<Scalars["Float"]["input"]>;
  id: Scalars["OID"]["input"];
  linkedRequirementIds?: InputMaybe<Array<Scalars["OID"]["input"]>>;
  name: Scalars["String"]["input"];
  type?: InputMaybe<DeliverableType>;
  url?: InputMaybe<Scalars["URL"]["input"]>;
};

export type AddGlossaryTermInput = {
  aliases?: InputMaybe<Array<Scalars["String"]["input"]>>;
  context?: InputMaybe<Scalars["String"]["input"]>;
  createdAt: Scalars["DateTime"]["input"];
  definition: Scalars["String"]["input"];
  id: Scalars["OID"]["input"];
  linkedRequirementIds?: InputMaybe<Array<Scalars["OID"]["input"]>>;
  term: Scalars["String"]["input"];
};

export type AddKpiInput = {
  createdAt: Scalars["DateTime"]["input"];
  description?: InputMaybe<Scalars["String"]["input"]>;
  frequency?: InputMaybe<MeasurementFrequency>;
  id: Scalars["OID"]["input"];
  linkedRequirementIds?: InputMaybe<Array<Scalars["OID"]["input"]>>;
  name: Scalars["String"]["input"];
  owner?: InputMaybe<Scalars["String"]["input"]>;
  targetValue?: InputMaybe<Scalars["Float"]["input"]>;
  unit?: InputMaybe<Scalars["String"]["input"]>;
};

export type AddProcessInput = {
  createdAt: Scalars["DateTime"]["input"];
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  name: Scalars["String"]["input"];
  owner?: InputMaybe<Scalars["String"]["input"]>;
  type: ProcessType;
};

export type AddProcessStepInput = {
  actor?: InputMaybe<Scalars["String"]["input"]>;
  automatable?: InputMaybe<Scalars["Boolean"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  duration?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  name: Scalars["String"]["input"];
  order: Scalars["Int"]["input"];
  processId: Scalars["OID"]["input"];
  type?: InputMaybe<StepType>;
};

export type AddRequirementCategoryInput = {
  color?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  name: Scalars["String"]["input"];
};

export type AddRequirementInput = {
  categoryId?: InputMaybe<Scalars["OID"]["input"]>;
  code?: InputMaybe<Scalars["String"]["input"]>;
  createdAt: Scalars["DateTime"]["input"];
  description?: InputMaybe<Scalars["String"]["input"]>;
  effort?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  parentRequirementId?: InputMaybe<Scalars["OID"]["input"]>;
  priority?: InputMaybe<Priority>;
  rationale?: InputMaybe<Scalars["String"]["input"]>;
  source?: InputMaybe<Scalars["String"]["input"]>;
  stakeholderIds?: InputMaybe<Array<Scalars["OID"]["input"]>>;
  tags?: InputMaybe<Array<Scalars["String"]["input"]>>;
  title: Scalars["String"]["input"];
  type: RequirementType;
};

export type AddRiskInput = {
  createdAt: Scalars["DateTime"]["input"];
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  impact?: InputMaybe<RiskLevel>;
  linkedRequirementIds?: InputMaybe<Array<Scalars["OID"]["input"]>>;
  mitigation?: InputMaybe<Scalars["String"]["input"]>;
  owner?: InputMaybe<Scalars["String"]["input"]>;
  probability?: InputMaybe<RiskLevel>;
  title: Scalars["String"]["input"];
};

export type AddScopeItemInput = {
  createdAt: Scalars["DateTime"]["input"];
  description: Scalars["String"]["input"];
  id: Scalars["OID"]["input"];
  linkedRequirementIds?: InputMaybe<Array<Scalars["OID"]["input"]>>;
  rationale?: InputMaybe<Scalars["String"]["input"]>;
  type: ScopeItemType;
};

export type AddStakeholderInput = {
  createdAt: Scalars["DateTime"]["input"];
  email?: InputMaybe<Scalars["String"]["input"]>;
  engagementLevel?: InputMaybe<EngagementLevel>;
  id: Scalars["OID"]["input"];
  influence?: InputMaybe<StakeholderInfluence>;
  interest?: InputMaybe<StakeholderInterest>;
  name: Scalars["String"]["input"];
  notes?: InputMaybe<Scalars["String"]["input"]>;
  organization?: InputMaybe<Scalars["String"]["input"]>;
  role?: InputMaybe<Scalars["String"]["input"]>;
};

export type AnalysisArtifact = {
  createdAt: Maybe<Scalars["DateTime"]["output"]>;
  entries: Array<AnalysisEntry>;
  id: Scalars["OID"]["output"];
  name: Scalars["String"]["output"];
  summary: Maybe<Scalars["String"]["output"]>;
  type: AnalysisType;
};

export type AnalysisEntry = {
  category: Scalars["String"]["output"];
  content: Scalars["String"]["output"];
  id: Scalars["OID"]["output"];
  impact: Maybe<Scalars["String"]["output"]>;
  likelihood: Maybe<Scalars["String"]["output"]>;
  notes: Maybe<Scalars["String"]["output"]>;
};

export type AnalysisType =
  | "COST_BENEFIT"
  | "CUSTOM"
  | "FIVE_WHYS"
  | "GAP_ANALYSIS"
  | "MOSCOW"
  | "PESTLE"
  | "ROOT_CAUSE"
  | "SWOT";

export type Assumption = {
  category: Maybe<Scalars["String"]["output"]>;
  createdAt: Maybe<Scalars["DateTime"]["output"]>;
  description: Scalars["String"]["output"];
  id: Scalars["OID"]["output"];
  linkedRequirementIds: Array<Scalars["OID"]["output"]>;
  notes: Maybe<Scalars["String"]["output"]>;
  status: Maybe<AssumptionStatus>;
  validatedAt: Maybe<Scalars["DateTime"]["output"]>;
  validatedBy: Maybe<Scalars["String"]["output"]>;
};

export type AssumptionStatus = "ACTIVE" | "INVALIDATED" | "VALIDATED";

export type BusinessAnalysisState = {
  activityLog: Array<ActivityEntry>;
  analyses: Array<AnalysisArtifact>;
  assumptions: Array<Assumption>;
  changeRequests: Array<ChangeRequest>;
  decisions: Array<Decision>;
  deliverables: Array<Deliverable>;
  feedback: Array<StakeholderFeedback>;
  glossary: Array<GlossaryTerm>;
  kpis: Array<Kpi>;
  organization: Maybe<Scalars["String"]["output"]>;
  processes: Array<BusinessProcess>;
  projectDescription: Maybe<Scalars["String"]["output"]>;
  projectName: Maybe<Scalars["String"]["output"]>;
  projectPhase: Maybe<ProjectPhase>;
  projectStatus: Maybe<ProjectStatus>;
  requirementCategories: Array<RequirementCategory>;
  requirements: Array<Requirement>;
  risks: Array<Risk>;
  scopeItems: Array<ScopeItem>;
  sponsor: Maybe<Scalars["String"]["output"]>;
  stakeholders: Array<Stakeholder>;
  startDate: Maybe<Scalars["DateTime"]["output"]>;
  targetEndDate: Maybe<Scalars["DateTime"]["output"]>;
};

export type BusinessProcess = {
  createdAt: Maybe<Scalars["DateTime"]["output"]>;
  description: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  improvements: Array<Scalars["String"]["output"]>;
  linkedRequirementIds: Array<Scalars["OID"]["output"]>;
  name: Scalars["String"]["output"];
  owner: Maybe<Scalars["String"]["output"]>;
  painPoints: Array<Scalars["String"]["output"]>;
  steps: Array<ProcessStep>;
  type: ProcessType;
};

export type ChangeImpact = "CRITICAL" | "HIGH" | "LOW" | "MEDIUM";

export type ChangeRequest = {
  affectedRequirementIds: Array<Scalars["OID"]["output"]>;
  createdAt: Maybe<Scalars["DateTime"]["output"]>;
  description: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  impact: Maybe<ChangeImpact>;
  impactAnalysis: Maybe<Scalars["String"]["output"]>;
  requestedBy: Maybe<Scalars["String"]["output"]>;
  resolution: Maybe<Scalars["String"]["output"]>;
  resolvedAt: Maybe<Scalars["DateTime"]["output"]>;
  status: Maybe<ChangeRequestStatus>;
  title: Scalars["String"]["output"];
};

export type ChangeRequestStatus =
  | "APPROVED"
  | "IMPLEMENTED"
  | "REJECTED"
  | "SUBMITTED"
  | "UNDER_REVIEW";

export type Decision = {
  alternatives: Array<Scalars["String"]["output"]>;
  createdAt: Maybe<Scalars["DateTime"]["output"]>;
  decidedAt: Maybe<Scalars["DateTime"]["output"]>;
  description: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  linkedRequirementIds: Array<Scalars["OID"]["output"]>;
  outcome: Maybe<Scalars["String"]["output"]>;
  rationale: Maybe<Scalars["String"]["output"]>;
  stakeholderIds: Array<Scalars["OID"]["output"]>;
  status: Maybe<DecisionStatus>;
  title: Scalars["String"]["output"];
};

export type DecisionStatus =
  | "DECIDED"
  | "DEFERRED"
  | "PROPOSED"
  | "REVERSED"
  | "UNDER_DISCUSSION";

export type Deliverable = {
  assignee: Maybe<Scalars["String"]["output"]>;
  completedAt: Maybe<Scalars["DateTime"]["output"]>;
  description: Maybe<Scalars["String"]["output"]>;
  dueDate: Maybe<Scalars["DateTime"]["output"]>;
  estimatedHours: Maybe<Scalars["Float"]["output"]>;
  id: Scalars["OID"]["output"];
  linkedRequirementIds: Array<Scalars["OID"]["output"]>;
  name: Scalars["String"]["output"];
  status: Maybe<DeliverableStatus>;
  type: Maybe<DeliverableType>;
  url: Maybe<Scalars["URL"]["output"]>;
};

export type DeliverableStatus =
  | "APPROVED"
  | "DELIVERED"
  | "IN_PROGRESS"
  | "NOT_STARTED"
  | "UNDER_REVIEW";

export type DeliverableType =
  | "BRD"
  | "DATA_FLOW"
  | "FUNCTIONAL_SPEC"
  | "OTHER"
  | "PRESENTATION"
  | "PROCESS_MAP"
  | "REPORT"
  | "TEST_PLAN"
  | "TRAINING_MATERIAL"
  | "USE_CASE_DIAGRAM"
  | "WIREFRAME";

export type EngagementLevel =
  | "CHAMPION"
  | "NEUTRAL"
  | "RESISTANT"
  | "SUPPORTIVE"
  | "UNAWARE";

export type FeedbackStatus =
  | "ACKNOWLEDGED"
  | "INCORPORATED"
  | "PENDING"
  | "RESOLVED";

export type FeedbackType =
  | "APPROVAL"
  | "CHANGE_REQUEST"
  | "COMMENT"
  | "QUESTION"
  | "REJECTION";

export type GlossaryTerm = {
  aliases: Array<Scalars["String"]["output"]>;
  context: Maybe<Scalars["String"]["output"]>;
  createdAt: Maybe<Scalars["DateTime"]["output"]>;
  definition: Scalars["String"]["output"];
  id: Scalars["OID"]["output"];
  linkedRequirementIds: Array<Scalars["OID"]["output"]>;
  term: Scalars["String"]["output"];
};

export type Kpi = {
  createdAt: Maybe<Scalars["DateTime"]["output"]>;
  currentValue: Maybe<Scalars["Float"]["output"]>;
  description: Maybe<Scalars["String"]["output"]>;
  frequency: Maybe<MeasurementFrequency>;
  id: Scalars["OID"]["output"];
  linkedRequirementIds: Array<Scalars["OID"]["output"]>;
  measurements: Array<KpiMeasurement>;
  name: Scalars["String"]["output"];
  owner: Maybe<Scalars["String"]["output"]>;
  status: Maybe<KpiStatus>;
  targetValue: Maybe<Scalars["Float"]["output"]>;
  unit: Maybe<Scalars["String"]["output"]>;
};

export type KpiMeasurement = {
  id: Scalars["OID"]["output"];
  notes: Maybe<Scalars["String"]["output"]>;
  recordedAt: Scalars["DateTime"]["output"];
  value: Scalars["Float"]["output"];
};

export type KpiStatus = "AT_RISK" | "NOT_MEASURED" | "OFF_TRACK" | "ON_TRACK";

export type LinkRequirementsInput = {
  id: Scalars["OID"]["input"];
  linkedProcessIds?: InputMaybe<Array<Scalars["OID"]["input"]>>;
  linkedRequirementIds?: InputMaybe<Array<Scalars["OID"]["input"]>>;
};

export type LogActivityInput = {
  action: Scalars["String"]["input"];
  description?: InputMaybe<Scalars["String"]["input"]>;
  entityId?: InputMaybe<Scalars["OID"]["input"]>;
  entityType?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  timestamp: Scalars["DateTime"]["input"];
};

export type MeasurementFrequency =
  | "ANNUALLY"
  | "BIWEEKLY"
  | "DAILY"
  | "MONTHLY"
  | "QUARTERLY"
  | "WEEKLY";

export type Priority = "COULD_HAVE" | "MUST_HAVE" | "SHOULD_HAVE" | "WONT_HAVE";

export type ProcessStep = {
  actor: Maybe<Scalars["String"]["output"]>;
  automatable: Maybe<Scalars["Boolean"]["output"]>;
  description: Maybe<Scalars["String"]["output"]>;
  duration: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  name: Scalars["String"]["output"];
  order: Scalars["Int"]["output"];
  type: Maybe<StepType>;
};

export type ProcessType = "AS_IS" | "TO_BE";

export type ProjectPhase =
  | "ANALYSIS"
  | "CLOSED"
  | "DESIGN"
  | "DISCOVERY"
  | "ELICITATION"
  | "IMPLEMENTATION"
  | "VALIDATION";

export type ProjectStatus =
  | "CANCELLED"
  | "COMPLETED"
  | "IN_PROGRESS"
  | "NOT_STARTED"
  | "ON_HOLD";

export type RecordKpiMeasurementInput = {
  id: Scalars["OID"]["input"];
  kpiId: Scalars["OID"]["input"];
  notes?: InputMaybe<Scalars["String"]["input"]>;
  recordedAt: Scalars["DateTime"]["input"];
  value: Scalars["Float"]["input"];
};

export type RemoveAcceptanceCriterionInput = {
  id: Scalars["OID"]["input"];
  requirementId: Scalars["OID"]["input"];
};

export type RemoveAnalysisEntryInput = {
  analysisId: Scalars["OID"]["input"];
  id: Scalars["OID"]["input"];
};

export type RemoveAnalysisInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveAssumptionInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveDecisionInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveDeliverableInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveFeedbackInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveGlossaryTermInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveKpiInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveProcessInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveProcessStepInput = {
  id: Scalars["OID"]["input"];
  processId: Scalars["OID"]["input"];
};

export type RemoveRequirementCategoryInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveRequirementInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveRiskInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveScopeItemInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveStakeholderInput = {
  id: Scalars["OID"]["input"];
};

export type ReorderProcessStepsInput = {
  order: Array<Scalars["OID"]["input"]>;
  processId: Scalars["OID"]["input"];
};

export type Requirement = {
  acceptanceCriteria: Array<AcceptanceCriterion>;
  categoryId: Maybe<Scalars["OID"]["output"]>;
  code: Maybe<Scalars["String"]["output"]>;
  createdAt: Maybe<Scalars["DateTime"]["output"]>;
  description: Maybe<Scalars["String"]["output"]>;
  effort: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  linkedProcessIds: Array<Scalars["OID"]["output"]>;
  linkedRequirementIds: Array<Scalars["OID"]["output"]>;
  parentRequirementId: Maybe<Scalars["OID"]["output"]>;
  priority: Maybe<Priority>;
  rationale: Maybe<Scalars["String"]["output"]>;
  source: Maybe<Scalars["String"]["output"]>;
  stakeholderIds: Array<Scalars["OID"]["output"]>;
  status: Maybe<RequirementStatus>;
  tags: Array<Scalars["String"]["output"]>;
  title: Scalars["String"]["output"];
  type: RequirementType;
  updatedAt: Maybe<Scalars["DateTime"]["output"]>;
};

export type RequirementCategory = {
  color: Maybe<Scalars["String"]["output"]>;
  description: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  name: Scalars["String"]["output"];
};

export type RequirementStatus =
  | "APPROVED"
  | "DEFERRED"
  | "DRAFT"
  | "IMPLEMENTED"
  | "REJECTED"
  | "UNDER_REVIEW"
  | "VERIFIED";

export type RequirementType =
  | "BUSINESS_RULE"
  | "CONSTRAINT"
  | "FUNCTIONAL"
  | "NON_FUNCTIONAL"
  | "USER_STORY";

export type ResolveFeedbackInput = {
  analystResponse?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  resolvedAt: Scalars["DateTime"]["input"];
  status: FeedbackStatus;
};

export type RespondToFeedbackInput = {
  analystResponse: Scalars["String"]["input"];
  id: Scalars["OID"]["input"];
};

export type Risk = {
  createdAt: Maybe<Scalars["DateTime"]["output"]>;
  description: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  impact: Maybe<RiskLevel>;
  linkedRequirementIds: Array<Scalars["OID"]["output"]>;
  mitigation: Maybe<Scalars["String"]["output"]>;
  owner: Maybe<Scalars["String"]["output"]>;
  probability: Maybe<RiskLevel>;
  status: Maybe<RiskStatus>;
  title: Scalars["String"]["output"];
};

export type RiskLevel = "CRITICAL" | "HIGH" | "LOW" | "MEDIUM";

export type RiskStatus =
  | "ACCEPTED"
  | "ESCALATED"
  | "IDENTIFIED"
  | "MITIGATING"
  | "RESOLVED";

export type ScopeItem = {
  createdAt: Maybe<Scalars["DateTime"]["output"]>;
  description: Scalars["String"]["output"];
  id: Scalars["OID"]["output"];
  linkedRequirementIds: Array<Scalars["OID"]["output"]>;
  rationale: Maybe<Scalars["String"]["output"]>;
  type: ScopeItemType;
};

export type ScopeItemType = "DEFERRED" | "IN_SCOPE" | "OUT_OF_SCOPE";

export type SetAssumptionStatusInput = {
  id: Scalars["OID"]["input"];
  status: AssumptionStatus;
  validatedAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  validatedBy?: InputMaybe<Scalars["String"]["input"]>;
};

export type SetChangeRequestStatusInput = {
  id: Scalars["OID"]["input"];
  resolution?: InputMaybe<Scalars["String"]["input"]>;
  resolvedAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  status: ChangeRequestStatus;
};

export type SetDecisionStatusInput = {
  decidedAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  id: Scalars["OID"]["input"];
  status: DecisionStatus;
};

export type SetDeliverableStatusInput = {
  completedAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  id: Scalars["OID"]["input"];
  status: DeliverableStatus;
};

export type SetEngagementLevelInput = {
  engagementLevel: EngagementLevel;
  id: Scalars["OID"]["input"];
};

export type SetKpiStatusInput = {
  id: Scalars["OID"]["input"];
  status: KpiStatus;
};

export type SetProjectInfoInput = {
  organization?: InputMaybe<Scalars["String"]["input"]>;
  projectDescription?: InputMaybe<Scalars["String"]["input"]>;
  projectName?: InputMaybe<Scalars["String"]["input"]>;
  sponsor?: InputMaybe<Scalars["String"]["input"]>;
  startDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  targetEndDate?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export type SetProjectPhaseInput = {
  phase: ProjectPhase;
  timestamp: Scalars["DateTime"]["input"];
};

export type SetProjectStatusInput = {
  status: ProjectStatus;
  timestamp: Scalars["DateTime"]["input"];
};

export type SetRequirementStatusInput = {
  id: Scalars["OID"]["input"];
  status: RequirementStatus;
  updatedAt: Scalars["DateTime"]["input"];
};

export type SetRiskStatusInput = {
  id: Scalars["OID"]["input"];
  status: RiskStatus;
};

export type Stakeholder = {
  createdAt: Maybe<Scalars["DateTime"]["output"]>;
  email: Maybe<Scalars["String"]["output"]>;
  engagementLevel: Maybe<EngagementLevel>;
  id: Scalars["OID"]["output"];
  influence: Maybe<StakeholderInfluence>;
  interest: Maybe<StakeholderInterest>;
  name: Scalars["String"]["output"];
  notes: Maybe<Scalars["String"]["output"]>;
  organization: Maybe<Scalars["String"]["output"]>;
  role: Maybe<Scalars["String"]["output"]>;
};

export type StakeholderFeedback = {
  analystResponse: Maybe<Scalars["String"]["output"]>;
  content: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  entityId: Scalars["OID"]["output"];
  entityType: Scalars["String"]["output"];
  id: Scalars["OID"]["output"];
  resolvedAt: Maybe<Scalars["DateTime"]["output"]>;
  stakeholderId: Scalars["OID"]["output"];
  status: Maybe<FeedbackStatus>;
  type: FeedbackType;
};

export type StakeholderInfluence = "HIGH" | "LOW" | "MEDIUM";

export type StakeholderInterest = "HIGH" | "LOW" | "MEDIUM";

export type StepType =
  | "DECISION"
  | "END"
  | "GATEWAY"
  | "START"
  | "SUBPROCESS"
  | "TASK";

export type SubmitFeedbackInput = {
  content: Scalars["String"]["input"];
  createdAt: Scalars["DateTime"]["input"];
  entityId: Scalars["OID"]["input"];
  entityType: Scalars["String"]["input"];
  id: Scalars["OID"]["input"];
  stakeholderId: Scalars["OID"]["input"];
  type: FeedbackType;
};

export type UpdateAcceptanceCriterionInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  requirementId: Scalars["OID"]["input"];
  verified?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type UpdateAnalysisEntryInput = {
  analysisId: Scalars["OID"]["input"];
  category?: InputMaybe<Scalars["String"]["input"]>;
  content?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  impact?: InputMaybe<Scalars["String"]["input"]>;
  likelihood?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateAnalysisInput = {
  id: Scalars["OID"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
  summary?: InputMaybe<Scalars["String"]["input"]>;
  type?: InputMaybe<AnalysisType>;
};

export type UpdateAssumptionInput = {
  category?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  linkedRequirementIds?: InputMaybe<Array<Scalars["OID"]["input"]>>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateChangeRequestInput = {
  affectedRequirementIds?: InputMaybe<Array<Scalars["OID"]["input"]>>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  impact?: InputMaybe<ChangeImpact>;
  impactAnalysis?: InputMaybe<Scalars["String"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateDecisionInput = {
  alternatives?: InputMaybe<Array<Scalars["String"]["input"]>>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  linkedRequirementIds?: InputMaybe<Array<Scalars["OID"]["input"]>>;
  outcome?: InputMaybe<Scalars["String"]["input"]>;
  rationale?: InputMaybe<Scalars["String"]["input"]>;
  stakeholderIds?: InputMaybe<Array<Scalars["OID"]["input"]>>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateDeliverableInput = {
  assignee?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  dueDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  estimatedHours?: InputMaybe<Scalars["Float"]["input"]>;
  id: Scalars["OID"]["input"];
  linkedRequirementIds?: InputMaybe<Array<Scalars["OID"]["input"]>>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  type?: InputMaybe<DeliverableType>;
  url?: InputMaybe<Scalars["URL"]["input"]>;
};

export type UpdateGlossaryTermInput = {
  aliases?: InputMaybe<Array<Scalars["String"]["input"]>>;
  context?: InputMaybe<Scalars["String"]["input"]>;
  definition?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  linkedRequirementIds?: InputMaybe<Array<Scalars["OID"]["input"]>>;
  term?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateKpiInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  frequency?: InputMaybe<MeasurementFrequency>;
  id: Scalars["OID"]["input"];
  linkedRequirementIds?: InputMaybe<Array<Scalars["OID"]["input"]>>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  owner?: InputMaybe<Scalars["String"]["input"]>;
  targetValue?: InputMaybe<Scalars["Float"]["input"]>;
  unit?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateProcessInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  improvements?: InputMaybe<Array<Scalars["String"]["input"]>>;
  linkedRequirementIds?: InputMaybe<Array<Scalars["OID"]["input"]>>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  owner?: InputMaybe<Scalars["String"]["input"]>;
  painPoints?: InputMaybe<Array<Scalars["String"]["input"]>>;
  type?: InputMaybe<ProcessType>;
};

export type UpdateProcessStepInput = {
  actor?: InputMaybe<Scalars["String"]["input"]>;
  automatable?: InputMaybe<Scalars["Boolean"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  duration?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
  order?: InputMaybe<Scalars["Int"]["input"]>;
  processId: Scalars["OID"]["input"];
  type?: InputMaybe<StepType>;
};

export type UpdateRequirementCategoryInput = {
  color?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateRequirementInput = {
  categoryId?: InputMaybe<Scalars["OID"]["input"]>;
  code?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  effort?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  parentRequirementId?: InputMaybe<Scalars["OID"]["input"]>;
  priority?: InputMaybe<Priority>;
  rationale?: InputMaybe<Scalars["String"]["input"]>;
  source?: InputMaybe<Scalars["String"]["input"]>;
  stakeholderIds?: InputMaybe<Array<Scalars["OID"]["input"]>>;
  tags?: InputMaybe<Array<Scalars["String"]["input"]>>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  type?: InputMaybe<RequirementType>;
  updatedAt: Scalars["DateTime"]["input"];
};

export type UpdateRiskInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  impact?: InputMaybe<RiskLevel>;
  linkedRequirementIds?: InputMaybe<Array<Scalars["OID"]["input"]>>;
  mitigation?: InputMaybe<Scalars["String"]["input"]>;
  owner?: InputMaybe<Scalars["String"]["input"]>;
  probability?: InputMaybe<RiskLevel>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateScopeItemInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  linkedRequirementIds?: InputMaybe<Array<Scalars["OID"]["input"]>>;
  rationale?: InputMaybe<Scalars["String"]["input"]>;
  type?: InputMaybe<ScopeItemType>;
};

export type UpdateStakeholderInput = {
  email?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  influence?: InputMaybe<StakeholderInfluence>;
  interest?: InputMaybe<StakeholderInterest>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  organization?: InputMaybe<Scalars["String"]["input"]>;
  role?: InputMaybe<Scalars["String"]["input"]>;
};
