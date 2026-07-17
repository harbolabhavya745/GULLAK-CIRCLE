import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const TOAST_STYLES: Record<ToastType, { border: string; icon: React.ReactNode; iconWrap: string }> = {
  success: {
    border: "border-gold-500/25",
    iconWrap: "text-gold-500 bg-gold-500/10",
    icon: <CheckCircle2 className="w-4.5 h-4.5" />,
  },
  error: {
    border: "border-red-500/25",
    iconWrap: "text-red-500 bg-red-500/10",
    icon: <XCircle className="w-4.5 h-4.5" />,
  },
  info: {
    border: "border-slate-500/25",
    iconWrap: "text-slate-300 bg-slate-500/10",
    icon: <Info className="w-4.5 h-4.5" />,
  },
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col-reverse gap-2.5 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const style = TOAST_STYLES[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 pr-2.5 rounded-2xl bg-matte-charcoal border ${style.border} shadow-2xl shadow-black/40`}
            >
              <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${style.iconWrap}`}>
                {style.icon}
              </span>
              <p className="text-xs font-semibold text-slate-200 leading-snug pt-1">{toast.message}</p>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="ml-auto shrink-0 p-1.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
