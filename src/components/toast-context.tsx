"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export type ToastItem = {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
};

type ToastContextType = {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
  };
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (item: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const duration = item.duration ?? 4000;
      const newToast: ToastItem = { ...item, id };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (message: string, title?: string) => addToast({ type: "success", message, title }),
    error: (message: string, title?: string) => addToast({ type: "error", message, title }),
    info: (message: string, title?: string) => addToast({ type: "info", message, title }),
    warning: (message: string, title?: string) => addToast({ type: "warning", message, title }),
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
      {/* Toast Render Viewport */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex max-w-md w-full flex-col gap-2.5 px-4 sm:px-0 sm:bottom-6 sm:right-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3.5 rounded-2xl border p-4 shadow-xl backdrop-blur-xl transition-all animate-in slide-in-from-bottom-5 duration-300 ${
              t.type === "success"
                ? "border-emerald-200 bg-white/95 text-emerald-950 shadow-emerald-900/5"
                : t.type === "error"
                ? "border-rose-200 bg-white/95 text-rose-950 shadow-rose-900/5"
                : t.type === "warning"
                ? "border-amber-200 bg-white/95 text-amber-950 shadow-amber-900/5"
                : "border-slate-200 bg-white/95 text-slate-900 shadow-slate-900/5"
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {t.type === "success" ? (
                <div className="rounded-xl bg-emerald-100 p-1.5 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              ) : t.type === "error" ? (
                <div className="rounded-xl bg-rose-100 p-1.5 text-rose-700">
                  <AlertCircle className="h-4 w-4" />
                </div>
              ) : t.type === "warning" ? (
                <div className="rounded-xl bg-amber-100 p-1.5 text-amber-700">
                  <AlertCircle className="h-4 w-4" />
                </div>
              ) : (
                <div className="rounded-xl bg-cyan-100 p-1.5 text-cyan-700">
                  <Info className="h-4 w-4" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {t.title && <p className="text-xs font-bold font-display">{t.title}</p>}
              <p className="text-xs leading-relaxed font-medium text-slate-700">{t.message}</p>
            </div>

            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="flex-shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
