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
  Users,
  LogOut,
  AlertTriangle,
  Camera,
  Pencil,
  Check
} from "lucide-react";
import { Member, Claim, Transaction } from "../types";

interface ProfilePageProps {
  claims: Claim[];
  poolBalance: number;
  profile: any;
  myMember?: Member;
  email?: string;
  myTransactions?: Transaction[];
  memberCount?: number;
  onLeaveCircle?: () => Promise<void> | void;
  leaveCircleError?: string;
  onUpdateAvatar?: (file: File) => Promise<void> | void;
  avatarUploadError?: string;
  onUpdateName?: (name: string) => Promise<void> | void;
  nameUpdateError?: string;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ claims, poolBalance, profile, myMember, email, myTransactions = [], memberCount = 0, onLeaveCircle, leaveCircleError = "", onUpdateAvatar, avatarUploadError = "", onUpdateName, nameUpdateError = "" }) => {
  const [showFastTrackInfo, setShowFastTrackInfo] = React.useState(false);
  const [showLeaveModal, setShowLeaveModal] = React.useState(false);
  const [isLeaving, setIsLeaving] = React.useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
  const [localAvatarError, setLocalAvatarError] = React.useState("");
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const [isEditingName, setIsEditingName] = React.useState(false);
  const [nameDraft, setNameDraft] = React.useState("");
  const [isSavingName, setIsSavingName] = React.useState(false);
  const [localNameError, setLocalNameError] = React.useState("");
  const nameInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    if (isUploadingAvatar) return;
    avatarInputRef.current?.click();
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setLocalAvatarError("");

    if (!file.type.startsWith("image/")) {
      setLocalAvatarError("Please choose an image file.");
      return;
    }
    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setLocalAvatarError(`Image must be smaller than ${MAX_SIZE_MB}MB.`);
      return;
    }
    if (!onUpdateAvatar) return;

    setIsUploadingAvatar(true);
    try {
      await onUpdateAvatar(file);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleStartEditName = () => {
    setNameDraft(profile?.name || "");
    setLocalNameError("");
    setIsEditingName(true);
    // Focus after the input mounts
    setTimeout(() => nameInputRef.current?.focus(), 0);
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setLocalNameError("");
  };

  const handleSaveName = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setLocalNameError("Name can't be empty.");
      return;
    }
    if (trimmed.length > 40) {
      setLocalNameError("Name must be 40 characters or fewer.");
      return;
    }
    if (!onUpdateName) {
      setIsEditingName(false);
      return;
    }
    setLocalNameError("");
    setIsSavingName(true);
    try {
      await onUpdateName(trimmed);
      setIsEditingName(false);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveName();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelEditName();
    }
  };

  const handleConfirmLeave = async () => {
    if (!onLeaveCircle) return;
    setIsLeaving(true);
    await onLeaveCircle();
    setIsLeaving(false);
    setShowLeaveModal(false);
  };

  const user = {
    name: profile?.name || "Loading...",
    role: profile?.role || "Member",
    avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile?.name || "U")}`,
    // profiles.score / profiles.total_contributed are never written to (RLS
    // blocks a user from updating other members' rows when scores get
    // recalculated), so read the live values computed from all transactions
    // in fetchMembers instead — same source of truth as the Leaderboard.
    score: myMember?.score ?? profile?.score ?? 0,
    totalContributed: Number(myMember?.totalContributed ?? profile?.total_contributed ?? 0),
    badge: profile?.badge || "New Member",
    email: email || "",
    joinedDate: profile?.created_at
      ? new Date(profile.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
      : ""
  };

  const myClaims = claims.filter(c => c.claimantId === profile?.id);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header and User Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 md:p-8 rounded-3xl bg-matte-charcoal border border-gold-500/15 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
              aria-label="Change profile picture"
              className="relative block p-0.5 rounded-[24px] bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 shadow-xl shadow-gold-500/15 ring-4 ring-gold-500/5 group cursor-pointer disabled:cursor-wait"
            >
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-[22px] object-cover"
              />
              <div className="absolute inset-0.5 rounded-[22px] bg-matte-black/0 group-hover:bg-matte-black/55 flex items-center justify-center transition-all duration-200">
                {isUploadingAvatar ? (
                  <div className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-gold-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                )}
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
            </button>
            {(localAvatarError || avatarUploadError) && (
              <p className="text-[10px] text-red-400 font-mono max-w-[9rem]">{localAvatarError || avatarUploadError}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2.5 items-center justify-center md:justify-start">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    onKeyDown={handleNameKeyDown}
                    disabled={isSavingName}
                    maxLength={40}
                    className="text-xl font-bold text-slate-100 font-sans tracking-tight bg-matte-black border border-gold-500/30 rounded-lg px-2.5 py-1 focus:outline-none focus:border-gold-500/60 disabled:opacity-50 w-48"
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    disabled={isSavingName}
                    aria-label="Save name"
                    className="p-1.5 rounded-lg bg-gold-500/10 text-gold-500 hover:bg-gold-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingName ? (
                      <div className="w-3.5 h-3.5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEditName}
                    disabled={isSavingName}
                    aria-label="Cancel"
                    className="p-1.5 rounded-lg bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 group">
                  <h3 className="text-2xl font-bold text-slate-100 font-sans tracking-tight">{user.name}</h3>
                  <button
                    type="button"
                    onClick={handleStartEditName}
                    aria-label="Change name"
                    className="p-1 rounded-lg text-slate-500 hover:text-gold-500 hover:bg-gold-500/10 transition-colors cursor-pointer opacity-60 group-hover:opacity-100"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <span className="px-2.5 py-0.5 bg-gold-500/10 text-gold-500 text-[9px] font-bold rounded-full border border-gold-500/35 font-mono uppercase tracking-wider">
                {user.role}
              </span>
            </div>
            {(localNameError || nameUpdateError) && (
              <p className="text-[10px] text-red-400 font-mono">{localNameError || nameUpdateError}</p>
            )}
            <p className="text-xs text-slate-400 font-mono">{user.email} • Joined {user.joinedDate}</p>
            
            <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gold-500/5 text-gold-500 text-[10px] font-medium rounded-full border border-gold-500/15">
                <Award className="w-3 h-3 text-gold-500/80" /> {user.badge}
              </span>
              {user.score >= 90 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gold-500/5 text-gold-500 text-[10px] font-medium rounded-full border border-gold-500/15">
                  <span className="text-gold-500 text-xs">★</span> Trusted Pillar
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Contribution Score circular progress display */}
        <div className="flex items-center gap-5 bg-matte-black/45 p-5 rounded-2xl border border-gold-500/15 shadow-inner">
          <div className="text-right space-y-1">
            <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest font-bold">Contribution Score</p>
            <p className="text-base font-bold text-gold-500 font-sans tracking-tight">
              {user.score >= 90 ? "Excellent Standing" : user.score >= 70 ? "Good Standing" : user.score >= 40 ? "Fair Standing" : "Building Trust"}
            </p>
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
            <Coins className="w-4 h-4 text-gold-500" /> Across {myTransactions.length} micro-roundups
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
          <span className="text-xs text-slate-400 font-mono">{user.name}'s Spare Change History</span>
        </div>

        {myTransactions.length === 0 ? (
          <p className="text-xs text-slate-500 font-mono text-center py-6">
            No roundups yet — head to the Roundup Simulator to make your first one.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myTransactions.slice(0, 8).map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm p-4 bg-matte-black rounded-2xl border border-gold-500/5 hover:border-gold-500/10 transition-colors">
                <div>
                  <p className="font-semibold text-slate-200">{item.merchant} swipe roundup</p>
                  <p className="text-xs text-slate-400 font-mono mt-1">{item.timestamp}</p>
                </div>
                <span className="font-mono text-gold-500 font-bold text-base">+₹{item.roundup.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="p-6 md:p-8 rounded-3xl bg-matte-charcoal border border-red-500/15 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-500/10 rounded-xl text-red-400 border border-red-500/15">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-heading">Danger Zone</h3>
            <p className="text-xs text-slate-500 mt-0.5">Leaving forfeits your remaining stake in this circle's pool.</p>
          </div>
        </div>
        <button
          onClick={() => setShowLeaveModal(true)}
          className="px-4 py-2.5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" /> Leave Circle
        </button>
      </div>

      {/* Leave Circle confirmation modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-matte-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-6 rounded-3xl bg-matte-charcoal border border-red-500/25 shadow-xl space-y-6 relative"
          >
            {!isLeaving && (
              <button
                onClick={() => setShowLeaveModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/10 rounded-2xl text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 font-heading">Leave This Circle?</h3>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold mt-0.5">This cannot be undone</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-300">
              <p className="text-xs text-slate-400 leading-relaxed">
                You'll immediately lose access to this circle's dashboard, claims, and member list. Your spare-change contributions already in the pool stay in the shared pool — they aren't refunded when you leave.
              </p>
              {memberCount <= 1 && (
                <div className="p-3 bg-red-500/5 rounded-2xl border border-red-500/15 text-[11px] text-red-300 leading-normal">
                  You're the only member left. Leaving will make this circle inactive for everyone.
                </div>
              )}
              {leaveCircleError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                  {leaveCircleError}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveModal(false)}
                disabled={isLeaving}
                className="flex-1 py-2.5 bg-matte-black border border-gold-500/10 text-slate-300 hover:text-slate-100 font-bold rounded-2xl transition-all duration-300 text-xs font-mono uppercase tracking-wider disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLeave}
                disabled={isLeaving}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 text-matte-black font-bold rounded-2xl transition-all duration-300 text-xs font-mono uppercase tracking-wider shadow-lg shadow-red-500/10 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLeaving ? (
                  <div className="w-4 h-4 border-2 border-matte-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Leave Circle"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
