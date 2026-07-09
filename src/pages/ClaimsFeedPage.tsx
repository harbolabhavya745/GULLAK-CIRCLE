import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown, 
  Download, 
  CreditCard, 
  Award, 
  Clock,
  ShieldCheck,
  ChevronRight,
  Info
} from "lucide-react";
import { Claim, Member } from "../types";

interface ClaimsFeedPageProps {
  claims: Claim[];
  members: Member[];
  currentUserId?: string;
  onVoteClaim: (claimId: string, choice: "yes" | "no") => void;
  onExecutePayout: (claimId: string) => void;
  triggerConfetti: () => void;
  poolBalance: number;
}

export const ClaimsFeedPage: React.FC<ClaimsFeedPageProps> = ({
  claims,
  members,
  currentUserId,
  onVoteClaim,
  onExecutePayout,
  triggerConfetti,
  poolBalance
}) => {
  const [activeTab, setActiveTab] = useState<"Pending" | "Approved" | "Rejected">("Pending");
  const [payoutModalClaim, setPayoutModalClaim] = useState<Claim | null>(null);
  const [payoutAnimationStep, setPayoutAnimationStep] = useState<"processing" | "success">("processing");

  // Filter claims based on selected tab
  const filteredClaims = claims.filter((c) => c.status === activeTab);

  const handleVote = (claimId: string, choice: "yes" | "no") => {
    // Find the claim to check if the new vote triggers approval threshold (> 50%)
    const currentClaim = claims.find(c => c.id === claimId);
    if (!currentClaim) return;

    // Block claimants from voting on their own claim
    if (currentUserId && currentClaim.claimantId === currentUserId) return;

    onVoteClaim(claimId, choice);

    // Simulate standard quorum where total active voters (excluding claimant) is around 5.
    // If YES votes becomes >= 3, let's trigger the Payout modal flow!
    const newYesCount = currentClaim.votesYes + (choice === "yes" ? 1 : 0);
    
    if (choice === "yes" && newYesCount >= 3) {
      // Trigger the celebration confetti
      triggerConfetti();
      
      // Open payout simulation receipt modal automatically to show off!
      setTimeout(() => {
        setPayoutModalClaim({
          ...currentClaim,
          votesYes: newYesCount,
          status: "Approved"
        });
        setPayoutAnimationStep("processing");

        // Transition payout animation after 2.5 seconds
        setTimeout(() => {
          setPayoutAnimationStep("success");
          onExecutePayout(claimId); // update pool balance and status
          triggerConfetti();
        }, 2200);
      }, 800);
    }
  };

  return (
    <div className="space-y-8 pb-12 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Claims Registry & Voting Screen</h2>
          <p className="text-xs text-slate-500 mt-1">Review, vet and cast ballots on active group emergency coverage requests</p>
        </div>

        {/* Filters/Tabs */}
        <div className="inline-flex p-1 bg-matte-charcoal rounded-2xl border border-gold-500/10">
          {(["Pending", "Approved", "Rejected"] as const).map((tab) => {
            const count = claims.filter((c) => c.status === tab).length;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-gold-500 text-matte-black shadow-md shadow-gold-500/10"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab}
                <span className={`px-1.5 py-0.2 text-[10px] rounded font-bold ${
                  isActive 
                    ? "bg-matte-black/20 text-matte-black" 
                    : "bg-matte-black text-slate-400 border border-gold-500/5"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Claims List */}
      {filteredClaims.length === 0 ? (
        <div className="p-12 text-center bg-matte-charcoal border border-gold-500/10 rounded-3xl space-y-4">
          <AlertCircle className="w-12 h-12 text-gold-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No {activeTab} Claims Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Everything is safe! There are currently no emergency claims categorized under "{activeTab}" inside Gullak Circle.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredClaims.map((claim) => {
            const approvalPercent = Math.min(((claim.votesYes) / 3) * 100, 100);
            const userHasVoted = currentUserId && claim.votedMembers[currentUserId] !== undefined;
            const isClaimant = currentUserId === claim.claimantId;

            return (
              <motion.div
                key={claim.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-3xl bg-matte-charcoal border border-gold-500/10 shadow-sm flex flex-col justify-between gap-6 relative"
              >
                {/* Top header line */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={claim.claimantAvatar}
                      alt={claim.claimantName}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-xl object-cover border border-gold-500/15"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">{claim.claimantName}</h4>
                      <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gold-500" /> Submitted {claim.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] font-mono font-bold text-slate-500 tracking-wider">REQUESTED AID</span>
                    <p className="text-lg font-bold font-heading text-gold-500 mt-0.5">
                      ₹{claim.amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Claim Context details */}
                <div className="space-y-2">
                  <h5 className="text-sm font-bold text-slate-100">{claim.reason}</h5>
                  <p className="text-xs text-slate-400 leading-relaxed">{claim.description}</p>
                </div>

                {/* AI FRAUD RISK BADGE SCREEN */}
                <div className="p-4 rounded-2xl bg-matte-black border border-gold-500/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-gold-500" /> Gullak AI Guard Vetting
                    </span>

                    {/* Badge */}
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                      claim.aiRiskLabel === "Looks Legitimate" ? "bg-gold-500/10 text-gold-500 border border-gold-500/25" :
                      claim.aiRiskLabel === "Needs Review" ? "bg-amber-500/10 text-amber-500 border border-amber-500/25" :
                      "bg-red-500/10 text-red-500 border border-red-500/25"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        claim.aiRiskLabel === "Looks Legitimate" ? "bg-gold-500" :
                        claim.aiRiskLabel === "Needs Review" ? "bg-amber-500" :
                        "bg-red-500"
                      }`} />
                      {claim.aiRiskLabel} • {claim.aiRiskConfidence}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-normal italic font-medium">
                    "{claim.aiRiskReason}"
                  </p>
                </div>

                {/* Approval Progress Metrics */}
                {claim.status === "Pending" && (
                  <div className="space-y-2 pt-2 border-t border-gold-500/10">
                    <div className="flex justify-between text-xs text-slate-500 font-mono">
                      <span>Approval Progress (Needs 3 YES Votes)</span>
                      <span className="font-bold text-gold-500">{claim.votesYes} / 3 Votes</span>
                    </div>
                    <div className="w-full h-1.5 bg-matte-black rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gold-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${approvalPercent}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}

                {/* Voting Actions */}
                {claim.status === "Pending" && (
                  <div className="pt-3 border-t border-gold-500/10 flex items-center justify-between gap-4">
                    {isClaimant ? (
                      <span className="text-xs text-slate-500 italic flex items-center gap-1">
                        <Info className="w-4 h-4 text-gold-500/50" /> You can't vote on your own claim
                      </span>
                    ) : userHasVoted ? (
                      <span className="text-xs text-slate-500 italic flex items-center gap-1">
                        <Info className="w-4 h-4 text-gold-500/50" /> You casted ballot: {currentUserId ? claim.votedMembers[currentUserId]?.toUpperCase() : ""}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 font-medium">Cast trust ballot:</span>
                    )}

                    {!isClaimant && (
                      <div className="flex gap-2">
                        <button
                          disabled={userHasVoted}
                          onClick={() => handleVote(claim.id, "no")}
                          className="px-4 py-2 bg-red-500/5 hover:bg-red-500/10 border border-red-500/15 text-red-500 text-xs font-bold rounded-xl flex items-center gap-1.5 disabled:opacity-40 transition-all cursor-pointer"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" /> No ({claim.votesNo})
                        </button>
                        <button
                          disabled={userHasVoted}
                          onClick={() => handleVote(claim.id, "yes")}
                          className="px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-matte-black text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-gold-500/10 disabled:opacity-40 transition-all cursor-pointer"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" /> Yes ({claim.votesYes})
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Approved/Rejected Header status indicator labels */}
                {claim.status !== "Pending" && (
                  <div className="pt-4 border-t border-gold-500/10 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Group Decision Result:</span>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 ${
                      claim.status === "Approved" ? "bg-gold-500/10 text-gold-500 border border-gold-500/20" : "bg-red-500/10 text-red-500 border border-red-500/25"
                    }`}>
                      {claim.status === "Approved" ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-gold-500" /> Paid Successfully
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-500" /> Rejected Claim
                        </>
                      )}
                    </span>
                  </div>
                )}

              </motion.div>
            );
          })}
        </div>
      )}

      {/* Payout & Receipt Simulation Modal */}
      <AnimatePresence>
        {payoutModalClaim && (
          <div className="fixed inset-0 bg-matte-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="w-full max-w-lg bg-matte-charcoal rounded-3xl border border-gold-500/15 shadow-2xl p-6 relative overflow-hidden"
            >
              
              {payoutAnimationStep === "processing" ? (
                <div className="text-center py-10 space-y-6">
                  {/* Processing Transfer Loader */}
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 border-4 border-gold-500/10 rounded-full" />
                    <div className="absolute inset-0 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
                    <CreditCard className="w-8 h-8 text-gold-500 absolute inset-0 m-auto animate-pulse" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-100">Processing Circle Payout...</h3>
                    <p className="text-xs text-slate-400">Withdrawing ₹{payoutModalClaim.amount.toLocaleString()} from mutual Gullak pool</p>
                  </div>

                  {/* Pool balance countdown preview */}
                  <div className="p-4 rounded-2xl bg-matte-black border border-gold-500/10 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono">Gullak Pool:</span>
                    <div className="font-mono flex items-center gap-1.5">
                      <span className="line-through text-slate-500">₹{poolBalance.toLocaleString()}</span>
                      <ChevronRight className="w-3 h-3 text-gold-500" />
                      <span className="font-bold text-gold-500">₹{(poolBalance - payoutModalClaim.amount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Payout Complete Success Header */}
                  <div className="text-center space-y-2">
                    <div className="w-14 h-14 bg-gold-500/10 text-gold-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-gold-500/10">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-100">Paid Successfully!</h3>
                    <p className="text-xs text-slate-400">Funds have been released instantly under democratic consent.</p>
                  </div>

                  {/* Complete High Fidelity Receipt UI */}
                  <div className="p-6 rounded-2xl bg-matte-black border border-gold-500/10 space-y-4 font-sans text-xs">
                    <div className="flex justify-between border-b border-gold-500/10 pb-3">
                      <span className="text-slate-500 font-mono text-[9px] tracking-wider">TRANSACTION RECEIPT</span>
                      <span className="text-slate-500 font-mono">ID: #{payoutModalClaim.id.toUpperCase()}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 text-slate-300">
                      <div>
                        <p className="text-slate-500 uppercase font-mono text-[8px] tracking-wider">RECIPIENT</p>
                        <p className="font-bold text-slate-200 mt-0.5">{payoutModalClaim.claimantName}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-slate-500 uppercase font-mono text-[8px] tracking-wider">DISBURSED AMOUNT</p>
                        <p className="font-bold text-gold-500 font-mono text-sm mt-0.5">₹{payoutModalClaim.amount.toLocaleString()}</p>
                      </div>

                      <div>
                        <p className="text-slate-500 uppercase font-mono text-[8px] tracking-wider">APPROVAL METHOD</p>
                        <p className="font-semibold text-slate-200 mt-0.5">Community Ballot (3-0)</p>
                      </div>

                      <div className="text-right">
                        <p className="text-slate-500 uppercase font-mono text-[8px] tracking-wider">TX HASH</p>
                        <p className="font-mono text-slate-400 mt-0.5 text-[10px]">0x7c9bc3d89...1b23</p>
                      </div>
                    </div>

                    <div className="border-t border-gold-500/10 pt-3 flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 italic">Gullak Circle Mutual Guarantee</span>
                      <button className="px-2.5 py-1 rounded bg-matte-charcoal border border-gold-500/10 hover:bg-gold-500/5 text-[10px] font-bold text-gold-500 flex items-center gap-1 cursor-pointer">
                        <Download className="w-3 h-3" /> PDF Receipt
                      </button>
                    </div>
                  </div>

                  {/* Close button */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setPayoutModalClaim(null)}
                      className="px-6 py-2.5 bg-gold-500 hover:bg-gold-400 text-matte-black font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-gold-500/10 cursor-pointer"
                    >
                      Done
                    </button>
                  </div>

                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
