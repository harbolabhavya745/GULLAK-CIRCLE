import { supabase } from "./supabase";
import { Member, Transaction, Claim, PoolStats } from "../types";

// Deterministic color assignment since the DB doesn't store one
const MEMBER_COLORS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-400 to-teal-600",
  "from-amber-400 to-orange-500",
  "from-pink-500 to-rose-600",
  "from-violet-500 to-purple-600",
  "from-cyan-400 to-blue-600",
];

function colorForId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return MEMBER_COLORS[hash % MEMBER_COLORS.length];
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString();
}

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Creates a profile row if one doesn't exist yet for this auth user
export async function ensureProfile(user: { id: string; email?: string; user_metadata?: any }) {
  const existing = await fetchProfile(user.id);
  if (existing) return existing;

  const name = user.user_metadata?.name || user.email?.split("@")[0] || "New Member";
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      name,
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      role: "Member",
      total_contributed: 0,
      score: 50,
      badge: "New Member",
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function fetchMyCircleId(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("circle_members")
    .select("circle_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.circle_id ?? null;
}

export async function createCircle(name: string, userId: string) {
  const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase();
  const { data: circle, error } = await supabase
    .from("circles")
    .insert({ name, invite_code: inviteCode, pool_balance: 0, created_by: userId })
    .select("*")
    .single();
  if (error) throw error;

  const { error: memberError } = await supabase
    .from("circle_members")
    .insert({ circle_id: circle.id, user_id: userId });
  if (memberError) throw memberError;

  return circle;
}

export async function joinCircleByInviteCode(inviteCode: string, userId: string) {
  const { data: circle, error } = await supabase
    .from("circles")
    .select("*")
    .eq("invite_code", inviteCode.trim().toUpperCase())
    .maybeSingle();
  if (error) throw error;
  if (!circle) throw new Error("No circle found with that invite code.");

  const { error: memberError } = await supabase
    .from("circle_members")
    .insert({ circle_id: circle.id, user_id: userId });
  if (memberError) throw memberError;

  return circle;
}

export async function fetchCircle(circleId: string) {
  const { data, error } = await supabase
    .from("circles")
    .select("*")
    .eq("id", circleId)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchMembers(circleId: string): Promise<Member[]> {
  const { data, error } = await supabase
    .from("circle_members")
    .select("user_id, profiles(*)")
    .eq("circle_id", circleId);
  if (error) throw error;

  return (data ?? [])
    .filter((row: any) => row.profiles)
    .map((row: any) => {
      const p = row.profiles;
      return {
        id: p.id,
        name: p.name,
        avatar: p.avatar_url,
        role: p.role || "Member",
        totalContributed: Number(p.total_contributed ?? 0),
        score: p.score ?? 0,
        badge: p.badge || "New Member",
        color: colorForId(p.id),
      } as Member;
    });
}

export async function fetchTransactions(circleId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("circle_id", circleId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;

  return (data ?? []).map((t: any) => ({
    id: t.id,
    userId: t.user_id,
    merchant: t.merchant,
    amount: Number(t.amount),
    roundup: Number(t.roundup),
    timestamp: timeAgo(t.created_at),
    status: "Completed",
    category: t.category || "Shopping",
  }));
}

export async function fetchClaims(circleId: string): Promise<Claim[]> {
  const { data, error } = await supabase
    .from("claims")
    .select("*, claimant:profiles!claimant_id(*)")
    .eq("circle_id", circleId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const claimIds = (data ?? []).map((c: any) => c.id);
  let votesByClaimId: Record<string, Record<string, "yes" | "no">> = {};
  if (claimIds.length > 0) {
    const { data: votes, error: votesError } = await supabase
      .from("votes")
      .select("*")
      .in("claim_id", claimIds);
    if (votesError) throw votesError;
    for (const v of votes ?? []) {
      votesByClaimId[v.claim_id] = votesByClaimId[v.claim_id] || {};
      votesByClaimId[v.claim_id][v.voter_id] = v.choice;
    }
  }

  return (data ?? []).map((c: any) => ({
    id: c.id,
    claimantId: c.claimant_id,
    claimantName: c.claimant?.name || "Unknown Member",
    claimantAvatar: c.claimant?.avatar_url || "",
    reason: c.reason,
    amount: Number(c.amount),
    description: c.description || "",
    date: new Date(c.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }),
    status: c.status || "Pending",
    aiRiskLabel: c.ai_risk_label || "Needs Review",
    aiRiskConfidence: c.ai_risk_confidence ?? 0,
    aiRiskReason: c.ai_risk_reason || "",
    votesYes: c.votes_yes ?? 0,
    votesNo: c.votes_no ?? 0,
    votedMembers: votesByClaimId[c.id] || {},
    receiptUrl: c.receipt_url,
    payoutStatus: c.payout_status || "Awaiting Vote",
  }));
}

export function computePoolStats(
  circlePoolBalance: number,
  transactions: Transaction[],
  claims: Claim[]
): PoolStats {
  const monthlyContribution = transactions.reduce((sum, t) => sum + t.roundup, 0);

  const totalClaimsPaid = claims
    .filter((c) => c.payoutStatus === "Paid Successfully")
    .reduce((sum, c) => sum + c.amount, 0);

  const pendingClaimsCount = claims.filter((c) => c.status === "Pending").length;

  return {
    totalBalance: circlePoolBalance,
    targetMonthly: 5000,
    currentMonthlyContribution: monthlyContribution,
    totalClaimsPaid,
    pendingClaimsCount,
  };
}
