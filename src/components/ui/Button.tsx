import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-[var(--strophe-gold)] text-[#14120a] hover:bg-[var(--strophe-gold-bright)] disabled:bg-[var(--strophe-gold-dim)]",
  secondary:
    "bg-[var(--strophe-surface)] text-[var(--strophe-text)] border border-[var(--strophe-border-strong)] hover:bg-[var(--strophe-surface-hover)]",
  ghost: "bg-transparent text-[var(--strophe-text-muted)] hover:text-[var(--strophe-text)]",
  danger: "bg-[var(--strophe-danger)] text-white hover:brightness-110",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 font-medium text-sm tracking-wide transition-colors duration-150",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          VARIANT_CLASSES[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
