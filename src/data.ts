import { Member, Transaction, Claim, NotificationItem, PoolStats } from "./types";

export const mockMembers: Member[] = [
  {
    id: "m1",
    name: "Arjun Mehta",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "Circle Founder",
    totalContributed: 2450,
    score: 96,
    badge: "Top Contributor",
    color: "from-blue-500 to-indigo-600"
  },
  {
    id: "m2",
    name: "Riya Sharma",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    role: "Treasurer",
    totalContributed: 1890,
    score: 92,
    badge: "Trusted Member",
    color: "from-emerald-400 to-teal-600"
  },
  {
    id: "m3",
    name: "Karan Johar",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    role: "Member",
    totalContributed: 1210,
    score: 88,
    badge: "Trusted Member",
    color: "from-amber-400 to-orange-500"
  },
  {
    id: "m4",
    name: "Ananya Iyer",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
    role: "Auditor",
    totalContributed: 2150,
    score: 95,
    badge: "Top Contributor",
    color: "from-pink-500 to-rose-600"
  },
  {
    id: "m5",
    name: "Rahul Nair",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    role: "Member",
    totalContributed: 840,
    score: 84,
    badge: "New Member",
    color: "from-violet-500 to-purple-600"
  },
  {
    id: "m6",
    name: "Neha Gupta",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "Member",
    totalContributed: 520,
    score: 79,
    badge: "New Member",
    color: "from-cyan-400 to-blue-600"
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: "t1",
    merchant: "Starbucks Coffee",
    amount: 282.50,
    roundup: 7.50,
    timestamp: "2 mins ago",
    status: "Completed",
    category: "Food"
  },
  {
    id: "t2",
    merchant: "Uber Rides",
    amount: 144.20,
    roundup: 5.80,
    timestamp: "1 hour ago",
    status: "Completed",
    category: "Transport"
  },
  {
    id: "t3",
    merchant: "Amazon India",
    amount: 1245.00,
    roundup: 5.00,
    timestamp: "4 hours ago",
    status: "Completed",
    category: "Shopping"
  },
  {
    id: "t4",
    merchant: "Zomato Delivery",
    amount: 489.10,
    roundup: 10.90,
    timestamp: "Yesterday",
    status: "Completed",
    category: "Food"
  },
  {
    id: "t5",
    merchant: "BookMyShow Ticket",
    amount: 320.00,
    roundup: 10.00,
    timestamp: "2 days ago",
    status: "Completed",
    category: "Entertainment"
  }
];

export const mockClaims: Claim[] = [
  {
    id: "c1",
    claimantId: "m5",
    claimantName: "Rahul Nair",
    claimantAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    reason: "Dental Root Canal Emergency",
    amount: 8500,
    description: "Experienced sudden severe tooth infection requiring an urgent root canal and crown placement. My employer health policy has a high dental deductible.",
    date: "July 01, 2026",
    status: "Pending",
    aiRiskLabel: "Looks Legitimate",
    aiRiskConfidence: 94,
    aiRiskReason: "Consistent with standard local healthcare rates. No recent claims from this member.",
    votesYes: 2,
    votesNo: 0,
    votedMembers: { "m1": "yes", "m4": "yes" },
    receiptUrl: "medical_receipt_placeholder.pdf",
    payoutStatus: "Awaiting Vote"
  },
  {
    id: "c2",
    claimantId: "m3",
    claimantName: "Karan Johar",
    claimantAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    reason: "Laptop Screen Crash (Work Essential)",
    amount: 14500,
    description: "Laptop display panel got completely cracked after falling. Need it desperately to continue college assignments and freelance design work.",
    date: "June 28, 2026",
    status: "Pending",
    aiRiskLabel: "Needs Review",
    aiRiskConfidence: 78,
    aiRiskReason: "Moderate claim size. Invoice details from independent repair shop require verification.",
    votesYes: 1,
    votesNo: 1,
    votedMembers: { "m2": "yes", "m1": "no" },
    receiptUrl: "repair_bill_placeholder.pdf",
    payoutStatus: "Awaiting Vote"
  },
  {
    id: "c3",
    claimantId: "m2",
    claimantName: "Riya Sharma",
    claimantAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    reason: "Emergency Car Towing & Brake Fix",
    amount: 6200,
    description: "Car broke down on NH-48 with worn out brake pads. Paid towing service and immediate replacement parts at a highway service station.",
    date: "June 15, 2026",
    status: "Approved",
    aiRiskLabel: "Looks Legitimate",
    aiRiskConfidence: 98,
    aiRiskReason: "Official roadside assistance invoices attached. Consistent with geographical location.",
    votesYes: 5,
    votesNo: 0,
    votedMembers: { "m1": "yes", "m3": "yes", "m4": "yes", "m5": "yes", "m6": "yes" },
    receiptUrl: "towing_receipt_verified.pdf",
    payoutStatus: "Paid Successfully",
    payoutTxHash: "0x89fbc0d9e...1b23"
  },
  {
    id: "c4",
    claimantId: "m6",
    claimantName: "Neha Gupta",
    claimantAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    reason: "New iPhone Upgrade Support",
    amount: 25000,
    description: "I wanted to upgrade my phone from iPhone 12 to iPhone 15 so that I can take high-quality images for my social media accounts.",
    date: "May 10, 2026",
    status: "Rejected",
    aiRiskLabel: "High Risk",
    aiRiskConfidence: 99,
    aiRiskReason: "Lifestyle upgrade claim. Violates mutual trust clause regarding critical emergencies.",
    votesYes: 0,
    votesNo: 6,
    votedMembers: { "m1": "no", "m2": "no", "m3": "no", "m4": "no", "m5": "no", "m6": "no" },
    receiptUrl: "iphone_invoice_rejected.pdf",
    payoutStatus: "Rejected"
  }
];

export const mockNotifications: NotificationItem[] = [
  {
    id: "n1",
    message: "Arjun Mehta's spare change rounded up ₹7.50 from Starbucks.",
    time: "2 mins ago",
    type: "contribution",
    unread: true
  },
  {
    id: "n2",
    message: "Rahul Nair submitted a new claim of ₹8,500 for Dental emergency.",
    time: "4 hours ago",
    type: "claim",
    unread: true
  },
  {
    id: "n3",
    message: "Your contribution score updated to 94/100 (+2pts) for continuous weekly saving!",
    time: "1 day ago",
    type: "milestone",
    unread: false
  },
  {
    id: "n4",
    message: "Claim by Riya Sharma of ₹6,200 was approved and paid successfully.",
    time: "2 days ago",
    type: "vote",
    unread: false
  },
  {
    id: "n5",
    message: "Gullak Circle pool hit ₹24,000 milestone! 🎉",
    time: "3 days ago",
    type: "milestone",
    unread: false
  }
];

export const mockPoolStats: PoolStats = {
  totalBalance: 24850,
  targetMonthly: 5000,
  currentMonthlyContribution: 4230,
  totalClaimsPaid: 18400,
  pendingClaimsCount: 2
};

export const mockAchievements = [
  { id: "a1", name: "Perfect Saver", desc: "No missed roundups for 30 consecutive days", icon: "Flame", unlocked: true },
  { id: "a2", name: "First Responder", desc: "Voted on 5 claims within an hour of submission", icon: "ShieldAlert", unlocked: true },
  { id: "a3", name: "Super Trustee", desc: "Achieve a contribution score of 95 or above", icon: "Sparkles", unlocked: true },
  { id: "a4", name: "Group Pillar", desc: "Contributed over ₹5,000 in lifetime spare change", icon: "Coins", unlocked: false }
];
