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

export type AddDependencyInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  sourceId: Scalars["OID"]["input"];
  sourceType: DependencySourceType;
  targetId: Scalars["OID"]["input"];
  targetType: DependencyTargetType;
};

export type AddInputInput = {
  createdAt: Scalars["DateTime"]["input"];
  id: Scalars["OID"]["input"];
  rawContent: Scalars["String"]["input"];
  source?: InputMaybe<Scalars["String"]["input"]>;
  submittedBy?: InputMaybe<Scalars["String"]["input"]>;
};

export type AddExtractionRecordInput = {
  id: Scalars["OID"]["input"];
  model?: InputMaybe<Scalars["String"]["input"]>;
  requestedAt: Scalars["DateTime"]["input"];
  type: ExtractionType;
  userContext?: InputMaybe<Scalars["String"]["input"]>;
};

export type AddNoteInput = {
  content: Scalars["String"]["input"];
  createdAt: Scalars["DateTime"]["input"];
  id: Scalars["OID"]["input"];
  phase: WorkBreakdownPhase;
};

export type AddPrerequisiteInput = {
  createdAt: Scalars["DateTime"]["input"];
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  name: Scalars["String"]["input"];
  notes?: InputMaybe<Scalars["String"]["input"]>;
  owner: Scalars["String"]["input"];
  scope: PrerequisiteScope;
  stepId?: InputMaybe<Scalars["OID"]["input"]>;
};

export type AddStepInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  name: Scalars["String"]["input"];
  order: Scalars["Int"]["input"];
  templateStepId?: InputMaybe<Scalars["OID"]["input"]>;
};

export type AddSubstepInput = {
  acceptanceCriteria?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  name: Scalars["String"]["input"];
  order: Scalars["Int"]["input"];
  stepId: Scalars["OID"]["input"];
};

export type AddTaskInput = {
  createdAt: Scalars["DateTime"]["input"];
  description?: InputMaybe<Scalars["String"]["input"]>;
  extractionContext?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  name: Scalars["String"]["input"];
  notes?: InputMaybe<Scalars["String"]["input"]>;
  owner: Scalars["String"]["input"];
  sequenceOrder: Scalars["Int"]["input"];
  source: TaskSource;
  stepId: Scalars["OID"]["input"];
  substepId?: InputMaybe<Scalars["OID"]["input"]>;
};

export type AddTemplateInput = {
  createdAt: Scalars["DateTime"]["input"];
  description?: InputMaybe<Scalars["String"]["input"]>;
  domain?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  name: Scalars["String"]["input"];
  steps: Array<TemplateStepInput>;
};

export type AnalystNote = {
  content: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["OID"]["output"];
  phase: WorkBreakdownPhase;
};

export type ApplyTemplateInput = {
  templateId: Scalars["OID"]["input"];
  timestamp: Scalars["DateTime"]["input"];
};

export type BulkAddTasksInput = {
  tasks: Array<TaskInput>;
};

export type DemoStep = {
  description: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  name: Scalars["String"]["output"];
  order: Scalars["Int"]["output"];
  substeps: Array<DemoSubstep>;
  templateStepId: Maybe<Scalars["OID"]["output"]>;
};

export type DemoSubstep = {
  acceptanceCriteria: Maybe<Scalars["String"]["output"]>;
  description: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  name: Scalars["String"]["output"];
  order: Scalars["Int"]["output"];
  stepId: Scalars["OID"]["output"];
};

export type DemoTemplate = {
  createdAt: Maybe<Scalars["DateTime"]["output"]>;
  description: Maybe<Scalars["String"]["output"]>;
  domain: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  name: Scalars["String"]["output"];
  steps: Array<TemplateStep>;
};

export type Dependency = {
  description: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  sourceId: Scalars["OID"]["output"];
  sourceType: DependencySourceType;
  targetId: Scalars["OID"]["output"];
  targetType: DependencyTargetType;
};

