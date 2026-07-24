import React from "react";
import { motion } from "motion/react";
import {
  Crown,
  ShieldCheck,
  BellOff,
  LayoutGrid,
  LineChart,
  Check,
  Sparkles,
  Loader2,
  XCircle,
} from "lucide-react";
import { PREMIUM_PLAN_PRICE_INR } from "../lib/data";

interface PremiumFeature {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FEATURES: PremiumFeature[] = [
  {
    icon: ShieldCheck,
    title: "AI Fraud Detection",
    description:
      "Every claim is screened by the AI risk engine before it reaches a vote, flagging duplicate receipts and suspicious patterns instantly.",
  },
  {
    icon: BellOff,
    title: "Ad-Free Experience",
    description: "A clean, distraction-free Gullak Circle — no banners, no sponsored nudges, ever.",
  },
  {
    icon: LayoutGrid,
    title: "Multi-Circle Management Dashboard",
    description: "Track every circle you're part of from one screen, instead of switching between them one at a time.",
  },
  {
    icon: LineChart,
    title: "Advanced Contribution Analytics",
    description: "Deeper trendlines, category breakdowns, and month-over-month comparisons for your savings pool.",
  },
];

interface PremiumPageProps {
  isPremium: boolean;
  premiumSince?: string;
  onUpgrade: () => Promise<void> | void;
  onCancel?: () => Promise<void> | void;
}

export const PremiumPage: React.FC<PremiumPageProps> = ({
  isPremium,
  premiumSince,
  onUpgrade,
  onCancel,
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [localError, setLocalError] = React.useState("");

  const handleUpgradeClick = async () => {
    if (isProcessing || isPremium) return;
    setLocalError("");
    setIsProcessing(true);
    try {
      await onUpgrade();
    } catch (err: any) {
      setLocalError(err?.message || "Couldn't complete the upgrade. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelClick = async () => {
    if (isProcessing || !isPremium || !onCancel) return;
    setLocalError("");
    setIsProcessing(true);
    try {
      await onCancel();
    } catch (err: any) {
      setLocalError(err?.message || "Couldn't cancel your plan. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-6 md:p-10 bg-gradient-to-br from-matte-charcoal via-matte-black to-matte-charcoal text-white border border-gold-500/15 shadow-xl shadow-gold-500/5 text-center"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gold-500 flex items-center justify-center text-matte-black shadow-lg shadow-gold-500/30">
            <Crown className="w-7 h-7" />
          </div>

          {isPremium ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-500 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> You're on Premium
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/25 text-gold-500 text-xs font-bold uppercase tracking-wider">
              Gullak Circle Premium
            </span>
          )}

          <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-100 max-w-xl">
            {isPremium ? "Thanks for backing your circle." : "Give your circle a smarter, ad-free upgrade."}
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-lg leading-relaxed">
            {isPremium
              ? `Premium since ${premiumSince ? new Date(premiumSince).toLocaleDateString() : "today"}. You have full access to every premium feature below.`
              : "Sharper fraud protection, zero ads, and analytics built for people who actually watch their pool grow."}
          </p>

          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-4xl md:text-5xl font-bold text-gold-500 font-mono">
              ₹{PREMIUM_PLAN_PRICE_INR}
            </span>
            <span className="text-slate-400 text-sm">/ month, per user</span>
          </div>

          {!isPremium ? (
            <button
              onClick={handleUpgradeClick}
              disabled={isProcessing}
              className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-500 text-matte-black font-bold text-sm shadow-lg shadow-gold-500/20 hover:bg-gold-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4" /> Upgrade for ₹{PREMIUM_PLAN_PRICE_INR}/month
                </>
              )}
            </button>
          ) : (
            onCancel && (
              <button
                onClick={handleCancelClick}
                disabled={isProcessing}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gold-500/20 text-slate-300 hover:text-slate-100 hover:bg-matte-charcoal font-semibold text-xs transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" /> Cancel Premium
                  </>
                )}
              </button>
            )
          )}

          {localError && (
            <p className="text-xs font-semibold text-rose-400 mt-1">{localError}</p>
          )}
        </div>
      </motion.div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="p-6 rounded-3xl bg-matte-charcoal border border-gold-500/10 shadow-lg shadow-black/30 relative overflow-hidden"
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-gold-500/10 text-gold-500 rounded-xl border border-gold-500/10 shrink-0">
                <feature.icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-100">{feature.title}</h3>
                  {isPremium && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                      <Check className="w-2.5 h-2.5" /> Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Fine print */}
      <p className="text-center text-[11px] text-slate-500 max-w-md mx-auto leading-relaxed">
        Billed monthly per user at ₹{PREMIUM_PLAN_PRICE_INR}. Cancel anytime — your circle's pool and history are
        never affected by your premium status.
      </p>
    </div>
  );
};
