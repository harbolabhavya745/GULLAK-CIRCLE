import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  TrendingUp, 
  Users, 
  Award, 
  Calendar, 
  Clock, 
  Activity, 
  CheckCircle, 
  ChevronRight, 
  Sparkles, 
  ArrowUpRight,
  Copy,
  Check,
  KeyRound
} from "lucide-react";
import { Member, Transaction, Claim } from "../types";

interface CircleDetailsPageProps {
  poolBalance: number;
  members: Member[];
  recentTransactions: Transaction[];
  claims?: Claim[];
  circleCreatedAt?: string;
  inviteCode?: string;
}

export const CircleDetailsPage: React.FC<CircleDetailsPageProps> = ({
  poolBalance,
  members,
  recentTransactions,
  claims = [],
  circleCreatedAt,
  inviteCode
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyInviteCode = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error("Failed to copy invite code", err);
    }
  };

  const now = new Date();
  const monthlyDeposits = recentTransactions
    .filter((t) => t.createdAt && new Date(t.createdAt).getMonth() === now.getMonth() && new Date(t.createdAt).getFullYear() === now.getFullYear())
    .reduce((sum, t) => sum + t.roundup, 0);

  const totalClaimsDisbursed = claims
    .filter((c) => c.payoutStatus === "Paid Successfully")
    .reduce((sum, c) => sum + c.amount, 0);

  const avgContributionScore = members.length > 0
    ? (members.reduce((sum, m) => sum + m.score, 0) / members.length)
    : 0;

  const createdDateLabel = circleCreatedAt
    ? new Date(circleCreatedAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Gullak Trust Circle</h2>
        <p className="text-xs text-slate-500 mt-1">Manage, audit and inspect active mutual participants and overall stats</p>
      </div>

      {/* Invite Code Card */}
      {inviteCode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-matte-charcoal border border-gold-500/15 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gold-500/10 rounded-xl text-gold-500 border border-gold-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Invite Friends</h3>
              <p className="text-xs text-slate-500 font-mono">Share this code so others can join your circle</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-4 py-2.5 rounded-xl bg-matte-black border border-gold-500/15 text-gold-500 font-mono font-bold tracking-[0.2em] text-sm">
              {inviteCode}
            </span>
            <button
              type="button"
              onClick={handleCopyInviteCode}
              className="p-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-matte-black transition-colors"
              aria-label="Copy invite code"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Large Pool Balance Card, Pool Statistics, Roundups */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Large Pool Balance Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-3xl bg-gradient-to-br from-matte-charcoal via-matte-black to-matte-charcoal text-white border border-gold-500/15 relative overflow-hidden shadow-xl"
          >
            {/* Visual Glass Ring Orbs */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold-500/5 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-amber-500/5 rounded-full blur-xl" />

            <p className="text-xs font-mono text-slate-400 tracking-widest uppercase">GULLAK TOTAL LIQUIDITY</p>
            <p className="text-4xl font-bold tracking-tight text-gold-gradient mt-2 font-heading">
              ₹{poolBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 pt-6 border-t border-gold-500/10">
              <div>
                <p className="text-[10px] font-mono text-slate-500 uppercase">Monthly Deposits</p>
                <p className="text-sm font-bold text-gold-500 mt-1">₹{monthlyDeposits.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-slate-500 uppercase">Emergency Reserves</p>
                <p className="text-sm font-bold text-gold-500 mt-1">{poolBalance > 0 ? "Active" : "Building Up"}</p>
              </div>
            </div>
          </motion.div>

          {/* Pool Statistics */}
          <div className="p-6 rounded-3xl bg-matte-charcoal border border-gold-500/10 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-400">Pool Statistics</h3>
            
            <div className="space-y-3">
              {[
                { label: "Created Date", value: createdDateLabel, icon: Calendar },
                { label: "Active Members", value: `${members.length} / 10 limit`, icon: Users },
                { label: "Total Claims Disbursed", value: `₹${totalClaimsDisbursed.toFixed(2)}`, icon: CheckCircle },
                { label: "Avg. Contribution Score", value: `${avgContributionScore.toFixed(1)}/100`, icon: Award },
              ].map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-matte-black border border-gold-500/5">
                  <div className="flex items-center gap-2.5">
                    <stat.icon className="w-4 h-4 text-gold-500/70" />
                    <span className="text-xs text-slate-400">{stat.label}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-200">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Group activity Timeline */}
          <div className="p-6 rounded-3xl bg-matte-charcoal border border-gold-500/10 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-400 mb-4">Activity Timeline</h3>
            <div className="space-y-4">
              {recentTransactions.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono py-4">No activity yet. Do a roundup to get started.</p>
              ) : (
                recentTransactions.slice(0, 4).map((item, idx) => (
                  <div key={item.id} className="flex gap-3 text-xs">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-gold-500 shadow-md shadow-gold-500/20" />
                      {idx < Math.min(3, recentTransactions.length - 1) && <div className="w-[1px] bg-gold-500/10 flex-grow my-1" />}
                    </div>
                    <div>
                      <p className="text-slate-500 font-mono text-[10px]">{item.timestamp}</p>
                      <p className="text-slate-300 font-medium mt-0.5 leading-relaxed">
                        Spare change of ₹{item.roundup.toFixed(2)} rounded up from {item.merchant}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right 2 Columns: Members Grid & Contribution Leaderboard */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Members Grid with Contribution Score circular indicator */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100">Active Circle Members</h3>
              <span className="text-xs text-slate-500 font-mono">Sorted by Name</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members.map((member) => {
                // Circular progress calculations (using luxury gold for fill)
                const strokeColor = "#D4AF37";
                
                // SVG circle math
                const radius = 22;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset = circumference - (member.score / 100) * circumference;

                return (
                  <motion.div
                    key={member.id}
                    whileHover={{ scale: 1.01 }}
                    className="p-5 rounded-3xl bg-matte-charcoal border border-gold-500/10 shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar with Role */}
                      <div className="relative">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-2xl object-cover border border-gold-500/10"
                        />
                        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 text-[8px] bg-gold-500 text-matte-black font-mono rounded font-bold uppercase">
                          {member.role.split(" ")[0]}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-200">{member.name}</h4>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-500 border border-gold-500/20">
                            {member.badge}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Circular Score Indicator & Amount */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 font-mono uppercase">CONTRIBUTION</p>
                        <p className="text-sm font-bold text-gold-500 font-mono">₹{member.totalContributed}</p>
                      </div>

                      <div className="relative w-14 h-14 flex items-center justify-center">
                        {/* Circular progress SVG */}
                        <svg className="w-full h-full rotate-[-90deg]">
                          <circle
                            cx="28"
                            cy="28"
                            r={radius}
                            className="stroke-matte-black"
                            strokeWidth="3.5"
                            fill="transparent"
                          />
                          <motion.circle
                            cx="28"
                            cy="28"
                            r={radius}
                            stroke={strokeColor}
                            strokeWidth="3.5"
                            fill="transparent"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-[11px] font-bold tracking-tighter text-gold-500">{member.score}</span>
                          <span className="text-[8px] text-slate-500 font-mono leading-none">SCORE</span>
                        </div>
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