export type ClearExtractionHistoryInput = {
  beforeDate?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export type DependencySourceType = "PREREQUISITE" | "TASK";

export type DependencyTargetType = "PREREQUISITE" | "TASK";

export type ExtractionRecord = {
  completedAt: Maybe<Scalars["DateTime"]["output"]>;
  error: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  model: Maybe<Scalars["String"]["output"]>;
  requestedAt: Scalars["DateTime"]["output"];
  status: ExtractionStatus;
  stepsGenerated: Maybe<Scalars["Int"]["output"]>;
  tasksGenerated: Maybe<Scalars["Int"]["output"]>;
  type: ExtractionType;
  userContext: Maybe<Scalars["String"]["output"]>;
};

export type ExtractionStatus = "COMPLETED" | "FAILED" | "PENDING";

export type ExtractionType = "SCENARIO" | "TASK";

export type Prerequisite = {
  createdAt: Maybe<Scalars["DateTime"]["output"]>;
  description: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  name: Scalars["String"]["output"];
  notes: Maybe<Scalars["String"]["output"]>;
  owner: Scalars["String"]["output"];
  scope: PrerequisiteScope;
  status: Maybe<PrerequisiteStatus>;
  stepId: Maybe<Scalars["OID"]["output"]>;
};

export type PrerequisiteScope = "GLOBAL" | "STEP";

export type PrerequisiteStatus = "IN_PROGRESS" | "MET" | "NOT_MET";

export type RemoveDependencyInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveInputInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveNoteInput = {
  id: Scalars["OID"]["input"];
};

export type RemovePrerequisiteInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveStepInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveSubstepInput = {
  id: Scalars["OID"]["input"];
  stepId: Scalars["OID"]["input"];
};

export type RemoveTaskInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveTemplateInput = {
  id: Scalars["OID"]["input"];
};

export type SetAiContextInput = {
  context?: InputMaybe<Scalars["String"]["input"]>;
};

export type SetPhaseInput = {
  phase: WorkBreakdownPhase;
  timestamp: Scalars["DateTime"]["input"];
};

export type SetPrerequisiteStatusInput = {
  id: Scalars["OID"]["input"];
  status: PrerequisiteStatus;
};

export type SetProjectInfoInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type SetStatusInput = {
  status: WorkBreakdownStatus;
};

export type SetTaskStatusInput = {
  blockedByItemId?: InputMaybe<Scalars["OID"]["input"]>;
  blockedReason?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  status: TaskStatus;
};

export type SetTemplateModeInput = {
  mode: TemplateMode;
};

export type StakeholderInput = {
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["OID"]["output"];
  rawContent: Scalars["String"]["output"];
  source: Maybe<Scalars["String"]["output"]>;
  submittedBy: Maybe<Scalars["String"]["output"]>;
};

export type Task = {
  blockedByItemId: Maybe<Scalars["OID"]["output"]>;
  blockedReason: Maybe<Scalars["String"]["output"]>;
  createdAt: Maybe<Scalars["DateTime"]["output"]>;
  description: Maybe<Scalars["String"]["output"]>;
  extractionContext: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  name: Scalars["String"]["output"];
  notes: Maybe<Scalars["String"]["output"]>;
  owner: Scalars["String"]["output"];
  sequenceOrder: Scalars["Int"]["output"];
  source: TaskSource;
  status: Maybe<TaskStatus>;
  stepId: Scalars["OID"]["output"];
  substepId: Maybe<Scalars["OID"]["output"]>;
};

export type TaskInput = {
  createdAt: Scalars["DateTime"]["input"];
  description?: InputMaybe<Scalars["String"]["input"]>;
  extractionContext?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  name: Scalars["String"]["input"];
  notes?: InputMaybe<Scalars["String"]["input"]>;
  owner: Scalars["String"]["input"];
  sequenceOrder: Scalars["Int"]["input"];
  source: TaskSource;
  stepId: Scalars["OID"]["input"];
  substepId?: InputMaybe<Scalars["OID"]["input"]>;
};

export type TaskSource = "EXTRACTED" | "MANUAL";

export type TaskStatus = "BLOCKED" | "DONE" | "IN_PROGRESS" | "PENDING";

export type TemplateMode = "AUTO_DETECTED" | "NONE" | "PRE_SELECTED";

export type TemplateStep = {
  description: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  name: Scalars["String"]["output"];
  order: Scalars["Int"]["output"];
  substeps: Array<TemplateSubstep>;
};

export type TemplateStepInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  name: Scalars["String"]["input"];
  order: Scalars["Int"]["input"];
  substeps?: InputMaybe<Array<TemplateSubstepInput>>;
};

export type TemplateSubstep = {
  description: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  name: Scalars["String"]["output"];
  order: Scalars["Int"]["output"];
};

export type TemplateSubstepInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  name: Scalars["String"]["input"];
  order: Scalars["Int"]["input"];
};

export type UpdateExtractionRecordInput = {
  completedAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  error?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  status: ExtractionStatus;
  stepsGenerated?: InputMaybe<Scalars["Int"]["input"]>;
  tasksGenerated?: InputMaybe<Scalars["Int"]["input"]>;
};

export type UpdateDependencyInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
};

export type UpdateInputInput = {
  id: Scalars["OID"]["input"];
  rawContent?: InputMaybe<Scalars["String"]["input"]>;
  source?: InputMaybe<Scalars["String"]["input"]>;
  submittedBy?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdatePrerequisiteInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  owner?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateStepInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
  order?: InputMaybe<Scalars["Int"]["input"]>;
};

export type UpdateSubstepInput = {
  acceptanceCriteria?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
  order?: InputMaybe<Scalars["Int"]["input"]>;
  stepId: Scalars["OID"]["input"];
};

export type UpdateTaskInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  owner?: InputMaybe<Scalars["String"]["input"]>;
  sequenceOrder?: InputMaybe<Scalars["Int"]["input"]>;
  stepId?: InputMaybe<Scalars["OID"]["input"]>;
  substepId?: InputMaybe<Scalars["OID"]["input"]>;
};

export type UpdateTemplateInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  domain?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type WorkBreakdownPhase =
  | "CAPTURE"
  | "EXECUTION"
  | "REVIEW"
  | "STRUCTURE";

export type WorkBreakdownState = {
  aiContext: Maybe<Scalars["String"]["output"]>;
  appliedTemplateId: Maybe<Scalars["OID"]["output"]>;
  dependencies: Array<Dependency>;
  description: Maybe<Scalars["String"]["output"]>;
  extractionHistory: Array<ExtractionRecord>;
  inputs: Array<StakeholderInput>;
  notes: Array<AnalystNote>;
  phase: Maybe<WorkBreakdownPhase>;
  prerequisites: Array<Prerequisite>;
  status: Maybe<WorkBreakdownStatus>;
  steps: Array<DemoStep>;
  tasks: Array<Task>;
  templateMode: Maybe<TemplateMode>;
  templates: Array<DemoTemplate>;
  title: Maybe<Scalars["String"]["output"]>;
};

export type WorkBreakdownStatus =
  | "COMPLETED"
  | "IN_PROGRESS"
  | "NOT_STARTED"
  | "ON_HOLD";
