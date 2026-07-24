import React from "react";
import { supabase } from "../lib/supabase";
import { 
  Coins, 
  LayoutDashboard, 
  Users, 
  PlusCircle, 
  CheckSquare, 
  User, 
  Menu, 
  X,
  LogOut,
  Sparkles,
  Crown
} from "lucide-react";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isPremium?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  isOpen,
  onClose,
  isPremium = false,
}) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "circle", label: "Circle details", icon: Users },
    { id: "submit-claim", label: "Submit claim", icon: PlusCircle },
    { id: "claims", label: "Claims feed", icon: CheckSquare },
    { id: "profile", label: "Your Profile", icon: User },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onClose(); // close mobile drawer if open
  };

  const handleLogout = async () => {
    onClose();
    await supabase.auth.signOut();
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar Panel */}
      <aside className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-matte-charcoal border-r border-gold-500/10 flex flex-col justify-between transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="p-6 space-y-8">
          
          {/* Logo Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center text-matte-black shadow-lg shadow-gold-500/20">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white">Gullak Circle</h1>
                <p className="text-[9px] font-mono tracking-widest text-gold-500 uppercase">Apne circle ka gullak</p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-matte-gray lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav List */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold tracking-normal transition-all cursor-pointer ${
                    isActive
                      ? "bg-gold-500 text-matte-black shadow-lg shadow-gold-500/10"
                      : "text-slate-400 hover:bg-matte-gray hover:text-slate-100"
                  }`}
                >
                  <item.icon className={`w-4.5 h-4.5 ${isActive ? "text-matte-black" : "text-slate-500"}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Premium upsell / status entry — visually distinct from the rest of the nav */}
          <button
            onClick={() => handleItemClick("premium")}
            className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold tracking-normal transition-all cursor-pointer border ${
              activePage === "premium"
                ? "bg-gold-500 text-matte-black border-gold-500 shadow-lg shadow-gold-500/10"
                : "bg-gradient-to-r from-gold-500/10 to-gold-500/5 text-gold-500 border-gold-500/25 hover:border-gold-500/50 hover:from-gold-500/15"
            }`}
          >
            <Crown className={`w-4.5 h-4.5 ${activePage === "premium" ? "text-matte-black" : "text-gold-500"}`} />
            <span className="flex-1 text-left">Premium</span>
            {isPremium ? (
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                  activePage === "premium" ? "bg-matte-black/15 text-matte-black" : "bg-gold-500/15 text-gold-500 border border-gold-500/30"
                }`}
              >
                Active
              </span>
            ) : (
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                  activePage === "premium" ? "bg-matte-black/15 text-matte-black" : "bg-gold-500/15 text-gold-500 border border-gold-500/30"
                }`}
              >
                ₹49/mo
              </span>
            )}
          </button>

        </div>

        {/* Footer controls inside sidebar */}
        <div className="p-6 border-t border-gold-500/10 space-y-4">

          {/* Log out */}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 rounded-xl border border-gold-500/10 hover:bg-matte-gray text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>

        </div>
      </aside>
    </>
  );
};
