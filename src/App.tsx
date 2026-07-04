import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "./lib/supabase";
import { 
  mockMembers, 
  mockTransactions, 
  mockClaims, 
  mockNotifications, 
  mockPoolStats 
} from "./data";
import { Member, Transaction, Claim, NotificationItem } from "./types";

import { LoginPage } from "./pages/LoginPage";
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
  const [poolBalance, setPoolBalance] = useState<number>(mockPoolStats.totalBalance);
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [claims, setClaims] = useState<Claim[]>(mockClaims);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeCircleId, setActiveCircleId] = useState<string | null>(null);

  // Dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Get logged in user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user);
    });
  }, []);

  // Load user's circle
  useEffect(() => {
    if (!currentUser) return;
    supabase
      .from('circle_members')
      .select('circle_id')
      .eq('user_id', currentUser.id)
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setActiveCircleId(data.circle_id);
      });
  }, [currentUser]);

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('circle-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'transactions'
      }, (payload) => {
        setPoolBalance(prev => prev + payload.new.roundup);
        setTransactions(prev => [payload.new as Transaction, ...prev]);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'claims'
      }, (payload) => {
        setClaims(prev => prev.map(c =>
          c.id === payload.new.id ? payload.new as Claim : c
        ));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Confetti
  const handleTriggerConfetti = () => {
    setConfettiTrigger(true);
    setTimeout(() => setConfettiTrigger(false), 200);
  };

  // 1. Roundup
  const handleSimulateRoundup = async (merchant: string, amount: number, roundup: number) => {
    if (!currentUser) return;
    await supabase.from('transactions').insert({
      circle_id: activeCircleId,
      user_id: currentUser.id,
      merchant,
      amount,
      roundup,
      category: 'Shopping'
    });
  };

  // 2. Submit claim
  const handleSubmitClaim = async (reason: string, amount: number, description: string, filename: string) => {
    if (!currentUser || !activeCircleId) return;

    await supabase.from('claims').insert({
      circle_id: activeCircleId,
      claimant_id: currentUser.id,
      reason,
      amount,
      description,
      receipt_url: filename,
      status: 'Pending',
      payout_status: 'Awaiting Vote'
    });

    const claimNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      message: `You submitted a claim of ₹${amount.toLocaleString()} for ${reason}.`,
      time: 'Just now',
      type: 'claim',
      unread: true
    };
    setNotifications(prev => [claimNotif, ...prev]);

    setTimeout(() => {
      setActivePage('claims');
    }, 1500);
  };

  // 3. Vote
  const handleVoteClaim = async (claimId: string, choice: "yes" | "no") => {
    if (!currentUser) return;
    await supabase.from('votes').insert({
      claim_id: claimId,
      voter_id: currentUser.id,
      choice
    });
  };

  // 4. Payout
  const handleExecutePayout = async (claimId: string) => {
    if (!currentUser) return;
    const targetClaim = claims.find(c => c.id === claimId);
    if (!targetClaim) return;

    await supabase
      .from('circles')
      .update({ pool_balance: poolBalance - targetClaim.amount })
      .eq('id', activeCircleId);

    await supabase
      .from('claims')
      .update({ payout_status: 'Paid Successfully' })
      .eq('id', claimId);

    setPoolBalance(prev => Math.max(prev - targetClaim.amount, 0));

    const payoutNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      message: `₹${targetClaim.amount.toLocaleString()} was successfully disbursed to ${targetClaim.claimantName}.`,
      time: 'Just now',
      type: 'system',
      unread: true
    };
    setNotifications(prev => [payoutNotif, ...prev]);
  };

  // 5. Notifications
  const handleClearNotifications = () => setNotifications([]);
  const handleMarkNotificationsRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));

  const unreadNotificationsCount = notifications.filter(n => n.unread).length;
  const pendingClaimsList = claims.filter(c => c.status === "Pending");
  const poolStats = {
    totalBalance: poolBalance,
    targetMonthly: mockPoolStats.targetMonthly,
    currentMonthlyContribution: mockPoolStats.currentMonthlyContribution,
    totalClaimsPaid: mockPoolStats.totalClaimsPaid,
    pendingClaimsCount: pendingClaimsList.length
  };

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

  if (activePage === "landing") {
    return (
      <LoginPage
        onLaunch={() => setActivePage("dashboard")}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />
    );
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