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

// Members with a higher Contribution Score are more trusted by the circle,
// so their claims need fewer YES votes to clear. Tiered instead of linear so
// it's easy to reason about and tune.
export function getVotesRequired(contributionScore: number): number {
  if (contributionScore >= 90) return 2;
  if (contributionScore >= 70) return 3;
  if (contributionScore >= 40) return 4;
  return 5;
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

// Uploads a new avatar image to Supabase Storage and updates the profile row.
// Requires a public storage bucket named "avatars" (see project README/setup notes).
export async function updateAvatar(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split(".").pop() || "jpg";
  const filePath = `${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true, cacheControl: "3600" });
  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);
  const avatarUrl = publicUrlData.publicUrl;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", userId);
  if (updateError) throw updateError;

  return avatarUrl;
}

// Updates the display name on a member's own profile row.
export async function updateName(userId: string, name: string): Promise<string> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Name can't be empty.");
  if (trimmed.length > 40) throw new Error("Name must be 40 characters or fewer.");

  const { error } = await supabase
    .from("profiles")
    .update({ name: trimmed })
    .eq("id", userId);
  if (error) throw error;

  return trimmed;
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

export async function updateCircleName(circleId: string, name: string): Promise<string> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Circle name can't be empty.");
  if (trimmed.length > 60) throw new Error("Circle name must be 60 characters or fewer.");

  const { error } = await supabase
    .from("circles")
    .update({ name: trimmed })
    .eq("id", circleId);
  if (error) throw error;

  return trimmed;
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

// Updates the circle's savings goal shown as "Next Circle Milestone" on the
// Dashboard. Requires a `milestone_target` numeric column on `circles`
// (see project setup notes) — falls back to 30000 client-side if absent.
export async function updateMilestone(circleId: string, milestoneTarget: number): Promise<void> {
  const { error } = await supabase
    .from("circles")
    .update({ milestone_target: milestoneTarget })
    .eq("id", circleId);
  if (error) throw error;
}

// Turns raw contribution amounts into a 0-100 score that moves live as
// members contribute. Weighted blend of:
//  - relative share vs. the circle's top contributor (rewards being ahead)
//  - relative share vs. the circle average (rewards being above the pack)
// A 15-point floor keeps brand-new members from showing 0 and looking "bad".
export function computeContributionScore(
  totalContributed: number,
  allContributions: number[]
): number {
  const contributions = allContributions.length > 0 ? allContributions : [totalContributed];
  const max = Math.max(...contributions, 0);
  const avg = contributions.reduce((sum, v) => sum + v, 0) / contributions.length;

  if (max <= 0) return 50; // nobody has contributed anything yet

  const vsTop = (totalContributed / max) * 100;
  const vsAvg = avg > 0 ? Math.min(150, (totalContributed / avg) * 100) : 100;

  const blended = vsTop * 0.6 + vsAvg * 0.4;
  return Math.round(Math.min(100, Math.max(15, blended)));
}

export async function fetchMembers(circleId: string): Promise<Member[]> {
  const { data, error } = await supabase
    .from("circle_members")
    .select("user_id, profiles(*)")
    .eq("circle_id", circleId);
  if (error) throw error;

  const rows = (data ?? []).filter((row: any) => row.profiles);

  // Contribution totals are derived live from the transactions table rather
  // than trusting a stored `total_contributed` column on profiles. Writing
  // that column from the client requires RLS to trust a user's own claimed
  // contribution (and, worse, needs write access to *other* members' rows
  // whenever their score gets recalculated) — RLS correctly blocks that, so
  // the column silently never updated. Summing straight from transactions
  // needs no extra write permissions and can't be faked client-side.
  const { data: txRows, error: txError } = await supabase
    .from("transactions")
    .select("user_id, roundup")
    .eq("circle_id", circleId);
  if (txError) throw txError;

  const contributionByUser: Record<string, number> = {};
  for (const t of txRows ?? []) {
    if (!t.user_id) continue;
    contributionByUser[t.user_id] = (contributionByUser[t.user_id] ?? 0) + Number(t.roundup ?? 0);
  }

  const allContributions = rows.map((row: any) => contributionByUser[row.profiles.id] ?? 0);

  return rows.map((row: any) => {
    const p = row.profiles;
    const totalContributed = contributionByUser[p.id] ?? 0;
    return {
      id: p.id,
      name: p.name,
      avatar: p.avatar_url,
      role: p.role || "Member",
      totalContributed,
      score: computeContributionScore(totalContributed, allContributions),
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
    // A generous cap, not a tight rolling window — the Contribution Trends chart
    // and the weekly/monthly dashboard stats bucket this list by date, so a
    // small limit (e.g. 50) makes older days silently vanish as new
    // transactions push them past the cutoff. 1000 comfortably covers a
    // friends-and-family circle's history while still bounding the query.
    .limit(1000);
  if (error) throw error;

  return (data ?? []).map((t: any) => ({
    id: t.id,
    userId: t.user_id,
    createdAt: t.created_at,
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

  return (data ?? []).map((c: any) => {
    const claimantScore = c.claimant?.score ?? 0;
    return {
      id: c.id,
      claimantId: c.claimant_id,
      claimantName: c.claimant?.name || "Unknown Member",
      claimantAvatar: c.claimant?.avatar_url || "",
      claimantScore,
      votesRequired: getVotesRequired(claimantScore),
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
    } as Claim;
  });
}

// Uploads a claim's receipt/invoice image to Supabase Storage and returns its
// public URL. Uses the "reciepts" bucket (matches the actual bucket name set
// up in the Supabase dashboard — note the spelling).
export async function uploadClaimReceipt(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split(".").pop() || "jpg";
  const filePath = `${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("reciepts")
    .upload(filePath, file, { upsert: true, cacheControl: "3600" });
  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage
    .from("reciepts")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

// Inserts a new claim, then kicks off the async Claude-powered fraud check
// (supabase/functions/fraud-check) which writes ai_risk_* fields back onto
// the row once it completes. Voting opens immediately, but this lets the
// AI Guard badge populate a few seconds later without blocking submission.
export async function submitClaimWithAiCheck(params: {
  circleId: string;
  claimantId: string;
  claimantScore: number;
  reason: string;
  amount: number;
  description: string;
  receiptUrl: string;
}): Promise<void> {
  const { circleId, claimantId, claimantScore, reason, amount, description, receiptUrl } = params;

  const { data: inserted, error: insertError } = await supabase
    .from("claims")
    .insert({
      circle_id: circleId,
      claimant_id: claimantId,
      reason,
      amount,
      description,
      receipt_url: receiptUrl,
      status: "Pending",
      payout_status: "Awaiting Vote",
      votes_yes: 0,
      votes_no: 0,
    })
    .select()
    .single();
  if (insertError) throw insertError;

  const { count: previousClaims } = await supabase
    .from("claims")
    .select("id", { count: "exact", head: true })
    .eq("claimant_id", claimantId)
    .eq("circle_id", circleId)
    .neq("id", inserted.id);

  // Fire-and-forget: don't let a slow/unavailable AI function block the
  // submission flow. Errors are logged but not surfaced to the claimant.
  supabase.functions
    .invoke("fraud-check", {
      body: {
        claim: {
          id: inserted.id,
          reason,
          amount,
          description,
          contributor_score: claimantScore,
          previous_claims: previousClaims ?? 0,
        },
      },
    })
    .catch((err) => console.error("Fraud check failed", err));
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
