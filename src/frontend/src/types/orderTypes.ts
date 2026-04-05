// Local type definitions for new backend features not yet in generated backend.ts
// These mirror the types in backend.d.ts

export type OrderStatus =
  | { pending: null }
  | { approved: null }
  | { rejected: null };

export interface Order {
  id: bigint;
  templateId: bigint;
  transactionRef: string;
  screenshotBlobId: string;
  buyerName: string;
  buyerEmail: string;
  buyerMobile: string;
  buyerAddress: string;
  businessDetails: string;
  accountRecovery: boolean;
  templateUseCase: string;
  status: OrderStatus;
  createdAt: bigint;
}

export interface CountryCount {
  country: string;
  count: bigint;
}

export interface PaymentSummary {
  totalOrders: bigint;
  pendingOrders: bigint;
  approvedOrders: bigint;
  rejectedOrders: bigint;
}
