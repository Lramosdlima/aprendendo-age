import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/cn";

type ToastState = {
  message: string;
  variant: "success" | "error";
};

type ToastContextValue = {
  showToast: (message: string, variant?: "success" | "error") => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, variant: "success" | "error" = "success") => {
    setToast({ message, variant });
    window.setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast
        ? createPortal(
            <div
              className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4"
              role="status"
              aria-live="polite"
            >
              <p
                className={cn(
                  "pointer-events-auto max-w-md rounded-xl border px-4 py-3 text-center text-sm font-medium shadow-lg shadow-black/40",
                  toast.variant === "success"
                    ? "border-emerald-500/40 bg-emerald-950/90 text-emerald-100"
                    : "border-red-500/40 bg-red-950/90 text-red-100",
                )}
              >
                {toast.message}
              </p>
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
