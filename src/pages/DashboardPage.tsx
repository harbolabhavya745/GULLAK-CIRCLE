import React from "react";
import { motion } from "motion/react";
import { 
  Coins, 
  Users, 
  ShieldAlert, 
  ArrowUpRight, 
  Activity, 
  PlusCircle, 
  ChevronRight, 
  CheckCircle,
  Clock,
  PiggyBank,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { Member, Transaction, Claim, PoolStats } from "../types";

interface DashboardPageProps {
  poolBalance: number;
  members: Member[];
  recentTransactions: Transaction[];
  pendingClaims: Claim[];
  poolStats: PoolStats;
  onNavigate: (page: string) => void;
  isDarkMode: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  poolBalance,
  members,
  recentTransactions,
  pendingClaims,
  poolStats,
  onNavigate,
  isDarkMode
}) => {
  // Simple calculated metrics
  const nextMilestone = 30000;
  const milestoneProgress = Math.min((poolBalance / nextMilestone) * 100, 100);

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const savedThisWeek = recentTransactions
    .filter((t) => t.createdAt && new Date(t.createdAt).getTime() >= oneWeekAgo)
    .reduce((sum, t) => sum + t.roundup, 0);

  const avgTrustScore = members.length > 0
    ? (members.reduce((sum, m) => sum + m.score, 0) / members.length)
    : 0;

  // Bucket real roundups into the last 6 calendar months for the trend chart
  const monthLabels: string[] = [];
  const monthTotals: number[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(d.toLocaleDateString("en-IN", { month: "short" }));
    const monthTotal = recentTransactions
      .filter((t) => {
        if (!t.createdAt) return false;
        const td = new Date(t.createdAt);
        return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth();
      })
      .reduce((sum, t) => sum + t.roundup, 0);
    monthTotals.push(monthTotal);
  }
  const maxMonthTotal = Math.max(...monthTotals, 1);
  const chartPoints = monthTotals.map((total, i) => {
    const x = (i / (monthTotals.length - 1)) * 100;
    const y = 38 - (total / maxMonthTotal) * 33;
    return { x, y };
  });
  const linePath = chartPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L 100 40 L 0 40 Z`;

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-matte-charcoal via-matte-black to-matte-charcoal text-white border border-gold-500/15 shadow-xl shadow-gold-500/5"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">
              Welcome back to Gullak Circle!
            </h2>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              You saved ₹{savedThisWeek.toFixed(2)} this week from spare roundups. Your circle is fully secure, and {pendingClaims.length} pending claim{pendingClaims.length === 1 ? "" : "s"} await review.
            </p>
          </div>
          <div className="flex md:justify-end gap-3">
            <button
              onClick={() => onNavigate("simulator")}
              className="px-5 py-3 bg-gold-500 hover:bg-gold-400 text-matte-black font-bold rounded-xl shadow-lg shadow-gold-500/20 transition-all text-xs uppercase tracking-wider cursor-pointer"
            >
              Simulate Roundup
            </button>
            <button
              onClick={() => onNavigate("submit-claim")}
              className="px-5 py-3 bg-matte-charcoal hover:bg-matte-black text-gold-500 font-bold rounded-xl shadow-md border border-gold-500/30 transition-all text-xs uppercase tracking-wider cursor-pointer"
            >
              Request Aid
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Stat 1: Total Pool Balance */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-6 rounded-3xl bg-matte-charcoal border border-gold-500/10 shadow-lg shadow-black/30 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full blur-xl" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest font-semibold">
              Total Pool Balance
            </span>
            <div className="p-2.5 bg-gold-500/10 text-gold-500 rounded-xl border border-gold-500/10">
              <Coins className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-3xl md:text-4xl font-bold tracking-tight text-gold-gradient">
            ₹{poolBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 font-mono">
            <span className="text-gold-500 font-bold">100%</span> active backing from members
          </p>
        </motion.div>

        {/* Stat 2: Contribution Progress */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-3xl bg-matte-charcoal border border-gold-500/10 shadow-lg shadow-black/30 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full blur-xl" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest font-semibold">
              Next Circle Milestone
            </span>
            <div className="p-2.5 bg-gold-500/10 text-gold-500 rounded-xl border border-gold-500/10">
              <PiggyBank className="w-4.5 h-4.5" />
            </div>
          </div>
          
          <div className="flex items-baseline gap-2 mb-2">
            <p className="text-3xl font-bold tracking-tight text-slate-100">₹{nextMilestone.toLocaleString("en-IN")}</p>
            <span className="text-xs text-slate-500 font-mono">Target</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500 font-mono">
              <span>{milestoneProgress.toFixed(1)}% Reached</span>
              <span>₹{poolBalance.toLocaleString()}</span>
            </div>
            <div className="w-full h-1.5 bg-matte-black rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gold-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${milestoneProgress}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Stat 3: Current Circle Membership */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-6 rounded-3xl bg-matte-charcoal border border-gold-500/10 shadow-lg shadow-black/30 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full blur-xl" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest font-semibold">
              Circle Trust Members
            </span>
            <div className="p-2.5 bg-gold-500/10 text-gold-500 rounded-xl border border-gold-500/10">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-3xl font-bold tracking-tight text-slate-100">{members.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Verified Friends</p>
            </div>
            {/* Minimal Avatar Pile */}
            <div className="flex -space-x-2 overflow-hidden ml-auto">
              {members.slice(0, 4).map((m) => (
                <img
                  key={m.id}
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-matte-charcoal object-cover border border-gold-500/15"
                  src={m.avatar}
                  alt={m.name}
                  referrerPolicy="no-referrer"
                />
              ))}
              {members.length > 4 && (
                <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-matte-charcoal bg-matte-black border border-gold-500/15 text-[10px] font-bold text-gold-500">
                  +{members.length - 4}
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gold-500/10 flex items-center justify-between">
            <span className="text-xs text-slate-500">Average Trust Score:</span>
            <span className="text-xs font-mono font-bold text-gold-500">{avgTrustScore.toFixed(1)}/100</span>
          </div>
        </motion.div>

      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Chart & Transactions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Custom Scoreboard Dashboard Chart */}
          <div className="p-6 rounded-3xl bg-matte-charcoal border border-gold-500/10 shadow-lg shadow-black/30">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-100">Contribution Trend (Spare Change)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Roundup deposits over the last 6 months</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <span className="w-2.5 h-2.5 bg-gold-500 rounded-full" /> Regular Roundups
              </div>
            </div>

            {/* Real Contribution Trend Chart */}
            <div className="relative h-48 w-full mt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(212,175,55,0.05)" strokeWidth="0.2" />
                <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(212,175,55,0.05)" strokeWidth="0.2" />
                <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(212,175,55,0.05)" strokeWidth="0.2" />

                {/* Area Fill */}
                <path d={areaPath} fill="url(#gradient)" />

                {/* Line */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="#F4C430"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />

                {/* Data Points */}
                {chartPoints.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="#F4C430" stroke="#1A1A1D" strokeWidth="0.5" />
                ))}
              </svg>

              {/* X-Axis Labels */}
              <div className="flex justify-between mt-4 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                {monthLabels.map((label, i) => (
                  <span key={i}>{label}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity / Spare-Change Roundups */}
          <div className="p-6 rounded-3xl bg-matte-charcoal border border-gold-500/10 shadow-lg shadow-black/30">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-100">Live Rounded-up Spare Change</h3>
                <p className="text-xs text-slate-500 mt-0.5">Micro-savings automatically deposited into the pool</p>
              </div>
              <button 
                onClick={() => onNavigate("simulator")}
                className="text-xs font-semibold text-gold-500 hover:text-gold-400 flex items-center gap-1 hover:underline cursor-pointer font-mono uppercase tracking-wider"
              >
                Go to Simulator <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {recentTransactions.slice(0, 4).map((tx) => (
                <div key={tx.id} className="p-4 rounded-2xl bg-matte-black border border-gold-500/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-500 border border-gold-500/10 flex items-center justify-center font-bold text-xs">
                      {tx.merchant.slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{tx.merchant}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
                        <Clock className="w-3 h-3" /> {tx.timestamp}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-mono text-slate-400">₹{tx.amount.toFixed(2)}</p>
                    <p className="text-xs font-mono font-bold text-gold-500 flex items-center justify-end gap-1">
                      Rounded +₹{tx.roundup.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Column: Pending Claims & Quick Actions */}
        <div className="space-y-8">
          
          {/* Quick Actions Panel */}
          <div className="p-6 rounded-3xl bg-matte-charcoal border border-gold-500/10 shadow-lg shadow-black/30">
            <h3 className="text-base font-bold text-slate-100 mb-4">Quick Circle Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onNavigate("submit-claim")}
                className="p-4 rounded-2xl bg-gold-500/5 hover:bg-gold-500/10 border border-gold-500/15 text-gold-500 transition-all text-left space-y-2 group cursor-pointer"
              >
                <PlusCircle className="w-6 h-6 group-hover:scale-105 transition-transform text-gold-500" />
                <p className="text-xs font-bold leading-tight uppercase tracking-wider font-sans">Submit Emergency Claim</p>
              </button>

              <button
                onClick={() => onNavigate("claims")}
                className="p-4 rounded-2xl bg-gold-500/5 hover:bg-gold-500/10 border border-gold-500/15 text-gold-500 transition-all text-left space-y-2 group cursor-pointer"
              >
                <CheckCircle className="w-6 h-6 group-hover:scale-105 transition-transform text-gold-500" />
                <p className="text-xs font-bold leading-tight uppercase tracking-wider font-sans">Vote Pending Claims ({pendingClaims.length})</p>
              </button>

              <button
                onClick={() => onNavigate("circle")}
                className="p-4 rounded-2xl bg-gold-500/5 hover:bg-gold-500/10 border border-gold-500/15 text-gold-500 transition-all text-left space-y-2 group cursor-pointer"
              >
                <Users className="w-6 h-6 group-hover:scale-105 transition-transform text-gold-500" />
                <p className="text-xs font-bold leading-tight uppercase tracking-wider font-sans">Circle Members Info</p>
              </button>

              <button
                onClick={() => onNavigate("simulator")}
                className="p-4 rounded-2xl bg-gold-500/5 hover:bg-gold-500/10 border border-gold-500/15 text-gold-500 transition-all text-left space-y-2 group cursor-pointer"
              >
                <Activity className="w-6 h-6 group-hover:scale-105 transition-transform text-gold-500" />
                <p className="text-xs font-bold leading-tight uppercase tracking-wider font-sans">Roundup Simulator</p>
              </button>
            </div>
          </div>

          {/* Active / Pending Claims Checklist */}
          <div className="p-6 rounded-3xl bg-matte-charcoal border border-gold-500/10 shadow-lg shadow-black/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-100">Live Active Claims</h3>
              <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-gold-500/10 text-gold-500 rounded-md border border-gold-500/20 uppercase tracking-widest">
                {pendingClaims.length} Vote
              </span>
            </div>

            {pendingClaims.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-400">All quiet in the circle!</p>
                <p className="text-xs text-slate-500">No pending emergency claims require review.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingClaims.map((claim) => (
                  <div
                    key={claim.id}
                    onClick={() => onNavigate("claims")}
                    className="p-4 rounded-2xl bg-matte-black border border-gold-500/5 cursor-pointer hover:border-gold-500/35 transition-all space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        className="h-8 w-8 rounded-full object-cover border border-gold-500/20"
                        src={claim.claimantAvatar}
                        alt={claim.claimantName}
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-300">{claim.claimantName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{claim.date}</p>
                      </div>
                      <span className="text-xs font-bold font-mono text-gold-500 ml-auto">
                        ₹{claim.amount.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-200 line-clamp-1">{claim.reason}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{claim.description}</p>
                    </div>

                    <div className="pt-2 border-t border-gold-500/5 flex items-center justify-between">
                      {/* AI fraud label badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        claim.aiRiskLabel === "Looks Legitimate" ? "bg-gold-500/10 text-gold-500" :
                        claim.aiRiskLabel === "Needs Review" ? "bg-amber-500/10 text-amber-500" :
                        "bg-red-500/10 text-red-500"
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${
                          claim.aiRiskLabel === "Looks Legitimate" ? "bg-gold-500" :
                          claim.aiRiskLabel === "Needs Review" ? "bg-amber-500" :
                          "bg-red-500"
                        }`} />
                        {claim.aiRiskLabel} ({claim.aiRiskConfidence}%)
                      </span>
                      <span className="text-[10px] text-gold-500 font-semibold flex items-center gap-0.5 font-mono uppercase tracking-wider">
                        Vote <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
