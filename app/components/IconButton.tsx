"use client";

import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

type IconButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  icon: LucideIcon;
  label?: string;
  ariaLabel?: string;
  variant?: IconButtonVariant;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
}

export function IconButton({
  icon: Icon,
  label,
  ariaLabel,
  variant = "primary",
  fullWidth = false,
  type = "button",
  className,
  ...rest
}: IconButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/40 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses: Record<IconButtonVariant, string> = {
    primary: "bg-primary hover:bg-primary-hover text-white shadow-sm",
    secondary: "bg-secondary hover:bg-secondary-hover text-foreground",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    ghost: "bg-transparent hover:bg-soft text-foreground",
  };

  const widthClass = fullWidth ? "w-full" : "";

  const mergedClassName = [
    baseClasses,
    variantClasses[variant],
    widthClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const computedAriaLabel = ariaLabel ?? label;

  return (
    <button
      type={type}
      aria-label={computedAriaLabel}
      className={mergedClassName}
      {...rest}
    >
      <Icon className="w-4 h-4" aria-hidden={!!label} />
      {label && <span>{label}</span>}
    </button>
  );
}
