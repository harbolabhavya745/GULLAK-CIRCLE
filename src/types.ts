export interface Member {
  id: string;
  name: string;
  avatar: string;
  role: string;
  totalContributed: number;
  score: number; // 0-100
  badge: "Trusted Member" | "Top Contributor" | "New Member" | "Circle Lead";
  color: string; // Tailind class for visual variety
}

export interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  roundup: number;
  timestamp: string;
  status: "Completed" | "Pending";
  category: "Food" | "Transport" | "Shopping" | "Entertainment" | "Bills";
}

export interface Claim {
  id: string;
  claimantId: string;
  claimantName: string;
  claimantAvatar: string;
  reason: string;
  amount: number;
  description: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
  aiRiskLabel: "Looks Legitimate" | "Needs Review" | "High Risk";
  aiRiskConfidence: number; // percentage, e.g. 98
  aiRiskReason: string;
  votesYes: number;
  votesNo: number;
  votedMembers: Record<string, "yes" | "no">; // memberId -> choice
  receiptUrl?: string;
  payoutStatus: "Awaiting Vote" | "Processing" | "Paid Successfully" | "Rejected";
  payoutTxHash?: string;
}

export interface NotificationItem {
  id: string;
  message: string;
  time: string;
  type: "contribution" | "claim" | "vote" | "milestone" | "system";
  unread: boolean;
}

export interface PoolStats {
  totalBalance: number;
  targetMonthly: number;
  currentMonthlyContribution: number;
  totalClaimsPaid: number;
  pendingClaimsCount: number;
}
