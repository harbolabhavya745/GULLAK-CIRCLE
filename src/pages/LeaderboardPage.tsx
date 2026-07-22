import React, { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Crown, Medal, TrendingUp, IndianRupee } from "lucide-react";
import { Member } from "../types";

interface LeaderboardPageProps {
  members: Member[];
  currentUserId?: string;
  onViewMember?: (id: string, name: string, avatar: string) => void;
}

const RANK_STYLES = [
  { ring: "ring-2 ring-yellow-400/60", badge: "bg-yellow-400 text-matte-black", icon: Crown },
  { ring: "ring-2 ring-slate-300/40", badge: "bg-slate-300 text-matte-black", icon: Medal },
  { ring: "ring-2 ring-amber-700/50", badge: "bg-amber-700 text-white", icon: Medal },
];

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ members, currentUserId, onViewMember }) => {
  const ranked = useMemo(() => {
    return [...members].sort((a, b) =>
      b.score - a.score || b.totalContributed - a.totalContributed
    );
  }, [members]);

  const topScore = ranked.length > 0 ? Math.max(...ranked.map((m) => m.score)) : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-gold-500" />
            Leaderboard
          </h2>
          <p className="text-xs text-slate-500 mt-1">Ranked live by contribution — score updates as members deposit</p>
        </div>
      </div>

      {/* Ranked list */}
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {ranked.map((member, idx) => {
            const rankStyle = RANK_STYLES[idx];
            const isMe = member.id === currentUserId;
            const barWidth = topScore > 0 ? Math.max(6, (member.score / 100) * 100) : 0;

            return (
              <motion.div
                layout
                key={member.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={`p-5 rounded-3xl bg-matte-charcoal border ${
                  isMe ? "border-gold-500/40" : "border-gold-500/10"
                } shadow-sm flex flex-col sm:flex-row sm:items-center gap-4`}
              >
                {/* Rank + Avatar */}
                <div className="flex items-center gap-4 min-w-[220px]">
                  <div
                    className={`relative flex items-center justify-center w-10 h-10 rounded-2xl font-mono font-bold text-sm ${
                      rankStyle ? rankStyle.badge : "bg-matte-black text-slate-400 border border-gold-500/10"
                    }`}
                  >
                    {rankStyle ? <rankStyle.icon className="w-4.5 h-4.5" /> : idx + 1}
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => onViewMember?.(member.id, member.name, member.avatar)}
                      aria-label={`View ${member.name}'s profile`}
                      className={`block rounded-2xl ${onViewMember ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
                    >
                      <img
                        src={member.avatar}
                        alt={member.name}
                        referrerPolicy="no-referrer"
                        className={`w-11 h-11 rounded-2xl object-cover border border-gold-500/10 ${rankStyle ? rankStyle.ring : ""}`}
                      />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-200">{member.name}</h4>
                      {isMe && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gold-500/15 text-gold-500 border border-gold-500/20">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500">{member.badge}</span>
                  </div>
                </div>

                {/* Score bar */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase">
                    <span>Contribution Score</span>
                    <span className="text-gold-500 font-bold">{member.score}/100</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-matte-black overflow-hidden border border-gold-500/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-gold-500"
                    />
                  </div>
                </div>

                {/* Amount */}
                <div className="flex items-center gap-1.5 text-right sm:min-w-[110px] justify-end">
                  <IndianRupee className="w-3.5 h-3.5 text-gold-500/70" />
                  <span className="text-sm font-bold text-gold-500 font-mono">
                    {member.totalContributed.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {ranked.length === 0 && (
          <div className="p-8 rounded-3xl bg-matte-charcoal border border-gold-500/10 text-center text-xs text-slate-500 font-mono">
            No members yet — invite friends to start the leaderboard.
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono px-1">
        <TrendingUp className="w-3.5 h-3.5 text-gold-500/60" />
        Score = 60% share vs. top contributor + 40% share vs. circle average. Recalculates on every deposit.
      </div>
    </div>
  );
};
