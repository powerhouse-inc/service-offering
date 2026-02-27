import * as z from "zod";
import type {
  AddDependencyInput,
  AddExtractionRecordInput,
  AddInputInput,
  AddNoteInput,
  AddPrerequisiteInput,
  AddStepInput,
  AddSubstepInput,
  AddTaskInput,
  AddTemplateInput,
  AnalystNote,
  ApplyTemplateInput,
  BulkAddTasksInput,
  ClearExtractionHistoryInput,
  DemoStep,
  DemoSubstep,
  DemoTemplate,
  Dependency,
  DependencySourceType,
  DependencyTargetType,
  ExtractionRecord,
  ExtractionStatus,
  ExtractionType,
  Prerequisite,
  PrerequisiteScope,
  PrerequisiteStatus,
  RemoveDependencyInput,
  RemoveInputInput,
  RemoveNoteInput,
  RemovePrerequisiteInput,
  RemoveStepInput,
  RemoveSubstepInput,
  RemoveTaskInput,
  RemoveTemplateInput,
  SetAiContextInput,
  SetPhaseInput,
  SetPrerequisiteStatusInput,
  SetProjectInfoInput,
  SetStatusInput,
  SetTaskStatusInput,
  SetTemplateModeInput,
  StakeholderInput,
  Task,
  TaskInput,
  TaskSource,
  TaskStatus,
  TemplateMode,
  TemplateStep,
  TemplateStepInput,
  TemplateSubstep,
  TemplateSubstepInput,
  UpdateDependencyInput,
  UpdateExtractionRecordInput,
  UpdateInputInput,
  UpdatePrerequisiteInput,
  UpdateStepInput,
  UpdateSubstepInput,
  UpdateTaskInput,
  UpdateTemplateInput,
  WorkBreakdownPhase,
  WorkBreakdownState,
  WorkBreakdownStatus,
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

export const DependencySourceTypeSchema = z.enum(["PREREQUISITE", "TASK"]);

export const DependencyTargetTypeSchema = z.enum(["PREREQUISITE", "TASK"]);

export const ExtractionStatusSchema = z.enum([
  "COMPLETED",
  "FAILED",
  "PENDING",
]);

export const ExtractionTypeSchema = z.enum(["SCENARIO", "TASK"]);

export const PrerequisiteScopeSchema = z.enum(["GLOBAL", "STEP"]);

export const PrerequisiteStatusSchema = z.enum([
  "IN_PROGRESS",
  "MET",
  "NOT_MET",
]);

export const TaskSourceSchema = z.enum(["EXTRACTED", "MANUAL"]);

export const TaskStatusSchema = z.enum([
  "BLOCKED",
  "DONE",
  "IN_PROGRESS",
  "PENDING",
]);

export const TemplateModeSchema = z.enum([
  "AUTO_DETECTED",
  "NONE",
  "PRE_SELECTED",
]);

export const WorkBreakdownPhaseSchema = z.enum([
  "CAPTURE",
  "EXECUTION",
  "REVIEW",
  "STRUCTURE",
]);

export const WorkBreakdownStatusSchema = z.enum([
  "COMPLETED",
  "IN_PROGRESS",
  "NOT_STARTED",
  "ON_HOLD",
]);

export function AddDependencyInputSchema(): z.ZodObject<
  Properties<AddDependencyInput>
> {
  return z.object({
    description: z.string().nullish(),
    id: z.string(),
    sourceId: z.string(),
    sourceType: DependencySourceTypeSchema,
    targetId: z.string(),
    targetType: DependencyTargetTypeSchema,
  });
}

export function AddExtractionRecordInputSchema(): z.ZodObject<
  Properties<AddExtractionRecordInput>
> {
  return z.object({
    id: z.string(),
    model: z.string().nullish(),
    requestedAt: z.string().datetime(),
    type: ExtractionTypeSchema,
    userContext: z.string().nullish(),
  });
}

export function AddInputInputSchema(): z.ZodObject<Properties<AddInputInput>> {
  return z.object({
    createdAt: z.string().datetime(),
    id: z.string(),
    rawContent: z.string(),
    source: z.string().nullish(),
    submittedBy: z.string().nullish(),
  });
}

export function AddNoteInputSchema(): z.ZodObject<Properties<AddNoteInput>> {
  return z.object({
    content: z.string(),
    createdAt: z.string().datetime(),
    id: z.string(),
    phase: WorkBreakdownPhaseSchema,
  });
}

export function AddPrerequisiteInputSchema(): z.ZodObject<
  Properties<AddPrerequisiteInput>
> {
  return z.object({
    createdAt: z.string().datetime(),
    description: z.string().nullish(),
    id: z.string(),
    name: z.string(),
    notes: z.string().nullish(),
    owner: z.string(),
    scope: PrerequisiteScopeSchema,
    stepId: z.string().nullish(),
  });
}

export function AddStepInputSchema(): z.ZodObject<Properties<AddStepInput>> {
  return z.object({
    description: z.string().nullish(),
    id: z.string(),
    name: z.string(),
    order: z.number(),
    templateStepId: z.string().nullish(),
  });
}

export function AddSubstepInputSchema(): z.ZodObject<
  Properties<AddSubstepInput>
> {
  return z.object({
    acceptanceCriteria: z.string().nullish(),
    description: z.string().nullish(),
    id: z.string(),
    name: z.string(),
    order: z.number(),
    stepId: z.string(),
  });
}

export function AddTaskInputSchema(): z.ZodObject<Properties<AddTaskInput>> {
  return z.object({
    createdAt: z.string().datetime(),
    description: z.string().nullish(),
    extractionContext: z.string().nullish(),
    id: z.string(),
    name: z.string(),
    notes: z.string().nullish(),
    owner: z.string(),
    sequenceOrder: z.number(),
    source: TaskSourceSchema,
    stepId: z.string(),
    substepId: z.string().nullish(),
  });
}

export function AddTemplateInputSchema(): z.ZodObject<
  Properties<AddTemplateInput>
> {
  return z.object({
    createdAt: z.string().datetime(),
    description: z.string().nullish(),
    domain: z.string().nullish(),
    id: z.string(),
    name: z.string(),
    steps: z.array(z.lazy(() => TemplateStepInputSchema())),
  });
}

export function AnalystNoteSchema(): z.ZodObject<Properties<AnalystNote>> {
  return z.object({
    __typename: z.literal("AnalystNote").optional(),
    content: z.string(),
    createdAt: z.string().datetime(),
    id: z.string(),
    phase: WorkBreakdownPhaseSchema,
  });
}

export function ApplyTemplateInputSchema(): z.ZodObject<
  Properties<ApplyTemplateInput>
> {
  return z.object({
    templateId: z.string(),
    timestamp: z.string().datetime(),
  });
}

export function BulkAddTasksInputSchema(): z.ZodObject<
  Properties<BulkAddTasksInput>
> {
  return z.object({
    tasks: z.array(z.lazy(() => TaskInputSchema())),
  });
}

export function ClearExtractionHistoryInputSchema(): z.ZodObject<
  Properties<ClearExtractionHistoryInput>
> {
  return z.object({
    beforeDate: z.string().datetime().nullish(),
  });
}

export function DemoStepSchema(): z.ZodObject<Properties<DemoStep>> {
  return z.object({
    __typename: z.literal("DemoStep").optional(),
    description: z.string().nullish(),
    id: z.string(),
    name: z.string(),
    order: z.number(),
    substeps: z.array(z.lazy(() => DemoSubstepSchema())),
    templateStepId: z.string().nullish(),
  });
}

export function DemoSubstepSchema(): z.ZodObject<Properties<DemoSubstep>> {
  return z.object({
    __typename: z.literal("DemoSubstep").optional(),
    acceptanceCriteria: z.string().nullish(),
    description: z.string().nullish(),
    id: z.string(),
    name: z.string(),
    order: z.number(),
    stepId: z.string(),
  });
}

export function DemoTemplateSchema(): z.ZodObject<Properties<DemoTemplate>> {
  return z.object({
    __typename: z.literal("DemoTemplate").optional(),
    createdAt: z.string().datetime().nullish(),
    description: z.string().nullish(),
    domain: z.string().nullish(),
    id: z.string(),
    name: z.string(),
    steps: z.array(z.lazy(() => TemplateStepSchema())),
  });
}

export function DependencySchema(): z.ZodObject<Properties<Dependency>> {
  return z.object({
    __typename: z.literal("Dependency").optional(),
    description: z.string().nullish(),
    id: z.string(),
    sourceId: z.string(),
    sourceType: DependencySourceTypeSchema,
    targetId: z.string(),
    targetType: DependencyTargetTypeSchema,
  });
}

export function ExtractionRecordSchema(): z.ZodObject<
  Properties<ExtractionRecord>
> {
  return z.object({
    __typename: z.literal("ExtractionRecord").optional(),
    completedAt: z.string().datetime().nullish(),
    error: z.string().nullish(),
    id: z.string(),
    model: z.string().nullish(),
    requestedAt: z.string().datetime(),
    status: ExtractionStatusSchema,
    stepsGenerated: z.number().nullish(),
    tasksGenerated: z.number().nullish(),
    type: ExtractionTypeSchema,
    userContext: z.string().nullish(),
  });
}

export function PrerequisiteSchema(): z.ZodObject<Properties<Prerequisite>> {
  return z.object({
    __typename: z.literal("Prerequisite").optional(),
    createdAt: z.string().datetime().nullish(),
    description: z.string().nullish(),
    id: z.string(),
    name: z.string(),
    notes: z.string().nullish(),
    owner: z.string(),
    scope: PrerequisiteScopeSchema,
    status: PrerequisiteStatusSchema.nullish(),
    stepId: z.string().nullish(),
  });
}

export function RemoveDependencyInputSchema(): z.ZodObject<
  Properties<RemoveDependencyInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveInputInputSchema(): z.ZodObject<
  Properties<RemoveInputInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveNoteInputSchema(): z.ZodObject<
  Properties<RemoveNoteInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemovePrerequisiteInputSchema(): z.ZodObject<
  Properties<RemovePrerequisiteInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveStepInputSchema(): z.ZodObject<
  Properties<RemoveStepInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveSubstepInputSchema(): z.ZodObject<
  Properties<RemoveSubstepInput>
> {
  return z.object({
    id: z.string(),
    stepId: z.string(),
  });
}

export function RemoveTaskInputSchema(): z.ZodObject<
  Properties<RemoveTaskInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveTemplateInputSchema(): z.ZodObject<
  Properties<RemoveTemplateInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function SetAiContextInputSchema(): z.ZodObject<
  Properties<SetAiContextInput>
> {
  return z.object({
    context: z.string().nullish(),
  });
}

export function SetPhaseInputSchema(): z.ZodObject<Properties<SetPhaseInput>> {
  return z.object({
    phase: WorkBreakdownPhaseSchema,
    timestamp: z.string().datetime(),
  });
}

export function SetPrerequisiteStatusInputSchema(): z.ZodObject<
  Properties<SetPrerequisiteStatusInput>
> {
  return z.object({
    id: z.string(),
    status: PrerequisiteStatusSchema,
  });
}

export function SetProjectInfoInputSchema(): z.ZodObject<
  Properties<SetProjectInfoInput>
> {
  return z.object({
    description: z.string().nullish(),
    title: z.string().nullish(),
  });
}

export function SetStatusInputSchema(): z.ZodObject<
  Properties<SetStatusInput>
> {
  return z.object({
    status: WorkBreakdownStatusSchema,
  });
}

export function SetTaskStatusInputSchema(): z.ZodObject<
  Properties<SetTaskStatusInput>
> {
  return z.object({
    blockedByItemId: z.string().nullish(),
    blockedReason: z.string().nullish(),
    id: z.string(),
    status: TaskStatusSchema,
  });
}

export function SetTemplateModeInputSchema(): z.ZodObject<
  Properties<SetTemplateModeInput>
> {
  return z.object({
    mode: TemplateModeSchema,
  });
}

export function StakeholderInputSchema(): z.ZodObject<
  Properties<StakeholderInput>
> {
  return z.object({
    __typename: z.literal("StakeholderInput").optional(),
    createdAt: z.string().datetime(),
    id: z.string(),
    rawContent: z.string(),
    source: z.string().nullish(),
    submittedBy: z.string().nullish(),
  });
}

export function TaskSchema(): z.ZodObject<Properties<Task>> {
  return z.object({
    __typename: z.literal("Task").optional(),
    blockedByItemId: z.string().nullish(),
    blockedReason: z.string().nullish(),
    createdAt: z.string().datetime().nullish(),
    description: z.string().nullish(),
    extractionContext: z.string().nullish(),
    id: z.string(),
    name: z.string(),
    notes: z.string().nullish(),
    owner: z.string(),
    sequenceOrder: z.number(),
    source: TaskSourceSchema,
    status: TaskStatusSchema.nullish(),
    stepId: z.string(),
    substepId: z.string().nullish(),
  });
}

export function TaskInputSchema(): z.ZodObject<Properties<TaskInput>> {
  return z.object({
    createdAt: z.string().datetime(),
    description: z.string().nullish(),
    extractionContext: z.string().nullish(),
    id: z.string(),
    name: z.string(),
    notes: z.string().nullish(),
    owner: z.string(),
    sequenceOrder: z.number(),
    source: TaskSourceSchema,
    stepId: z.string(),
    substepId: z.string().nullish(),
  });
}

export function TemplateStepSchema(): z.ZodObject<Properties<TemplateStep>> {
  return z.object({
    __typename: z.literal("TemplateStep").optional(),
    description: z.string().nullish(),
    id: z.string(),
    name: z.string(),
    order: z.number(),
    substeps: z.array(z.lazy(() => TemplateSubstepSchema())),
  });
}

export function TemplateStepInputSchema(): z.ZodObject<
  Properties<TemplateStepInput>
> {
  return z.object({
    description: z.string().nullish(),
    id: z.string(),
    name: z.string(),
    order: z.number(),
    substeps: z.array(z.lazy(() => TemplateSubstepInputSchema())).nullish(),
  });
}

export function TemplateSubstepSchema(): z.ZodObject<
  Properties<TemplateSubstep>
> {
  return z.object({
    __typename: z.literal("TemplateSubstep").optional(),
    description: z.string().nullish(),
    id: z.string(),
    name: z.string(),
    order: z.number(),
  });
}

export function TemplateSubstepInputSchema(): z.ZodObject<
  Properties<TemplateSubstepInput>
> {
  return z.object({
    description: z.string().nullish(),
    id: z.string(),
    name: z.string(),
    order: z.number(),
  });
}

export function UpdateDependencyInputSchema(): z.ZodObject<
  Properties<UpdateDependencyInput>
> {
  return z.object({
    description: z.string().nullish(),
    id: z.string(),
  });
}

export function UpdateExtractionRecordInputSchema(): z.ZodObject<
  Properties<UpdateExtractionRecordInput>
> {
  return z.object({
    completedAt: z.string().datetime().nullish(),
    error: z.string().nullish(),
    id: z.string(),
    status: ExtractionStatusSchema,
    stepsGenerated: z.number().nullish(),
    tasksGenerated: z.number().nullish(),
  });
}

export function UpdateInputInputSchema(): z.ZodObject<
  Properties<UpdateInputInput>
> {
  return z.object({
    id: z.string(),
    rawContent: z.string().nullish(),
    source: z.string().nullish(),
    submittedBy: z.string().nullish(),
  });
}

export function UpdatePrerequisiteInputSchema(): z.ZodObject<
  Properties<UpdatePrerequisiteInput>
> {
  return z.object({
    description: z.string().nullish(),
    id: z.string(),
    name: z.string().nullish(),
    notes: z.string().nullish(),
    owner: z.string().nullish(),
  });
}

export function UpdateStepInputSchema(): z.ZodObject<
  Properties<UpdateStepInput>
> {
  return z.object({
    description: z.string().nullish(),
    id: z.string(),
    name: z.string().nullish(),
    order: z.number().nullish(),
  });
}

export function UpdateSubstepInputSchema(): z.ZodObject<
  Properties<UpdateSubstepInput>
> {
  return z.object({
    acceptanceCriteria: z.string().nullish(),
    description: z.string().nullish(),
    id: z.string(),
    name: z.string().nullish(),
    order: z.number().nullish(),
    stepId: z.string(),
  });
}

export function UpdateTaskInputSchema(): z.ZodObject<
  Properties<UpdateTaskInput>
> {
  return z.object({
    description: z.string().nullish(),
    id: z.string(),
    name: z.string().nullish(),
    notes: z.string().nullish(),
    owner: z.string().nullish(),
    sequenceOrder: z.number().nullish(),
    stepId: z.string().nullish(),
    substepId: z.string().nullish(),
  });
}

export function UpdateTemplateInputSchema(): z.ZodObject<
  Properties<UpdateTemplateInput>
> {
  return z.object({
    description: z.string().nullish(),
    domain: z.string().nullish(),
    id: z.string(),
    name: z.string().nullish(),
  });
}

export function WorkBreakdownStateSchema(): z.ZodObject<
  Properties<WorkBreakdownState>
> {
  return z.object({
    __typename: z.literal("WorkBreakdownState").optional(),
    aiContext: z.string().nullish(),
    appliedTemplateId: z.string().nullish(),
    dependencies: z.array(z.lazy(() => DependencySchema())),
    description: z.string().nullish(),
    extractionHistory: z.array(z.lazy(() => ExtractionRecordSchema())),
    inputs: z.array(z.lazy(() => StakeholderInputSchema())),
    notes: z.array(z.lazy(() => AnalystNoteSchema())),
    phase: WorkBreakdownPhaseSchema.nullish(),
    prerequisites: z.array(z.lazy(() => PrerequisiteSchema())),
    status: WorkBreakdownStatusSchema.nullish(),
    steps: z.array(z.lazy(() => DemoStepSchema())),
    tasks: z.array(z.lazy(() => TaskSchema())),
    templateMode: TemplateModeSchema.nullish(),
    templates: z.array(z.lazy(() => DemoTemplateSchema())),
    title: z.string().nullish(),
  });
}
