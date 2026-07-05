import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-[var(--strophe-gold)] text-[#14120a] hover:bg-[var(--strophe-gold-bright)] active:bg-[var(--strophe-gold)] disabled:bg-[var(--strophe-gold-dim)] shadow-[0_2px_12px_rgba(198,161,91,0.25)] hover:shadow-[0_2px_20px_rgba(198,161,91,0.35)]",
  secondary:
    "bg-[var(--strophe-surface)] text-[var(--strophe-text)] border border-[var(--strophe-border-strong)] hover:bg-[var(--strophe-surface-hover)] hover:border-[var(--strophe-border-strong)]",
  ghost: "bg-transparent text-[var(--strophe-text-muted)] hover:text-[var(--strophe-text)] hover:bg-[var(--strophe-surface)]",
  danger: "bg-[var(--strophe-danger)] text-white hover:brightness-110 shadow-[0_2px_12px_rgba(193,73,61,0.25)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 font-medium text-sm tracking-wide transition-all duration-150",
          "active:scale-[0.97] active:translate-y-px",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:active:translate-y-0",
          VARIANT_CLASSES[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
