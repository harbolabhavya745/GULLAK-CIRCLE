import React from "react";
import { Menu, Bell, Coins, Sparkles, User, ChevronDown } from "lucide-react";

interface NavbarProps {
  activePage: string;
  onOpenSidebar: () => void;
  notificationCount: number;
  onOpenNotifications: () => void;
  onNavigate: (page: string) => void;
  profile?: any;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  onOpenSidebar,
  notificationCount,
  onOpenNotifications,
  onNavigate,
  profile
}) => {
  const firstName = profile?.name ? profile.name.split(" ")[0] : "Member";
  const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile?.name || "U")}`;

  const getPageTitle = () => {
    switch (activePage) {
      case "dashboard":
        return "Dashboard";
      case "circle":
        return "Circle details";
      case "simulator":
        return "Roundup Simulator";
      case "submit-claim":
        return "Submit claim";
      case "claims":
        return "Claims feed";
      case "profile":
        return "Your Profile";
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

        <h2 className="text-xl font-bold text-slate-100 font-sans tracking-tight">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Premium Real-time Status Badge */}
        <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/5 text-gold-500 text-xs font-semibold border border-gold-500/25 shadow-[0_0_15px_rgba(212,175,55,0.06)]">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse ring-2 ring-gold-500/30" /> 
          Active Protection
        </div>

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
