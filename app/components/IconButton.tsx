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
    "inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses: Record<IconButtonVariant, string> = {
    primary: "bg-action hover:bg-actionHover text-darkText",
    secondary: "bg-gray-200 hover:bg-gray-300 text-darkText",
    danger: "bg-cancel hover:opacity-90 text-darkText",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
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
