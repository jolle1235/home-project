"use client";

import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

type IconButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type IconButtonSize = "xs" | "sm" | "md" | "lg";

interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  icon: LucideIcon;
  label?: string;
  ariaLabel?: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
}

export function IconButton({
  icon: Icon,
  label,
  ariaLabel,
  variant = "primary",
  size = "md",
  fullWidth = false,
  type = "button",
  className,
  ...rest
}: IconButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-all duration-200 active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeClasses: Record<IconButtonSize, string> = {
    xs: "min-h-[24px] px-1 py-1 text-xs",
    sm: "min-h-[28px] px-2 py-1 text-sm",
    md: "min-h-[32px] px-3 py-2 text-base",
    lg: "min-h-[40px] px-4 py-3 text-lg",
  };

  const iconSizes: Record<IconButtonSize, string> = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const variantClasses: Record<IconButtonVariant, string> = {
    primary: "bg-primary hover:bg-primary-hover text-white shadow-sm",
    secondary: "bg-secondary hover:bg-secondary-hover text-foreground",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    ghost: "bg-transparent hover:bg-soft text-foreground",
  };

  const widthClass = fullWidth ? "w-full" : "";

  const mergedClassName = [
    baseClasses,
    sizeClasses[size],
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
      <Icon className={iconSizes[size]} aria-hidden={!!label} />
      {label && <span>{label}</span>}
    </button>
  );
}
