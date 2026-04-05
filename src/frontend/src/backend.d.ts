import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BlockedBuyer {
    id: bigint;
    blockedAt: bigint;
    email: string;
    reason: string;
}
export interface PolicyDocument {
    id: bigint;
    fileName: string;
    blobId: string;
    docType: string;
    uploadedAt: bigint;
}
export interface Announcement {
    id: bigint;
    title: string;
    content: string;
    isPublished: boolean;
    createdAt: bigint;
}
export interface Template {
    id: bigint;
    features: Array<string>;
    name: string;
    createdAt: bigint;
    description: string;
    previewImageBlobId: string;
    isFree: boolean;
    templateFileBlobId: string;
    price: bigint;
}
export interface Review {
    id: bigint;
    templateId: bigint;
    createdAt: bigint;
    reviewerName: string;
    comment: string;
    rating: bigint;
}
export type OrderStatus = { pending: null } | { approved: null } | { rejected: null };
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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAnnouncement(title: string, content: string, isPublished: boolean): Promise<bigint>;
    addPolicyDocument(docType: string, fileName: string, blobId: string): Promise<bigint>;
    addReview(templateId: bigint, reviewerName: string, rating: bigint, comment: string): Promise<bigint>;
    addTemplate(name: string, description: string, price: bigint, isFree: boolean, previewImageBlobId: string, templateFileBlobId: string, features: Array<string>): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    blockBuyer(email: string, reason: string): Promise<bigint>;
    deleteAnnouncement(id: bigint): Promise<boolean>;
    deletePolicyDocument(id: bigint): Promise<boolean>;
    deleteReview(id: bigint): Promise<boolean>;
    deleteTemplate(id: bigint): Promise<boolean>;
    getAllReviews(): Promise<Array<Review>>;
    getAnnouncements(): Promise<Array<Announcement>>;
    getBlockedBuyers(): Promise<Array<BlockedBuyer>>;
    getCallerUserRole(): Promise<UserRole>;
    getFreeTemplates(): Promise<Array<Template>>;
    getPolicyDocuments(): Promise<Array<PolicyDocument>>;
    getReviews(templateId: bigint): Promise<Array<Review>>;
    getTemplateFileId(templateId: bigint, transactionRef: string): Promise<string | null>;
    getTemplates(): Promise<Array<Template>>;
    isCallerAdmin(): Promise<boolean>;
    isEmailBlocked(email: string): Promise<boolean>;
    recordPayment(templateId: bigint, transactionRef: string, buyerName: string, buyerEmail: string, buyerAddress: string, businessDetails: string, accountRecoveryConfirm: boolean, templateUseCase: string): Promise<boolean>;
    unblockBuyer(id: bigint): Promise<boolean>;
    updateAnnouncement(announcement: Announcement): Promise<boolean>;
    updateTemplate(id: bigint, name: string, description: string, price: bigint, isFree: boolean, features: Array<string>): Promise<boolean>;
    submitOrder(templateId: bigint, transactionRef: string, screenshotBlobId: string, buyerName: string, buyerEmail: string, buyerMobile: string, buyerAddress: string, businessDetails: string, accountRecovery: boolean, templateUseCase: string): Promise<bigint>;
    getOrders(): Promise<Array<Order>>;
    approveOrder(orderId: bigint): Promise<boolean>;
    rejectOrder(orderId: bigint): Promise<boolean>;
    getOrdersByEmail(email: string): Promise<Array<Order>>;
    getApprovedOrderFileId(orderId: bigint): Promise<string | null>;
    recordPageVisit(country: string): Promise<void>;
    getPageVisitCount(): Promise<bigint>;
    getVisitorCountries(): Promise<Array<CountryCount>>;
    getPaymentSummary(): Promise<PaymentSummary>;
}
