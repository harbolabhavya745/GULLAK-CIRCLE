import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "./lib/supabase";
import {
  ensureProfile,
  updateAvatar,
  updateName,
  submitClaimWithAiCheck,
  uploadClaimReceipt,
  updateMilestone,
  updateCircleName,
  fetchMyCircleId,
  createCircle,
  joinCircleByInviteCode,
  fetchCircle,
  fetchMembers,
  fetchTransactions,
  fetchClaims,
  computePoolStats,
} from "./lib/data";
import { Member, Transaction, Claim, NotificationItem } from "./types";

import { LoginPage } from "./pages/LoginPage";
import { CircleSetupPage } from "./pages/CircleSetupPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CircleDetailsPage } from "./pages/CircleDetailsPage";
import { RoundupSimulatorPage } from "./pages/RoundupSimulatorPage";
import { ClaimSubmissionPage } from "./pages/ClaimSubmissionPage";
import { ClaimsFeedPage } from "./pages/ClaimsFeedPage";
import { ProfilePage } from "./pages/ProfilePage";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { NotificationPanel } from "./components/NotificationPanel";
import { ConfettiEffect } from "./components/ConfettiEffect";
import { ToastContainer, ToastItem, ToastType } from "./components/Toast";

// Pool of fake merchants/amount ranges the invisible auto-roundup engine
// picks from — kept outside the component so it's a stable reference.
const AUTO_MERCHANTS: { name: string; min: number; max: number }[] = [
  { name: "Swiggy", min: 120, max: 480 },
  { name: "Zomato", min: 150, max: 550 },
  { name: "Blinkit", min: 80, max: 650 },
  { name: "Zepto", min: 60, max: 400 },
  { name: "Uber", min: 90, max: 350 },
  { name: "Ola", min: 70, max: 300 },
  { name: "BigBasket", min: 300, max: 1400 },
  { name: "Amazon", min: 200, max: 2200 },
  { name: "Starbucks", min: 180, max: 520 },
  { name: "Dominos", min: 250, max: 700 },
  { name: "IRCTC", min: 350, max: 1600 },
  { name: "Local Chai Stall", min: 10, max: 60 },
];

