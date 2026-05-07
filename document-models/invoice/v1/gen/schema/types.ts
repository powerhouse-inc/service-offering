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

export type InitializeInvoiceInput = {
  billingCycle?: InputMaybe<InvoiceBillingCycle>;
  creditApplied: Scalars["Amount_Money"]["input"];
  currency?: InputMaybe<Scalars["Currency"]["input"]>;
  customerEmail?: InputMaybe<Scalars["EmailAddress"]["input"]>;
  customerId?: InputMaybe<Scalars["PHID"]["input"]>;
  customerName?: InputMaybe<Scalars["String"]["input"]>;
  cycleEnd?: InputMaybe<Scalars["DateTime"]["input"]>;
  cycleStart?: InputMaybe<Scalars["DateTime"]["input"]>;
  dueDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  invoiceNumber?: InputMaybe<Scalars["String"]["input"]>;
  lineItems: Array<InvoiceLineItemInput>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  sourceSubscriptionId?: InputMaybe<Scalars["PHID"]["input"]>;
  sourceSubscriptionName?: InputMaybe<Scalars["String"]["input"]>;
  subtotal: Scalars["Amount_Money"]["input"];
  totalDue: Scalars["Amount_Money"]["input"];
  totalPaid: Scalars["Amount_Money"]["input"];
};

export type InvoiceBillingCycle =
  | "ANNUAL"
  | "MONTHLY"
  | "ONE_TIME"
  | "QUARTERLY"
  | "SEMI_ANNUAL";

export type InvoiceLineItem = {
  amountDue: Scalars["Amount_Money"]["output"];
  chargedAt: Scalars["DateTime"]["output"];
  creditApplied: Scalars["Amount_Money"]["output"];
  currency: Scalars["Currency"]["output"];
  debitAmount: Scalars["Amount_Money"]["output"];
  description: Scalars["String"]["output"];
  id: Scalars["OID"]["output"];
  origin: InvoiceLineItemOrigin;
  settledAmount: Scalars["Amount_Money"]["output"];
  sliceId: Scalars["OID"]["output"];
  sourceName: Maybe<Scalars["String"]["output"]>;
};

export type InvoiceLineItemInput = {
  amountDue: Scalars["Amount_Money"]["input"];
  chargedAt: Scalars["DateTime"]["input"];
  creditApplied: Scalars["Amount_Money"]["input"];
  currency: Scalars["Currency"]["input"];
  debitAmount: Scalars["Amount_Money"]["input"];
  description: Scalars["String"]["input"];
  id: Scalars["OID"]["input"];
  origin: InvoiceLineItemOrigin;
  settledAmount: Scalars["Amount_Money"]["input"];
  sliceId: Scalars["OID"]["input"];
  sourceName?: InputMaybe<Scalars["String"]["input"]>;
};

export type InvoiceLineItemOrigin =
  | "DYNAMIC"
  | "ESTIMATED_USAGE"
  | "RECONCILIATION"
  | "SETUP"
  | "SUBSCRIPTION_FEE";

export type InvoiceState = {
  billingCycle: Maybe<InvoiceBillingCycle>;
  creditApplied: Scalars["Amount_Money"]["output"];
  currency: Maybe<Scalars["Currency"]["output"]>;
  customerEmail: Maybe<Scalars["EmailAddress"]["output"]>;
  customerId: Maybe<Scalars["PHID"]["output"]>;
  customerName: Maybe<Scalars["String"]["output"]>;
  cycleEnd: Maybe<Scalars["DateTime"]["output"]>;
  cycleStart: Maybe<Scalars["DateTime"]["output"]>;
  dueDate: Maybe<Scalars["DateTime"]["output"]>;
  invoiceNumber: Maybe<Scalars["String"]["output"]>;
  issuedAt: Maybe<Scalars["DateTime"]["output"]>;
  lineItems: Array<InvoiceLineItem>;
  notes: Maybe<Scalars["String"]["output"]>;
  sourceSubscriptionId: Maybe<Scalars["PHID"]["output"]>;
  sourceSubscriptionName: Maybe<Scalars["String"]["output"]>;
  status: InvoiceStatus;
  stripeInvoiceId: Maybe<Scalars["String"]["output"]>;
  subtotal: Scalars["Amount_Money"]["output"];
  totalDue: Scalars["Amount_Money"]["output"];
  totalPaid: Scalars["Amount_Money"]["output"];
};

export type InvoiceStatus = "DRAFT" | "ISSUED" | "PAID" | "VOID";

export type MarkInvoiceIssuedInput = {
  issuedAt: Scalars["DateTime"]["input"];
};

export type MarkInvoicePaidInput = {
  paidAmount: Scalars["Amount_Money"]["input"];
  paidAt: Scalars["DateTime"]["input"];
};

export type SetInvoiceNotesInput = {
  notes?: InputMaybe<Scalars["String"]["input"]>;
};

export type SetStripeInvoiceIdInput = {
  stripeInvoiceId: Scalars["String"]["input"];
};

export type VoidInvoiceInput = {
  reason?: InputMaybe<Scalars["String"]["input"]>;
  voidedAt: Scalars["DateTime"]["input"];
};
