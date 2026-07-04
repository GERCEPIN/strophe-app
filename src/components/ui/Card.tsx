import { HTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, TextareaHTMLAttributes } from "react";
import { clsx } from "clsx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-[var(--strophe-border)] bg-[var(--strophe-surface)] p-5",
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={clsx("block text-xs font-medium uppercase tracking-wider text-[var(--strophe-text-muted)] mb-1.5", className)}
      {...props}
    />
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "w-full rounded-md border border-[var(--strophe-border-strong)] bg-[var(--strophe-bg-elevated)] px-3.5 py-2.5 text-[var(--strophe-text)] placeholder:text-[var(--strophe-text-faint)]",
        "focus:border-[var(--strophe-gold)] outline-none transition-colors",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        "w-full rounded-md border border-[var(--strophe-border-strong)] bg-[var(--strophe-bg-elevated)] px-3.5 py-2.5 text-[var(--strophe-text)] placeholder:text-[var(--strophe-text-faint)]",
        "focus:border-[var(--strophe-gold)] outline-none transition-colors resize-y",
        className
      )}
      {...props}
    />
  );
}