export default function App() {
  const [activePage, setActivePage] = useState<string>("landing");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState<boolean>(false);
  const [confettiTrigger, setConfettiTrigger] = useState<boolean>(false);

  const [poolBalance, setPoolBalance] = useState<number>(0);
  const [milestoneTarget, setMilestoneTarget] = useState<number>(30000);
  const [circleCreatedAt, setCircleCreatedAt] = useState<string | undefined>(undefined);
  const [circleName, setCircleName] = useState<string>("Gullak Circle");
  const [members, setMembers] = useState<Member[]>([]);
  const membersRef = useRef<Member[]>([]);
  useEffect(() => {
    membersRef.current = members;
  }, [members]);
  // Tracks claim ids this client has already broadcast a resolution notification for,
  // so a claim's status settling doesn't fire the toast/notification more than once.
  const notifiedClaimResolutionsRef = useRef<Set<string>>(new Set());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [activeCircleId, setActiveCircleId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [circleChecked, setCircleChecked] = useState(false);

  // Invisible auto-roundup engine — fires realistic-looking transactions on
  // its own so the pool grows without anyone clicking "Simulate". See
  // AUTO_MERCHANTS below for the pool of fake merchant/amount pairs.
  const [autoEngineOn, setAutoEngineOn] = useState<boolean>(false);
  const [lastAutoTx, setLastAutoTx] = useState<{ merchant: string; roundup: number; at: number } | null>(null);
  const autoEngineTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dark mode is permanently enabled (no day/night toggle)
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Get logged in user + make sure a profile row exists for them
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setCurrentUser(data.user);
        try {
          const profile = await ensureProfile(data.user);
          setCurrentProfile(profile);
        } catch (err) {
          console.error("Failed to load/create profile", err);
        }
        setActivePage((prev) => (prev === "landing" ? "dashboard" : prev));
      }
      setAuthChecked(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        try {
          const profile = await ensureProfile(session.user);
          setCurrentProfile(profile);
        } catch (err) {
          console.error("Failed to load/create profile", err);
        }
      } else {
        setCurrentUser(null);
        setCurrentProfile(null);
        setActiveCircleId(null);
        setActivePage("landing");
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  // Find (or wait for) the user's circle
  useEffect(() => {
    if (!currentUser) return;
    setCircleChecked(false);
    fetchMyCircleId(currentUser.id)
      .then((circleId) => setActiveCircleId(circleId))
      .catch((err) => console.error("Failed to look up circle", err))
      .finally(() => setCircleChecked(true));
  }, [currentUser]);

  // Load all circle-scoped data
  const loadCircleData = useCallback(async () => {
    if (!activeCircleId) return;
    try {
      const [circle, memberList, txList, claimList] = await Promise.all([
        fetchCircle(activeCircleId),
        fetchMembers(activeCircleId),
        fetchTransactions(activeCircleId),
        fetchClaims(activeCircleId),
      ]);
      setPoolBalance(Number(circle.pool_balance ?? 0));
      setMilestoneTarget(Number(circle.milestone_target ?? 30000));
      setCircleCreatedAt(circle.created_at);
      setCircleName(circle.name ?? "Gullak Circle");
      setMembers(memberList);
      setTransactions(txList);
      setClaims(claimList);
    } catch (err) {
      console.error("Failed to load circle data", err);
    }
  }, [activeCircleId]);

  useEffect(() => {
    loadCircleData();
  }, [loadCircleData]);

  // Realtime subscriptions, scoped to this circle
  useEffect(() => {
    if (!activeCircleId) return;

    const channel = supabase
      .channel(`circle-updates-${activeCircleId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transactions", filter: `circle_id=eq.${activeCircleId}` },
        () => loadCircleData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "claims", filter: `circle_id=eq.${activeCircleId}` },
        (payload) => {
          const newRow = payload.new as any;
          if (
            payload.eventType === "UPDATE" &&
            newRow?.id &&
            !notifiedClaimResolutionsRef.current.has(newRow.id) &&
            (newRow.status === "Approved" || newRow.status === "Rejected")
          ) {
            notifiedClaimResolutionsRef.current.add(newRow.id);
            const claimant = membersRef.current.find((m) => m.id === newRow.claimant_id);
            const claimantName = claimant?.name || "A member";
            const amount = Number(newRow.amount) || 0;

            if (newRow.status === "Approved") {
              const notif: NotificationItem = {
                id: "notif-" + Date.now(),
                message: `₹${amount.toLocaleString()} was successfully disbursed to ${claimantName}.`,
                time: "Just now",
                type: "system",
                unread: true,
              };
              setNotifications((prev) => [notif, ...prev]);
              showToast(`₹${amount.toLocaleString()} paid out to ${claimantName}.`, "success");
            } else {
              const notif: NotificationItem = {
                id: "notif-" + Date.now(),
                message: `The claim from ${claimantName} was rejected by circle vote.`,
                time: "Just now",
                type: "system",
                unread: true,
              };
              setNotifications((prev) => [notif, ...prev]);
              showToast(`Claim from ${claimantName} was rejected by circle vote.`, "error");
            }
          }
          loadCircleData();
        }
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "votes" }, () => loadCircleData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeCircleId, loadCircleData]);

  // Confetti
  const handleTriggerConfetti = () => {
    setConfettiTrigger(true);
    setTimeout(() => setConfettiTrigger(false), 200);
  };

  // Circle setup handlers
  const handleCreateCircle = async (name: string) => {
    if (!currentUser) return;
    try {
      const circle = await createCircle(name, currentUser.id);
      setActiveCircleId(circle.id);
      showToast(`"${name}" circle created!`, "success");
    } catch (err: any) {
      console.error("Failed to create circle", err);
      showToast(err?.message || "Couldn't create the circle. Please try again.", "error");
    }
  };

  const handleJoinCircle = async (inviteCode: string) => {
    if (!currentUser) return;
    try {
      const circle = await joinCircleByInviteCode(inviteCode, currentUser.id);
      setActiveCircleId(circle.id);
      showToast("You joined the circle!", "success");
    } catch (err: any) {
      console.error("Failed to join circle", err);
      showToast(err?.message || "Couldn't join with that invite code.", "error");
    }
  };

  // 1. Roundup
  const handleSimulateRoundup = async (merchant: string, amount: number, roundup: number) => {
    if (!currentUser || !activeCircleId) return;
    await supabase.from("transactions").insert({
      circle_id: activeCircleId,
      user_id: currentUser.id,
      merchant,
      amount,
      roundup,
      category: "Shopping",
    });
    await supabase
      .from("circles")
      .update({ pool_balance: poolBalance + roundup })
      .eq("id", activeCircleId);
    setPoolBalance((prev) => prev + roundup);
    await loadCircleData();
  };

  // Always call the freshest handleSimulateRoundup from the auto-engine timer
  // below — otherwise the timer's closure would keep using a stale
  // poolBalance from whenever the interval was first set up.
  const handleSimulateRoundupRef = useRef(handleSimulateRoundup);
  useEffect(() => {
    handleSimulateRoundupRef.current = handleSimulateRoundup;
  });

  // Invisible auto-roundup engine: while ON, silently "spends" at a random
  // merchant every ~10-22s and rounds it up — no button, no dialog. This is
  // what makes the pool balance/leaderboard look alive on their own for a
  // demo, standing in for a real bank/UPI feed.
  useEffect(() => {
    if (!autoEngineOn || !currentUser || !activeCircleId) {
      if (autoEngineTimeoutRef.current) clearTimeout(autoEngineTimeoutRef.current);
      return;
    }

    let cancelled = false;

    const scheduleNext = () => {
      const delay = 10000 + Math.random() * 12000; // 10–22s between "purchases"
      autoEngineTimeoutRef.current = setTimeout(async () => {
        if (cancelled) return;
        const pick = AUTO_MERCHANTS[Math.floor(Math.random() * AUTO_MERCHANTS.length)];
        const amount = Math.round((pick.min + Math.random() * (pick.max - pick.min)) * 100) / 100;
        const remainder = amount % 10;
        const roundup = remainder === 0 ? 10 : Math.round((10 - remainder) * 100) / 100;

        await handleSimulateRoundupRef.current(pick.name, amount, roundup);
        if (!cancelled) {
          setLastAutoTx({ merchant: pick.name, roundup, at: Date.now() });
          scheduleNext();
        }
      }, delay);
    };

    scheduleNext();

    return () => {
      cancelled = true;
      if (autoEngineTimeoutRef.current) clearTimeout(autoEngineTimeoutRef.current);
    };
  }, [autoEngineOn, currentUser, activeCircleId]);

  // Secret toggle for the auto-roundup engine — no button, no icon, nothing
  // on screen. Type "gullak" anywhere (as long as you're not typing into a
  // text field) to flip it on/off. Confirmation only ever prints to the
  // browser console, never to the UI, so it stays invisible on a projector.
  useEffect(() => {
    const secret = "gullak";
    let buffer = "";
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        !!target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (isTyping) {
        buffer = "";
        return;
      }
      buffer = (buffer + e.key.toLowerCase()).slice(-secret.length);
      if (buffer === secret) {
        buffer = "";
        setAutoEngineOn((prev) => {
          const next = !prev;
          // eslint-disable-next-line no-console
          console.log(`%c[gullak] auto-engine ${next ? "ON" : "OFF"}`, "color:#D4AF37; font-weight:bold;");
          return next;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 2. Submit claim
  const handleSubmitClaim = async (reason: string, amount: number, description: string, file: File | null) => {
    if (!currentUser || !activeCircleId || !currentProfile) return;

    let receiptUrl = "";
    if (file) {
      try {
        receiptUrl = await uploadClaimReceipt(currentUser.id, file);
      } catch (err) {
        console.error("Receipt upload failed, submitting claim without it:", err);
      }
    }

    await submitClaimWithAiCheck({
      circleId: activeCircleId,
      claimantId: currentUser.id,
      claimantScore: currentProfile.score ?? 0,
      reason,
      amount,
      description,
      receiptUrl,
    });

    const claimNotif: NotificationItem = {
      id: "notif-" + Date.now(),
      message: `You submitted a claim of ₹${amount.toLocaleString()} for ${reason}.`,
      time: "Just now",
      type: "claim",
      unread: true,
    };
    setNotifications((prev) => [claimNotif, ...prev]);
    showToast(`Claim of ₹${amount.toLocaleString()} submitted for group review.`, "success");

    await loadCircleData();

    setTimeout(() => {
      setActivePage("claims");
    }, 1500);
  };

  // 3. Vote
  const handleVoteClaim = async (claimId: string, choice: "yes" | "no") => {
    if (!currentUser) return;

    const { error: voteError } = await supabase.from("votes").insert({
      claim_id: claimId,
      voter_id: currentUser.id,
      choice,
    });

    if (voteError) {
      console.error("Vote failed", voteError);

      let message = "Your vote couldn't be recorded. Please try again.";
      if (voteError.code === "23505") {
        message = "You've already voted on this claim.";
      } else if (voteError.message?.includes("cannot vote on your own claim")) {
        message = "You can't vote on your own claim.";
      }

      const errorNotif: NotificationItem = {
        id: "notif-" + Date.now(),
        message,
        time: "Just now",
        type: "system",
        unread: true,
      };
      setNotifications((prev) => [errorNotif, ...prev]);
      showToast(message, "error");
      return;
    }

    const targetClaim = claims.find((c) => c.id === claimId);
    if (targetClaim) {
      await supabase
        .from("claims")
        .update({
          votes_yes: choice === "yes" ? targetClaim.votesYes + 1 : targetClaim.votesYes,
          votes_no: choice === "no" ? targetClaim.votesNo + 1 : targetClaim.votesNo,
        })
        .eq("id", claimId);
    }

    showToast(`Your ${choice.toUpperCase()} vote was recorded.`, "success");

    await loadCircleData();
  };

  // 3b. Reject (triggered when NO votes reach the required majority)
  const handleRejectClaim = async (claimId: string) => {
    if (!currentUser) return;
    const targetClaim = claims.find((c) => c.id === claimId);
    if (!targetClaim) return;

    await supabase
      .from("claims")
      .update({ status: "Rejected", payout_status: "Rejected" })
      .eq("id", claimId);

    await loadCircleData();
  };

  // 4. Payout
  const handleExecutePayout = async (claimId: string) => {
    if (!currentUser || !activeCircleId) return;
    const targetClaim = claims.find((c) => c.id === claimId);
    if (!targetClaim) return;

    await supabase
      .from("circles")
      .update({ pool_balance: poolBalance - targetClaim.amount })
      .eq("id", activeCircleId);

    await supabase
      .from("claims")
      .update({ payout_status: "Paid Successfully", status: "Approved" })
      .eq("id", claimId);

    setPoolBalance((prev) => Math.max(prev - targetClaim.amount, 0));

    await loadCircleData();
  };

  // 4b. Leave Circle
  const [leaveCircleError, setLeaveCircleError] = useState("");
  const handleLeaveCircle = async () => {
    if (!currentUser || !activeCircleId) return;

    setLeaveCircleError("");

    const { error } = await supabase
      .from("circle_members")
      .delete()
      .eq("circle_id", activeCircleId)
      .eq("user_id", currentUser.id);

    if (error) {
      console.error("Failed to leave circle", error);
      const message = error.message.includes("row-level security")
        ? "You don't have permission to leave this circle."
        : "Couldn't leave the circle. Please try again.";
      setLeaveCircleError(message);
      showToast(message, "error");
      return;
    }

    // Reset all circle-scoped state so stale data doesn't flash
    setActiveCircleId(null);
    setMembers([]);
    setTransactions([]);
    setClaims([]);
    setPoolBalance(0);
    setActivePage("dashboard");
    showToast("You left the circle.", "info");
  };

  // 4c. Update profile picture
  const [avatarUploadError, setAvatarUploadError] = useState("");
  const handleUpdateAvatar = async (file: File) => {
    if (!currentUser) return;
    setAvatarUploadError("");
    try {
      const avatarUrl = await updateAvatar(currentUser.id, file);
      setCurrentProfile((prev: any) => (prev ? { ...prev, avatar_url: avatarUrl } : prev));
      showToast("Profile picture updated.", "success");
    } catch (err: any) {
      console.error("Failed to update avatar", err);
      const message = err?.message || "Couldn't update your profile picture. Please try again.";
      setAvatarUploadError(message);
      showToast(message, "error");
    }
  };

  // 4c-2. Update display name
  const [nameUpdateError, setNameUpdateError] = useState("");
  const handleUpdateName = async (name: string) => {
    if (!currentUser) return;
    setNameUpdateError("");
    try {
      const newName = await updateName(currentUser.id, name);
      setCurrentProfile((prev: any) => (prev ? { ...prev, name: newName } : prev));
      showToast("Name updated.", "success");
    } catch (err: any) {
      console.error("Failed to update name", err);
      const message = err?.message || "Couldn't update your name. Please try again.";
      setNameUpdateError(message);
      showToast(message, "error");
    }
  };

  // 4d. Update circle milestone target (editable from Dashboard)
  const [milestoneUpdateError, setMilestoneUpdateError] = useState("");
  const handleUpdateMilestone = async (newTarget: number) => {
    if (!activeCircleId) return;
    setMilestoneUpdateError("");
    const prevTarget = milestoneTarget;
    setMilestoneTarget(newTarget); // optimistic update
    try {
      await updateMilestone(activeCircleId, newTarget);
      showToast("Milestone target updated.", "success");
    } catch (err: any) {
      console.error("Failed to update milestone", err);
      setMilestoneTarget(prevTarget); // roll back
      const message = err?.message || "Couldn't update the milestone. Please try again.";
      setMilestoneUpdateError(message);
      showToast(message, "error");
    }
  };

  // 4e. Update circle name (editable from Circle Details)
  const [circleNameUpdateError, setCircleNameUpdateError] = useState("");
  const handleUpdateCircleName = async (newName: string) => {
    if (!activeCircleId) return;
    setCircleNameUpdateError("");
    const prevName = circleName;
    setCircleName(newName); // optimistic update
    try {
      const trimmed = await updateCircleName(activeCircleId, newName);
      setCircleName(trimmed);
      showToast("Circle name updated.", "success");
    } catch (err: any) {
      console.error("Failed to update circle name", err);
      setCircleName(prevName); // roll back
      const message = err?.message || "Couldn't update the circle name. Please try again.";
      setCircleNameUpdateError(message);
      showToast(message, "error");
    }
  };

  // 5. Notifications (kept client-side only — there's no notifications table in the DB)
  const handleClearNotifications = () => setNotifications([]);
  const handleMarkNotificationsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));

  const unreadNotificationsCount = notifications.filter((n) => n.unread).length;
  const pendingClaimsList = claims.filter((c) => c.status === "Pending");
  const poolStats = computePoolStats(poolBalance, transactions, claims);

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <DashboardPage
            circleName={circleName}
            poolBalance={poolBalance}
            members={members}
            recentTransactions={transactions}
            pendingClaims={pendingClaimsList}
            poolStats={poolStats}
            onNavigate={setActivePage}
            milestoneTarget={milestoneTarget}
            onUpdateMilestone={handleUpdateMilestone}
            milestoneUpdateError={milestoneUpdateError}
          />
        );
      case "circle":
        return (
          <CircleDetailsPage
            circleName={circleName}
            onUpdateCircleName={handleUpdateCircleName}
            circleNameUpdateError={circleNameUpdateError}
            poolBalance={poolBalance}
            members={members}
            recentTransactions={transactions}
            claims={claims}
            circleCreatedAt={circleCreatedAt}
            currentUserId={currentUser?.id}
          />
        );
      case "simulator":
        return (
          <RoundupSimulatorPage
            poolBalance={poolBalance}
            recentTransactions={transactions}
            onSimulateRoundup={handleSimulateRoundup}
            triggerConfetti={handleTriggerConfetti}
            milestoneTarget={milestoneTarget}
          />
        );
      case "submit-claim":
        return (
          <ClaimSubmissionPage
            onSubmitClaim={handleSubmitClaim}
            triggerConfetti={handleTriggerConfetti}
          />
        );
      case "claims":
        return (
          <ClaimsFeedPage
            claims={claims}
            members={members}
            currentUserId={currentUser?.id}
            onVoteClaim={handleVoteClaim}
            onExecutePayout={handleExecutePayout}
            onRejectClaim={handleRejectClaim}
            triggerConfetti={handleTriggerConfetti}
            poolBalance={poolBalance}
          />
        );
      case "profile":
        return (
          <ProfilePage
            claims={claims}
            poolBalance={poolBalance}
            profile={currentProfile}
            myMember={members.find((m) => m.id === currentUser?.id)}
            email={currentUser?.email}
            myTransactions={transactions.filter((t) => t.userId === currentUser?.id)}
            memberCount={members.length}
            onLeaveCircle={handleLeaveCircle}
            leaveCircleError={leaveCircleError}
            onUpdateAvatar={handleUpdateAvatar}
            avatarUploadError={avatarUploadError}
            onUpdateName={handleUpdateName}
            nameUpdateError={nameUpdateError}
          />
        );
      default:
        return (
          <DashboardPage
            circleName={circleName}
            poolBalance={poolBalance}
            members={members}
            recentTransactions={transactions}
            pendingClaims={pendingClaimsList}
            poolStats={poolStats}
            onNavigate={setActivePage}
            milestoneTarget={milestoneTarget}
            onUpdateMilestone={handleUpdateMilestone}
            milestoneUpdateError={milestoneUpdateError}
          />
        );
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-matte-black flex items-center justify-center text-slate-400 font-mono text-sm">
        Loading...
      </div>
    );
  }

  if (activePage === "landing" || !currentUser) {
    return (
      <LoginPage
        onLaunch={() => setActivePage("dashboard")}
      />
    );
  }

  if (!circleChecked) {
    return (
      <div className="min-h-screen bg-matte-black flex items-center justify-center text-slate-400 font-mono text-sm">
        Loading your circle...
      </div>
    );
  }

  if (!activeCircleId) {
    return (
      <>
        <CircleSetupPage onCreate={handleCreateCircle} onJoin={handleJoinCircle} />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen font-sans flex bg-matte-black text-slate-100">
      <ConfettiEffect trigger={confettiTrigger} />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col lg:pl-72 min-h-screen overflow-x-hidden">
        <Navbar
          activePage={activePage}
          onOpenSidebar={() => setSidebarOpen(true)}
          notificationCount={unreadNotificationsCount}
          onOpenNotifications={() => setNotificationPanelOpen(true)}
          onNavigate={setActivePage}
          profile={currentProfile}
          circleName={circleName}
        />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
        <NotificationPanel
          isOpen={notificationPanelOpen}
          onClose={() => setNotificationPanelOpen(false)}
          notifications={notifications}
          onClearAll={handleClearNotifications}
          onMarkAllRead={handleMarkNotificationsRead}
        />
      </div>
    </div>
  );
}
