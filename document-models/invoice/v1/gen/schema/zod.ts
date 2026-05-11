/* eslint-disable @typescript-eslint/no-empty-object-type */
import * as z from "zod";
import type {
  InitializeInvoiceInput,
  InvoiceBillingCycle,
  InvoiceLineItem,
  InvoiceLineItemInput,
  InvoiceLineItemOrigin,
  InvoiceState,
  InvoiceStatus,
  MarkInvoiceIssuedInput,
  MarkInvoicePaidInput,
  SetInvoiceNotesInput,
  SetStripeInvoiceIdInput,
  VoidInvoiceInput,
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

export const InvoiceBillingCycleSchema = z.enum([
  "ANNUAL",
  "MONTHLY",
  "ONE_TIME",
  "QUARTERLY",
  "SEMI_ANNUAL",
]);

export const InvoiceLineItemOriginSchema = z.enum([
  "DYNAMIC",
  "ESTIMATED_USAGE",
  "RECONCILIATION",
  "SETUP",
  "SUBSCRIPTION_FEE",
]);

export const InvoiceStatusSchema = z.enum(["DRAFT", "ISSUED", "PAID", "VOID"]);

export function InitializeInvoiceInputSchema(): z.ZodObject<
  Properties<InitializeInvoiceInput>
> {
  return z.object({
    billingCycle: InvoiceBillingCycleSchema.nullish(),
    creditApplied: z.number(),
    currency: z.string().nullish(),
    customerEmail: z.email().nullish(),
    customerId: z.string().nullish(),
    customerName: z.string().nullish(),
    cycleEnd: z.iso.datetime().nullish(),
    cycleStart: z.iso.datetime().nullish(),
    dueDate: z.iso.datetime().nullish(),
    invoiceNumber: z.string().nullish(),
    lineItems: z.array(z.lazy(() => InvoiceLineItemInputSchema())),
    notes: z.string().nullish(),
    sourceSubscriptionId: z.string().nullish(),
    sourceSubscriptionName: z.string().nullish(),
    subtotal: z.number(),
    totalDue: z.number(),
    totalPaid: z.number(),
  });
}

export function InvoiceLineItemSchema(): z.ZodObject<
  Properties<InvoiceLineItem>
> {
  return z.object({
    __typename: z.literal("InvoiceLineItem").optional(),
    amountDue: z.number(),
    chargedAt: z.iso.datetime(),
    creditApplied: z.number(),
    currency: z.string(),
    debitAmount: z.number(),
    description: z.string(),
    id: z.string(),
    origin: InvoiceLineItemOriginSchema,
    settledAmount: z.number(),
    sliceId: z.string(),
    sourceName: z.string().nullish(),
  });
}

export function InvoiceLineItemInputSchema(): z.ZodObject<
  Properties<InvoiceLineItemInput>
> {
  return z.object({
    amountDue: z.number(),
    chargedAt: z.iso.datetime(),
    creditApplied: z.number(),
    currency: z.string(),
    debitAmount: z.number(),
    description: z.string(),
    id: z.string(),
    origin: InvoiceLineItemOriginSchema,
    settledAmount: z.number(),
    sliceId: z.string(),
    sourceName: z.string().nullish(),
  });
}

export function InvoiceStateSchema(): z.ZodObject<Properties<InvoiceState>> {
  return z.object({
    __typename: z.literal("InvoiceState").optional(),
    billingCycle: InvoiceBillingCycleSchema.nullish(),
    creditApplied: z.number(),
    currency: z.string().nullish(),
    customerEmail: z.email().nullish(),
    customerId: z.string().nullish(),
    customerName: z.string().nullish(),
    cycleEnd: z.iso.datetime().nullish(),
    cycleStart: z.iso.datetime().nullish(),
    dueDate: z.iso.datetime().nullish(),
    invoiceNumber: z.string().nullish(),
    issuedAt: z.iso.datetime().nullish(),
    lineItems: z.array(z.lazy(() => InvoiceLineItemSchema())),
    notes: z.string().nullish(),
    sourceSubscriptionId: z.string().nullish(),
    sourceSubscriptionName: z.string().nullish(),
    status: InvoiceStatusSchema,
    stripeInvoiceId: z.string().nullish(),
    subtotal: z.number(),
    totalDue: z.number(),
    totalPaid: z.number(),
  });
}

export function MarkInvoiceIssuedInputSchema(): z.ZodObject<
  Properties<MarkInvoiceIssuedInput>
> {
  return z.object({
    issuedAt: z.iso.datetime(),
  });
}

export function MarkInvoicePaidInputSchema(): z.ZodObject<
  Properties<MarkInvoicePaidInput>
> {
  return z.object({
    paidAmount: z.number(),
    paidAt: z.iso.datetime(),
  });
}

export function SetInvoiceNotesInputSchema(): z.ZodObject<
  Properties<SetInvoiceNotesInput>
> {
  return z.object({
    notes: z.string().nullish(),
  });
}

export function SetStripeInvoiceIdInputSchema(): z.ZodObject<
  Properties<SetStripeInvoiceIdInput>
> {
  return z.object({
    stripeInvoiceId: z.string(),
  });
}

export function VoidInvoiceInputSchema(): z.ZodObject<
  Properties<VoidInvoiceInput>
> {
  return z.object({
    reason: z.string().nullish(),
    voidedAt: z.iso.datetime(),
  });
}
