import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Coins, 
  Users, 
  ShieldAlert, 
  ArrowUpRight, 
  Activity, 
  Sparkles, 
  PlusCircle, 
  ChevronRight, 
  CheckCircle,
  Clock,
  PiggyBank,
  TrendingUp,
  AlertCircle,
  Pencil,
  Check,
  X,
  Award
} from "lucide-react";
import { Member, Transaction, Claim, PoolStats } from "../types";

interface DashboardPageProps {
  circleName: string;
  poolBalance: number;
  members: Member[];
  recentTransactions: Transaction[];
  pendingClaims: Claim[];
  poolStats: PoolStats;
  onNavigate: (page: string) => void;
  milestoneTarget: number;
  onUpdateMilestone: (newTarget: number) => Promise<void> | void;
  milestoneUpdateError?: string;
  onViewMember?: (id: string, name: string, avatar: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  circleName,
  poolBalance,
  members,
  recentTransactions,
  pendingClaims,
  poolStats,
  onNavigate,
  milestoneTarget,
  onUpdateMilestone,
  milestoneUpdateError = "",
  onViewMember
}) => {
  // Simple calculated metrics
  // Pool Level = how many whole times the pool balance has cleared the target
  // milestone (1x target = Level 1, 2x target = Level 2, and so on).
  const poolLevel = milestoneTarget > 0 ? Math.floor(poolBalance / milestoneTarget) : 0;
  // Progress bar tracks movement toward the *next* level, not just the first target,
  // so it doesn't stay pinned at 100% forever after the first milestone is hit.
  const milestoneProgress = milestoneTarget > 0
    ? Math.min(((poolBalance % milestoneTarget) / milestoneTarget) * 100, 100)
    : 0;

  const [isEditingMilestone, setIsEditingMilestone] = React.useState(false);
  const [showMembersModal, setShowMembersModal] = React.useState(false);
  const [milestoneInput, setMilestoneInput] = React.useState(String(milestoneTarget));
  const [isSavingMilestone, setIsSavingMilestone] = React.useState(false);
  const [milestoneError, setMilestoneError] = React.useState("");

  // "New Achievement Unlocked" banner — fires whenever poolLevel ticks up.
  const [unlockedLevel, setUnlockedLevel] = React.useState<number | null>(null);
  const prevLevelRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (prevLevelRef.current === null) {
      // First render: just record the starting level, don't celebrate
      // levels the circle had already reached before this page loaded.
      prevLevelRef.current = poolLevel;
      return;
    }
    if (poolLevel > prevLevelRef.current) {
      setUnlockedLevel(poolLevel);
      const timer = setTimeout(() => setUnlockedLevel(null), 5000);
      prevLevelRef.current = poolLevel;
      return () => clearTimeout(timer);
    }
    prevLevelRef.current = poolLevel;
  }, [poolLevel]);

  const startEditingMilestone = () => {
    setMilestoneInput(String(milestoneTarget));
    setMilestoneError("");
    setIsEditingMilestone(true);
  };

  const cancelEditingMilestone = () => {
    setIsEditingMilestone(false);
    setMilestoneError("");
  };

  const saveMilestone = async () => {
    const parsed = parseFloat(milestoneInput);
    if (isNaN(parsed) || parsed <= 0) {
      setMilestoneError("Enter an amount greater than 0.");
      return;
    }
    setIsSavingMilestone(true);
    setMilestoneError("");
    try {
      await onUpdateMilestone(parsed);
      setIsEditingMilestone(false);
    } catch (err) {
      setMilestoneError("Couldn't save. Try again.");
    } finally {
      setIsSavingMilestone(false);
    }
  };

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

        <div className="relative z-10 space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">
            Welcome back to {circleName}!
          </h2>
          <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
            You saved ₹{savedThisWeek.toFixed(2)} this week from spare roundups. Your circle is fully secure, and {pendingClaims.length} pending claim{pendingClaims.length === 1 ? "" : "s"} await review.
          </p>
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
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest font-semibold">
                Next Circle Milestone
              </span>
              {poolLevel > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/25 text-gold-500 text-[10px] font-bold uppercase tracking-wider">
                  <Award className="w-3 h-3" />
                  Level {poolLevel}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isEditingMilestone && (
                <button
                  type="button"
                  onClick={startEditingMilestone}
                  aria-label="Edit milestone target"
                  className="p-1.5 text-slate-500 hover:text-gold-500 rounded-lg hover:bg-gold-500/10 transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              <div className="p-2.5 bg-gold-500/10 text-gold-500 rounded-xl border border-gold-500/10">
                <PiggyBank className="w-4.5 h-4.5" />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {unlockedLevel !== null && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-3 overflow-hidden"
              >
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gold-500/10 border border-gold-500/30">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-gold-500/15 text-gold-500 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </span>
                  <div className="leading-tight">
                    <p className="text-xs font-bold text-gold-500">New Achievement Unlocked!</p>
                    <p className="text-[11px] text-slate-400">Circle reached Pool Level {unlockedLevel}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isEditingMilestone ? (
            <div className="mb-2 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  autoFocus
                  value={milestoneInput}
                  onChange={(e) => setMilestoneInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveMilestone();
                    if (e.key === "Escape") cancelEditingMilestone();
                  }}
                  disabled={isSavingMilestone}
                  className="w-full px-2 py-1 rounded-lg bg-matte-black border border-gold-500/20 focus:outline-none focus:ring-1 focus:ring-gold-500 text-2xl font-bold text-slate-100 font-mono"
                />
                <button
                  type="button"
                  onClick={saveMilestone}
                  disabled={isSavingMilestone}
                  aria-label="Save milestone"
                  className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingMilestone ? (
                    <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={cancelEditingMilestone}
                  disabled={isSavingMilestone}
                  aria-label="Cancel editing milestone"
                  className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {milestoneError && <p className="text-[11px] text-red-400">{milestoneError}</p>}
            </div>
          ) : (
            <div className="flex items-baseline gap-2 mb-2">
              <p className="text-3xl font-bold tracking-tight text-slate-100">₹{milestoneTarget.toLocaleString("en-IN")}</p>
              <span className="text-xs text-slate-500 font-mono">Target</span>
            </div>
          )}
          {milestoneUpdateError && !isEditingMilestone && (
            <p className="text-[11px] text-red-400 mb-2">{milestoneUpdateError}</p>
          )}

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500 font-mono">
              <span>{milestoneProgress.toFixed(1)}% to Level {poolLevel + 1}</span>
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
          onClick={() => setShowMembersModal(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter") setShowMembersModal(true); }}
          className="p-6 rounded-3xl bg-matte-charcoal border border-gold-500/10 shadow-lg shadow-black/30 relative overflow-hidden cursor-pointer hover:border-gold-500/30 transition-colors"
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
          <p className="text-[10px] text-slate-600 mt-2 font-mono">Click to view all member profiles →</p>
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
            <div className="mb-6">
              <h3 className="text-base font-bold text-slate-100">Live Rounded-up Spare Change</h3>
              <p className="text-xs text-slate-500 mt-0.5">Micro-savings automatically deposited into the pool</p>
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
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
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

      {/* Circle Trust Members Modal */}
      <AnimatePresence>
        {showMembersModal && (
          <motion.div
            key="members-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMembersModal(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              key="members-modal-panel"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md max-h-[80vh] flex flex-col rounded-3xl bg-matte-charcoal border border-gold-500/15 shadow-2xl overflow-hidden"
            >
              <div className="p-5 flex items-center justify-between border-b border-gold-500/10 flex-shrink-0">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Circle Trust Members</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{members.length} verified friends in your circle</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMembersModal(false)}
                  aria-label="Close"
                  className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 space-y-1.5 overflow-y-auto">
                {members.map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => onViewMember?.(m.id, m.name, m.avatar)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gold-500/5 transition-colors text-left cursor-pointer"
                  >
                    <img
                      src={m.avatar}
                      alt={m.name}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-full object-cover border border-gold-500/15 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-200 truncate">{m.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{m.role}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 justify-end">
                        <Award className={`w-3 h-3 ${
                          m.score >= 90 ? "text-gold-500" :
                          m.score >= 70 ? "text-slate-300" :
                          m.score >= 40 ? "text-amber-500" : "text-red-500"
                        }`} />
                        <span className={`text-sm font-bold font-mono ${
                          m.score >= 90 ? "text-gold-500" :
                          m.score >= 70 ? "text-slate-300" :
                          m.score >= 40 ? "text-amber-500" : "text-red-500"
                        }`}>
                          {m.score}
                        </span>
                        <span className="text-[10px] text-slate-500">/100</span>
                      </div>
                      <p className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">Trust Score</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
