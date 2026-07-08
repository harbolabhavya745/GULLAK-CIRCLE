import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "./lib/supabase";
import {
  ensureProfile,
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

export default function App() {
  const [activePage, setActivePage] = useState<string>("landing");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState<boolean>(false);
  const [confettiTrigger, setConfettiTrigger] = useState<boolean>(false);

  const [poolBalance, setPoolBalance] = useState<number>(0);
  const [circleCreatedAt, setCircleCreatedAt] = useState<string | undefined>(undefined);
  const [circleInviteCode, setCircleInviteCode] = useState<string | undefined>(undefined);
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [activeCircleId, setActiveCircleId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [circleChecked, setCircleChecked] = useState(false);

  // Dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

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
      setCircleCreatedAt(circle.created_at);
      setCircleInviteCode(circle.invite_code);
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
        () => loadCircleData()
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
    const circle = await createCircle(name, currentUser.id);
    setActiveCircleId(circle.id);
  };

  const handleJoinCircle = async (inviteCode: string) => {
    if (!currentUser) return;
    const circle = await joinCircleByInviteCode(inviteCode, currentUser.id);
    setActiveCircleId(circle.id);
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

  // 2. Submit claim
  const handleSubmitClaim = async (reason: string, amount: number, description: string, filename: string) => {
    if (!currentUser || !activeCircleId) return;

    await supabase.from("claims").insert({
      circle_id: activeCircleId,
      claimant_id: currentUser.id,
      reason,
      amount,
      description,
      receipt_url: filename,
      status: "Pending",
      payout_status: "Awaiting Vote",
      votes_yes: 0,
      votes_no: 0,
    });

    const claimNotif: NotificationItem = {
      id: "notif-" + Date.now(),
      message: `You submitted a claim of ₹${amount.toLocaleString()} for ${reason}.`,
      time: "Just now",
      type: "claim",
      unread: true,
    };
    setNotifications((prev) => [claimNotif, ...prev]);

    await loadCircleData();

    setTimeout(() => {
      setActivePage("claims");
    }, 1500);
  };

  // 3. Vote
  const handleVoteClaim = async (claimId: string, choice: "yes" | "no") => {
    if (!currentUser) return;
    await supabase.from("votes").insert({
      claim_id: claimId,
      voter_id: currentUser.id,
      choice,
    });

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

    const payoutNotif: NotificationItem = {
      id: "notif-" + Date.now(),
      message: `₹${targetClaim.amount.toLocaleString()} was successfully disbursed to ${targetClaim.claimantName}.`,
      time: "Just now",
      type: "system",
      unread: true,
    };
    setNotifications((prev) => [payoutNotif, ...prev]);

    await loadCircleData();
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
            poolBalance={poolBalance}
            members={members}
            recentTransactions={transactions}
            pendingClaims={pendingClaimsList}
            poolStats={poolStats}
            onNavigate={setActivePage}
            isDarkMode={isDarkMode}
          />
        );
      case "circle":
        return (
          <CircleDetailsPage
            poolBalance={poolBalance}
            members={members}
            recentTransactions={transactions}
            claims={claims}
            circleCreatedAt={circleCreatedAt}
            inviteCode={circleInviteCode}
          />
        );
      case "simulator":
        return (
          <RoundupSimulatorPage
            poolBalance={poolBalance}
            recentTransactions={transactions}
            onSimulateRoundup={handleSimulateRoundup}
            triggerConfetti={handleTriggerConfetti}
          />
        );
      case "submit-claim":
        return (
          <ClaimSubmissionPage
            onSubmitClaim={handleSubmitClaim}
            triggerConfetti={handleTriggerConfetti}
            isDarkMode={isDarkMode}
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
            email={currentUser?.email}
            myTransactions={transactions.filter((t) => t.userId === currentUser?.id)}
          />
        );
      default:
        return (
          <DashboardPage
            poolBalance={poolBalance}
            members={members}
            recentTransactions={transactions}
            pendingClaims={pendingClaimsList}
            poolStats={poolStats}
            onNavigate={setActivePage}
            isDarkMode={isDarkMode}
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
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
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
    return <CircleSetupPage onCreate={handleCreateCircle} onJoin={handleJoinCircle} />;
  }

  return (
    <div className={`min-h-screen font-sans flex ${isDarkMode ? "bg-matte-black text-slate-100" : "bg-gold-50 text-slate-900"}`}>
      <ConfettiEffect trigger={confettiTrigger} />
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        notificationCount={unreadNotificationsCount}
        onOpenNotifications={() => setNotificationPanelOpen(true)}
      />
      <div className="flex-1 flex flex-col lg:pl-72 min-h-screen overflow-x-hidden">
        <Navbar
          activePage={activePage}
          onOpenSidebar={() => setSidebarOpen(true)}
          notificationCount={unreadNotificationsCount}
          onOpenNotifications={() => setNotificationPanelOpen(true)}
          onNavigate={setActivePage}
          profile={currentProfile}
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