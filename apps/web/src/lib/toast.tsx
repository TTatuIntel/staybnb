"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

type Kind = "success" | "error" | "info";
interface Toast { id: number; kind: Kind; text: string }

const ToastContext = createContext<{ push: (kind: Kind, text: string) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);
  const push = useCallback((kind: Kind, text: string) => {
    const id = ++counter.current;
    setToasts((t) => [...t, { id, kind, text }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);
  const value = useMemo(() => ({ push }), [push]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto animate-fade-up rounded-full px-4 py-2.5 text-sm font-medium text-white shadow-float ${
              t.kind === "success" ? "bg-emerald-600" : t.kind === "error" ? "bg-zinc-900" : "bg-zinc-800"
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return {
    success: (text: string) => ctx.push("success", text),
    error: (text: string) => ctx.push("error", text),
    info: (text: string) => ctx.push("info", text),
  };
}
