import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface UserProfile {
    profileScore: bigint;
    name: string;
    email: string;
    phone: string;
    location: string;
    verificationStatus: VerificationStatus;
    avatar?: ExternalBlob;
}
export interface EServiceRequest {
    id: string;
    status: Variant_pending_approved_rejected;
    serviceType: EServiceType;
    requestDetails: string;
    user: Principal;
}
export interface TaskCompletion {
    completionTime: bigint;
    rewardCents: bigint;
    taskId: string;
}
export interface UserBan {
    banType: {
        __kind__: "permanent";
        permanent: null;
    } | {
        __kind__: "temporary";
        temporary: bigint;
    };
    user: Principal;
    timestamp: bigint;
    issuedBy: Principal;
    reason: string;
}
export interface Task {
    id: string;
    title: string;
    rewardCents: bigint;
    description: string;
    taskType: TaskType;
}
export interface WithdrawRequest {
    id: string;
    status: Variant_pending_approved_rejected;
    method: WithdrawMethod;
    user: Principal;
    amountCents: bigint;
    comment?: string;
    verificationStatus: VerificationStatus;
    requestedAt: bigint;
}
export interface DPSRequest {
    id: string;
    status: Variant_pending_approved_rejected;
    user: Principal;
    amountCents: bigint;
    termMonths: bigint;
    purpose: string;
    verificationStatus: VerificationStatus;
}
export type WithdrawMethod = {
    __kind__: "bank";
    bank: {
        branch: string;
        routingNumber: string;
        accountHolderName: string;
        bankName: string;
        accountNumber: string;
    };
} | {
    __kind__: "cash";
    cash: null;
} | {
    __kind__: "global";
    global: {
        provider: string;
        accountNumber: string;
    };
} | {
    __kind__: "mobile";
    mobile: {
        provider: string;
        accountNumber: string;
    };
};
export interface VerificationStatus {
    bankAccountVerified: boolean;
    emailVerified: boolean;
    nidVerified: boolean;
}
export interface Referral {
    referrer: Principal;
    timestamp: bigint;
    referee: Principal;
}
export interface MicroLoanRequest {
    id: string;
    monthlyPaymentCents: bigint;
    status: Variant_pending_approved_rejected;
    user: Principal;
    amountCents: bigint;
    purpose: string;
    verificationStatus: VerificationStatus;
    repaymentMonths: bigint;
}
export interface TapToEarnState {
    coinBalance: bigint;
    tapCount: bigint;
}
export enum EServiceType {
    passport = "passport",
    visa = "visa",
    landServices = "landServices",
    nidCopy = "nidCopy",
    mobileRecharge = "mobileRecharge"
}
export enum TaskType {
    followSocialMedia = "followSocialMedia",
    tapTapTask = "tapTapTask",
    aiPhotoEdit = "aiPhotoEdit",
    watchYouTubeVideo = "watchYouTubeVideo",
    aiVideoEdit = "aiVideoEdit"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_pending_approved_rejected {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export interface backendInterface {
    addTaskToCatalog(task: Task): Promise<void>;
    approveEServiceRequest(user: Principal, requestId: string): Promise<void>;
    approveMicroLoan(user: Principal, requestId: string): Promise<void>;
    approveWithdrawal(user: Principal, requestId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    banUser(user: Principal, reason: string, banType: {
        __kind__: "permanent";
        permanent: null;
    } | {
        __kind__: "temporary";
        temporary: bigint;
    }): Promise<void>;
    calculateReferralBonus(): Promise<bigint>;
    claimTapToEarnCoins(arg0: null): Promise<bigint>;
    getAllEServiceRequests(): Promise<Array<[Principal, Array<EServiceRequest>]>>;
    getAllMicroLoanRequests(): Promise<Array<[Principal, Array<MicroLoanRequest>]>>;
    getAllWithdrawalRequests(): Promise<Array<[Principal, Array<WithdrawRequest>]>>;
    getBanStatus(user: Principal): Promise<UserBan | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyBalance(): Promise<bigint>;
    getMyCompletedTasks(): Promise<Array<TaskCompletion>>;
    getMyDPSRequests(): Promise<Array<DPSRequest>>;
    getMyDocuments(): Promise<Array<[string, string, boolean]>>;
    getMyEServiceRequests(): Promise<Array<EServiceRequest>>;
    getMyMicroLoanRequests(): Promise<Array<MicroLoanRequest>>;
    getMyReferralCode(): Promise<string>;
    getMyReferrals(): Promise<Array<Referral>>;
    getMyWithdrawalRequests(): Promise<Array<WithdrawRequest>>;
    getTapToEarnState(): Promise<TapToEarnState>;
    getTaskCatalog(): Promise<Array<Task>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isUserBanned(user: Principal): Promise<boolean>;
    registerReferral(referrerCode: string): Promise<void>;
    registerTap(arg0: null): Promise<void>;
    registerTaps(tapCount: bigint): Promise<void>;
    removeTaskFromCatalog(taskId: string): Promise<void>;
    requestDPS(amountCents: bigint, termMonths: bigint, purpose: string): Promise<string>;
    requestEService(serviceType: EServiceType, requestDetails: string): Promise<string>;
    requestMicroLoan(amountCents: bigint, purpose: string, repaymentMonths: bigint): Promise<string>;
    requestWithdrawal(amountCents: bigint, method: WithdrawMethod): Promise<string>;
    resetTapCount(arg0: null): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    startTask(taskId: string): Promise<void>;
    submitTaskCompletion(taskId: string, proof: string): Promise<void>;
    unbanUser(user: Principal): Promise<void>;
    uploadSensitiveDocument(documentType: string, encryptedContent: ExternalBlob): Promise<string>;
    verifyDocument(docId: string): Promise<void>;
}
