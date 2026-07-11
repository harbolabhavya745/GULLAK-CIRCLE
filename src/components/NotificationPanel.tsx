import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Bell, Coins, PlusCircle, CheckSquare, Info } from "lucide-react";
import { NotificationItem } from "../types";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onClearAll: () => void;
  onMarkAllRead: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearAll,
  onMarkAllRead
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            onClick={onClose}
            className="fixed inset-0 bg-matte-black/60 backdrop-blur-xs z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-96 bg-matte-charcoal border-l border-gold-500/10 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-gold-500/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-gold-500" />
                <h3 className="font-bold text-white">Notification Feed</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-matte-gray cursor-pointer text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions */}
            {notifications.length > 0 && (
              <div className="px-6 py-2.5 bg-matte-black border-b border-gold-500/10 flex justify-between text-[11px] font-bold text-slate-500 font-mono">
                <button onClick={onMarkAllRead} className="hover:text-gold-500 cursor-pointer">MARK ALL AS READ</button>
                <button onClick={onClearAll} className="hover:text-red-450 cursor-pointer">CLEAR ALL</button>
              </div>
            )}

            {/* List */}
            <div className="flex-grow overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <Bell className="w-12 h-12 text-slate-700 mx-auto" />
                  <p className="text-sm font-semibold text-slate-500">All caught up!</p>
                  <p className="text-xs text-slate-400">No new alerts or notifications in Gullak Circle.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-xl border transition-all flex gap-3 relative overflow-hidden ${
                      n.unread 
                        ? "bg-gold-500/5 border-gold-500/20" 
                        : "bg-matte-black/40 border-gold-500/5"
                    }`}
                  >
                    {/* Unread indicator line */}
                    {n.unread && <span className="absolute top-0 bottom-0 left-0 w-1 bg-gold-500" />}

                    {/* Icon based on type */}
                    <div className={`p-2 rounded-lg flex-shrink-0 self-start ${
                      n.type === "contribution" ? "bg-gold-500/10 text-gold-500" :
                      n.type === "claim" ? "bg-amber-500/10 text-amber-500" :
                      n.type === "vote" ? "bg-yellow-600/10 text-yellow-500" : "bg-neutral-500/10 text-neutral-400"
                    }`}>
                      {n.type === "contribution" ? <Coins className="w-4 h-4" /> :
                       n.type === "claim" ? <PlusCircle className="w-4 h-4" /> :
                       n.type === "vote" ? <CheckSquare className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    </div>

                    <div className="space-y-1.5 flex-grow">
                      <p className={`text-xs leading-relaxed ${n.unread ? "font-bold text-slate-100" : "text-slate-350"}`}>
                        {n.message}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">{n.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gold-500/10 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Gullak Circle Live Watchdog</span>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
