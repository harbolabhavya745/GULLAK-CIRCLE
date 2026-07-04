import React from "react";
import { motion } from "motion/react";
import { 
  Award, 
  Coins, 
  CheckCircle, 
  ArrowUpRight, 
  Flame, 
  Heart,
  TrendingUp,
  Settings,
  History,
  Zap,
  Info,
  X,
  Wallet,
  Shield,
  Users
} from "lucide-react";
import { Member, Claim } from "../types";

interface ProfilePageProps {
  claims: Claim[];
  poolBalance: number;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ claims, poolBalance }) => {
  const [showFastTrackInfo, setShowFastTrackInfo] = React.useState(false);

  // Current user representation: Arjun Mehta
  const user = {
    name: "Arjun Mehta",
    role: "Circle Founder",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    score: 96,
    totalContributed: 2450,
    badge: "Top Contributor",
    email: "arjun.mehta@gmail.com",
    joinedDate: "March 12, 2026"
  };

  // Filter claims requested by Arjun (none in the mock data, but let's show an empty state or let him see his logs)
  const myClaims = claims.filter(c => c.claimantName === user.name);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header and User Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 md:p-8 rounded-3xl bg-matte-charcoal border border-gold-500/15 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="relative p-0.5 rounded-[24px] bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 shadow-xl shadow-gold-500/15 ring-4 ring-gold-500/5">
            <img
              src={user.avatar}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-[22px] object-cover"
            />
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2.5 items-center justify-center md:justify-start">
              <h3 className="text-2xl font-bold text-slate-100 font-sans tracking-tight">{user.name}</h3>
              <span className="px-2.5 py-0.5 bg-gold-500/10 text-gold-500 text-[9px] font-bold rounded-full border border-gold-500/35 font-mono uppercase tracking-wider">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">{user.email} • Joined {user.joinedDate}</p>
            
            {/* Added back premium badges as shown in the image */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gold-500/5 text-gold-500 text-[10px] font-medium rounded-full border border-gold-500/15">
                <Award className="w-3 h-3 text-gold-500/80" /> Top Contributor
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gold-500/5 text-gold-500 text-[10px] font-medium rounded-full border border-gold-500/15">
                <span className="text-gold-500 text-xs">★</span> Trusted Pillar
              </span>
            </div>
          </div>
        </div>

        {/* Contribution Score circular progress display */}
        <div className="flex items-center gap-5 bg-matte-black/45 p-5 rounded-2xl border border-gold-500/15 shadow-inner">
          <div className="text-right space-y-1">
            <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest font-bold">Contribution Score</p>
            <p className="text-base font-bold text-gold-500 font-sans tracking-tight">Excellent Standing</p>
          </div>
          
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full rotate-[-90deg]">
              <circle
                cx="40"
                cy="40"
                r="30"
                className="stroke-matte-black"
                strokeWidth="4.5"
                fill="transparent"
              />
              <motion.circle
                cx="40"
                cy="40"
                r="30"
                stroke="#D4AF37"
                strokeWidth="4.5"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 30}
                initial={{ strokeDashoffset: 2 * Math.PI * 30 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 30 - (user.score / 100) * 2 * Math.PI * 30 }}
                transition={{ duration: 1.2 }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-lg font-bold tracking-tight text-gold-500 leading-none">{user.score}</span>
              <span className="text-[9px] text-slate-500 font-mono leading-none mt-1">/ 100</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Stat 1 */}
        <div className="p-6 rounded-3xl bg-matte-charcoal border border-gold-500/15 shadow-sm relative overflow-hidden group hover:border-gold-500/30 transition-all duration-300">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 bg-gold-500/10 rounded-xl text-gold-500 border border-gold-500/15">
              <Wallet className="w-5 h-5" />
            </div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">My Spare-Change Deposits</p>
          </div>
          <h4 className="text-3xl font-bold text-slate-100 font-heading tracking-tight">₹{user.totalContributed.toLocaleString()}</h4>
          <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-gold-500" /> Across 152 micro-roundups
          </p>

          {/* Elegant Piggy Bank Watermark */}
          <svg 
            className="absolute -bottom-3 -right-3 w-28 h-28 text-gold-500/5 stroke-current fill-none pointer-events-none group-hover:text-gold-500/10 transition-colors duration-300" 
            viewBox="0 0 24 24" 
            strokeWidth="1" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M19 5c-1.5 0-2.8 1.4-3 3-1.2-1-2.8-1.5-4.5-1.5C6.8 6.5 3 10 3 14.5c0 1.5.5 2.8 1.5 3.5.3.2.5.5.5.8v1.7c0 .8.7 1.5 1.5 1.5h1c.8 0 1.5-.7 1.5-1.5V19h6v1.5c0 .8.7 1.5 1.5 1.5h1c.8 0 1.5-.7 1.5-1.5V19c1.5 0 2.5-1 2.5-2.5h1.5c.8 0 1.5-.7 1.5-1.5v-1c0-1.5-1.5-2.5-3-2.5.2-1.6-.1-3-1.5-4 .2-1.6-.5-3.5-2-3.5z" />
            <circle cx="16" cy="11" r="1" />
            <path d="M12 5V3a1 1 0 0 0-1-1H9.5" />
          </svg>
        </div>

        {/* Stat 2 */}
        <div 
          onClick={() => setShowFastTrackInfo(true)}
          className="p-6 rounded-3xl bg-matte-charcoal border border-gold-500/15 shadow-sm relative overflow-hidden group hover:border-gold-500/30 transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center">
              <p className="text-xs font-mono text-gold-500 uppercase tracking-wider font-bold">Fast Track Approval</p>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 bg-gold-500/15 text-gold-500 border border-gold-500/30 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse"></span>
                Eligible
              </span>
            </div>
            
            <div className="mt-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-500/5 border border-gold-500/30 flex items-center justify-center text-gold-500 shadow-lg shadow-gold-500/10">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-100 font-heading">Expedited Claims</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5"><span className="text-gold-500 font-bold">1 fewer</span> approval required</p>
              </div>
            </div>

            <div className="border-t border-gold-500/10 my-4" />

            <p className="text-xs text-slate-400 leading-relaxed">
              Trusted contributors qualify for expedited claim approval on emergency requests.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-gold-500/5 flex justify-between items-center text-[10px]">
            <span className="text-gold-500 font-mono flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              Click to view details
            </span>
            <span className="text-slate-500 font-mono font-semibold flex items-center gap-1.5">
              Normal: 3 <Users className="w-3.5 h-3.5 text-slate-600 inline" /> • Trusted: 2 <Users className="w-3.5 h-3.5 text-gold-500/55 inline" />
            </span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="p-6 rounded-3xl bg-matte-charcoal border border-gold-500/15 shadow-sm relative overflow-hidden group hover:border-gold-500/30 transition-all duration-300">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 bg-gold-500/10 rounded-xl text-gold-500 border border-gold-500/15">
              <Shield className="w-5 h-5" />
            </div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">Active Claims Lodged</p>
          </div>
          <h4 className="text-3xl font-bold text-slate-100 font-heading tracking-tight">{myClaims.length} Request</h4>
          <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-gold-500" /> Fully secure, no emergency claims
          </p>

          {/* Elegant Shield Watermark */}
          <svg 
            className="absolute -bottom-3 -right-3 w-28 h-28 text-gold-500/5 stroke-current fill-none pointer-events-none group-hover:text-gold-500/10 transition-colors duration-300" 
            viewBox="0 0 24 24" 
            strokeWidth="1" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>

      </div>

      {/* Recent Personal History Timeline */}
      <div className="p-6 md:p-8 rounded-3xl bg-matte-charcoal border border-gold-500/10 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider font-heading">Contribution History</h3>
          <span className="text-xs text-slate-400 font-mono">Arjun's Spare Change History</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { desc: "Starbucks Coffee swipe roundup", amount: "+₹7.50", date: "Today" },
            { desc: "Uber Rides swipe roundup", amount: "+₹5.80", date: "Yesterday" },
            { desc: "Swiggy Delivery swipe roundup", amount: "+₹10.90", date: "2 days ago" },
            { desc: "Weekly automatic circle booster", amount: "+₹50.00", date: "Last week" }
          ].map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm p-4 bg-matte-black rounded-2xl border border-gold-500/5 hover:border-gold-500/10 transition-colors">
              <div>
                <p className="font-semibold text-slate-200">{item.desc}</p>
                <p className="text-xs text-slate-400 font-mono mt-1">{item.date}</p>
              </div>
              <span className="font-mono text-gold-500 font-bold text-base">{item.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Fast Track Approval detailed info modal */}
      {showFastTrackInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-matte-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-6 rounded-3xl bg-matte-charcoal border border-gold-500/20 shadow-xl space-y-6 relative"
          >
            <button 
              onClick={() => setShowFastTrackInfo(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-gold-500/10 rounded-2xl text-gold-500">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 font-heading">Fast Track Approval</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-gold-500 animate-ping" />
                  <span className="text-[10px] font-mono text-gold-500 uppercase tracking-widest font-bold">✅ Status: Eligible</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <p className="text-xs text-slate-400 italic">
                Trusted contributors qualify for expedited claim approval.
              </p>

              <div className="p-4 bg-matte-black rounded-2xl border border-gold-500/5 space-y-3">
                <h4 className="text-xs font-mono text-gold-500 uppercase tracking-wider font-bold">Expedited Benefit</h4>
                <p className="text-xs leading-relaxed text-slate-300">
                  When an eligible member files an emergency claim, it requires <strong>one fewer approval vote</strong> than a standard claim.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1 text-center">
                  <div className="p-2 bg-matte-charcoal rounded-xl border border-gold-500/5">
                    <p className="text-slate-500">Normal Member</p>
                    <p className="text-slate-300 font-bold mt-0.5">3 Approvals</p>
                  </div>
                  <div className="p-2 bg-matte-charcoal rounded-xl border border-gold-500/10 text-gold-500 font-bold">
                    <p className="text-slate-400 font-normal">Trusted Member</p>
                    <p className="mt-0.5">2 Approvals</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-mono text-gold-500 uppercase tracking-wider font-bold">How Eligibility is Earned</h4>
                <p className="text-xs text-slate-400">
                  Fast Track Approval is earned through consistent, positive participation in the circle. It depends on:
                </p>
                <ul className="text-xs space-y-1.5 pl-2 border-l border-gold-500/20 text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-gold-500" /> High Contribution Score
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-gold-500" /> Active voting participation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-gold-500" /> Positive community trust
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-gold-500" /> No history of fraudulent claims
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-gold-500/5 rounded-2xl border border-gold-500/10 text-[11px] text-slate-400 leading-normal">
                <strong>Fair Voting Policy:</strong> Every member has one equal vote. Trusted members simply qualify for a reduced approval threshold when filing genuine emergency claims.
              </div>
            </div>

            <button
              onClick={() => setShowFastTrackInfo(false)}
              className="w-full py-2.5 bg-gold-500 hover:bg-gold-400 text-matte-black font-bold rounded-2xl transition-all duration-300 text-xs font-mono uppercase tracking-wider shadow-lg shadow-gold-500/10"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

    </div>
  );
};
