import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Award, IndianRupee, FileCheck2, UserX, Pencil } from "lucide-react";
import { Member, Claim } from "../types";

interface MemberProfileModalProps {
  isOpen: boolean;
  member: Member | null | undefined;
  fallbackName?: string;
  fallbackAvatar?: string;
  isCurrentUser?: boolean;
  claims?: Claim[];
  onClose: () => void;
  onViewFullProfile?: () => void;
}

const scoreLabel = (score: number) => {
  if (score >= 90) return "Excellent Standing";
  if (score >= 70) return "Good Standing";
  if (score >= 40) return "Fair Standing";
  return "Building Trust";
};

const scoreColorClass = (score: number) => {
  if (score >= 90) return "text-gold-500";
  if (score >= 70) return "text-slate-300";
  if (score >= 40) return "text-amber-500";
  return "text-red-500";
};

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  isOpen,
  member,
  fallbackName,
  fallbackAvatar,
  isCurrentUser = false,
  claims = [],
  onClose,
  onViewFullProfile,
}) => {
  const name = member?.name || fallbackName || "Member";
  const avatar =
    member?.avatar ||
    fallbackAvatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

  const memberClaims = member ? claims.filter((c) => c.claimantId === member.id) : [];
  const approvedClaims = memberClaims.filter((c) => c.status === "Approved").length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="member-profile-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-matte-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            key="member-profile-panel"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-matte-charcoal border border-gold-500/15 shadow-2xl overflow-hidden"
          >
            <div className="p-6 space-y-6 relative">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Identity */}
              <div className="flex flex-col items-center text-center gap-3 pt-2">
                <div className="relative p-0.5 rounded-[22px] bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 shadow-lg shadow-gold-500/15">
                  <img
                    src={avatar}
                    alt={name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-[20px] object-cover"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-center gap-1.5">
                    <h3 className="text-lg font-bold text-slate-100 font-heading">{name}</h3>
                    {isCurrentUser && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gold-500/15 text-gold-500 border border-gold-500/20">
                        YOU
                      </span>
                    )}
                  </div>
                  {member && (
                    <span className="inline-block px-2.5 py-0.5 bg-gold-500/10 text-gold-500 text-[9px] font-bold rounded-full border border-gold-500/35 font-mono uppercase tracking-wider">
                      {member.role}
                    </span>
                  )}
                </div>
              </div>

              {member ? (
                <>
                  {/* Badge + score */}
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gold-500/5 text-gold-500 text-[10px] font-medium rounded-full border border-gold-500/15">
                      <Award className="w-3 h-3 text-gold-500/80" /> {member.badge}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-matte-black/45 border border-gold-500/15 shadow-inner space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                        Contribution Score
                      </span>
                      <span className={`text-xs font-bold font-mono ${scoreColorClass(member.score)}`}>
                        {member.score}/100
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-matte-black overflow-hidden border border-gold-500/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(6, member.score)}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-gold-500"
                      />
                    </div>
                    <p className={`text-xs font-semibold ${scoreColorClass(member.score)}`}>
                      {scoreLabel(member.score)}
                    </p>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-matte-black/45 border border-gold-500/15 text-center space-y-1">
                      <div className="flex items-center justify-center gap-1 text-gold-500">
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span className="text-base font-bold font-mono">
                          {member.totalContributed.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">
                        Total Contributed
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-matte-black/45 border border-gold-500/15 text-center space-y-1">
                      <div className="flex items-center justify-center gap-1 text-gold-500">
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span className="text-base font-bold font-mono">{approvedClaims}</span>
                      </div>
                      <p className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">
                        Claims Approved
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-2xl bg-matte-black/45 border border-gold-500/15 flex items-center gap-3">
                  <div className="p-2 bg-slate-500/10 rounded-xl text-slate-400 border border-slate-500/15">
                    <UserX className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This person is no longer a member of the circle, so their live stats aren't available.
                  </p>
                </div>
              )}

              {isCurrentUser && onViewFullProfile && (
                <button
                  type="button"
                  onClick={onViewFullProfile}
                  className="w-full py-2.5 bg-gold-500 hover:bg-gold-400 text-matte-black font-bold rounded-2xl transition-all duration-300 text-xs font-mono uppercase tracking-wider shadow-lg shadow-gold-500/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit Your Full Profile
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
