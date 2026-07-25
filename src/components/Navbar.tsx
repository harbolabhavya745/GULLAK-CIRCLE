import React, { useEffect, useRef, useState } from "react";
import { Menu, Bell, Coins, Sparkles, User, ChevronDown, Crown, Users, Plus, Check } from "lucide-react";

interface NavbarProps {
  activePage: string;
  onOpenSidebar: () => void;
  notificationCount: number;
  onOpenNotifications: () => void;
  onNavigate: (page: string) => void;
  profile?: any;
  circleName?: string;
  isPremium?: boolean;
  circles?: { id: string; name: string }[];
  activeCircleId?: string | null;
  onSwitchCircle?: (circleId: string) => void;
  onAddCircle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  onOpenSidebar,
  notificationCount,
  onOpenNotifications,
  onNavigate,
  profile,
  circleName,
  isPremium = false,
  circles = [],
  activeCircleId,
  onSwitchCircle,
  onAddCircle,
}) => {
  const [circleMenuOpen, setCircleMenuOpen] = useState(false);
  const circleMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!circleMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (circleMenuRef.current && !circleMenuRef.current.contains(e.target as Node)) {
        setCircleMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [circleMenuOpen]);
  const firstName = profile?.name ? profile.name.split(" ")[0] : "Member";
  const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile?.name || "U")}`;

  const getPageTitle = () => {
    switch (activePage) {
      case "dashboard":
        return "Dashboard";
      case "circle":
        return circleName || "Circle details";
      case "submit-claim":
        return "Submit claim";
      case "claims":
        return "Claims feed";
      case "profile":
        return "Your Profile";
      case "premium":
        return "Premium";
      default:
        return "Gullak Circle";
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-matte-black/90 backdrop-blur-md border-b border-gold-500/15 shadow-xl">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 rounded-xl hover:bg-matte-charcoal border border-transparent hover:border-gold-500/10 lg:hidden cursor-pointer text-slate-400 hover:text-gold-500"
          aria-label="Open Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-slate-100 font-sans tracking-tight hidden sm:block">
          {getPageTitle()}
        </h2>

        {/* Circle switcher — always shown once the user has a circle, so "create or join another" stays discoverable */}
        {circles.length > 0 && (
          <div className="relative" ref={circleMenuRef}>
            <button
              type="button"
              onClick={() => setCircleMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-xl bg-matte-charcoal border border-gold-500/15 hover:border-gold-500/35 text-slate-200 text-sm font-semibold cursor-pointer transition-colors"
              aria-haspopup="true"
              aria-expanded={circleMenuOpen}
            >
              <Users className="w-3.5 h-3.5 text-gold-500" />
              <span className="max-w-[140px] truncate">{circleName || "Select circle"}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${circleMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {circleMenuOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-xl bg-matte-charcoal border border-gold-500/15 shadow-xl overflow-hidden z-40">
                <div className="max-h-64 overflow-y-auto py-1">
                  {circles.map((circle) => (
                    <button
                      key={circle.id}
                      type="button"
                      onClick={() => {
                        onSwitchCircle?.(circle.id);
                        setCircleMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm text-left text-slate-200 hover:bg-matte-black/60 transition-colors cursor-pointer"
                    >
                      <span className="truncate">{circle.name}</span>
                      {circle.id === activeCircleId && <Check className="w-3.5 h-3.5 text-gold-500 shrink-0" />}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onAddCircle?.();
                    setCircleMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold font-mono uppercase tracking-wider border-t transition-colors cursor-pointer ${
                    isPremium
                      ? "text-gold-500 border-gold-500/15 hover:bg-gold-500/5"
                      : "text-slate-400 border-gold-500/15 hover:bg-matte-black/60"
                  }`}
                >
                  {isPremium ? <Plus className="w-3.5 h-3.5" /> : <Crown className="w-3.5 h-3.5 text-gold-500" />}
                  {isPremium ? "Create or join another" : "Create or join another — Premium"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Real-time Status Badge */}
        <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/5 text-gold-500 text-xs font-semibold border border-gold-500/25 shadow-[0_0_15px_rgba(212,175,55,0.06)]">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse ring-2 ring-gold-500/30" /> 
          Active Protection
        </div>

        {/* Premium subscription status / upgrade nudge */}
        {isPremium ? (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold-500 text-matte-black text-xs font-bold">
            <Crown className="w-3.5 h-3.5" /> Premium
          </span>
        ) : (
          <button
            onClick={() => onNavigate("premium")}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold-500/30 text-gold-500 text-xs font-bold hover:bg-gold-500 hover:text-matte-black transition-colors cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5" /> Upgrade
          </button>
        )}

        {/* Premium notification bell button */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2.5 rounded-xl bg-matte-charcoal border border-gold-500/15 hover:border-gold-500/35 hover:bg-matte-black/40 text-gold-500/80 hover:text-gold-500 transition-all shadow-md group"
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5 group-hover:scale-105 transition-transform" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold-500 ring-2 ring-matte-charcoal animate-bounce" />
          )}
        </button>

        {/* Premium Avatar & Profile link */}
        <div 
          onClick={() => onNavigate("profile")}
          className="flex items-center gap-3 cursor-pointer group bg-matte-charcoal/50 border border-gold-500/10 hover:border-gold-500/30 pl-1.5 pr-3 py-1 rounded-full hover:bg-matte-charcoal transition-all shadow-sm"
        >
          <div className="relative p-0.5 rounded-full bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 shadow-md">
            <img
              src={avatarUrl}
              alt="User Avatar"
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full object-cover"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="hidden md:inline text-xs font-bold text-slate-200 group-hover:text-gold-500 transition-colors">
              {firstName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-gold-500 transition-colors" />
          </div>
        </div>
      </div>
    </header>
  );
};
