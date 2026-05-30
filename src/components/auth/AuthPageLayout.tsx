import type { InputHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/cn";

export function AuthPageLayout({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto flex w-full max-w-md flex-col", className)}>
      <div className="rounded-2xl border border-aom-border bg-zinc-950/80 p-6 shadow-lg shadow-black/20">
        {children}
      </div>
    </div>
  );
}

const inputClassName =
  "rounded-lg border border-aom-border bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-500/45 focus:ring-1 focus:ring-amber-500/25";

export function AuthField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-zinc-300">{label}</span>
      {children}
    </label>
  );
}

export function AuthInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClassName, className)} {...props} />;
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
      {message}
    </p>
  );
}

export function AuthSubmitButton({
  children,
  pending,
  disabled,
}: {
  children: ReactNode;
  pending?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={cn(
        "mt-1 rounded-lg bg-amber-500/90 px-4 py-2.5 text-sm font-medium text-zinc-950",
        "transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50",
        "focus:outline-none focus:ring-2 focus:ring-amber-500/35",
      )}
    >
      {children}
    </button>
  );
}

export function AuthLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="font-medium text-amber-300/95 underline-offset-2 hover:text-amber-200 hover:underline"
    >
      {children}
    </Link>
  );
}

export { inputClassName as authInputClassName };
