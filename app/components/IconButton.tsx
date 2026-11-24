"use client";

import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { ButtonOrLink } from "./ButtonOrLink";
import { BUTTON_BASE, BUTTON_VARIANTS, type ButtonVariant } from "./buttonStyles";

type IconButtonSize = "xs" | "sm" | "md" | "lg";

// xs is a small control (the recipe's −/+): small look, 44×44 tap area. The others are at
// least 44×44. Each size carries the text role of its label.
const SIZE_CLASSES: Record<IconButtonSize, string> = {
  xs: "min-h-6 px-1 py-1 text-caption hit-area",
  sm: "min-h-11 min-w-11 px-2 py-1 text-body-sm",
  md: "min-h-11 min-w-11 px-3 py-2 text-body",
  lg: "min-h-12 min-w-12 px-4 py-3 text-body",
};

const ICON_SIZES: Record<IconButtonSize, string> = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  icon: LucideIcon;
  label?: string;
  ariaLabel?: string;
  variant?: ButtonVariant;
  size?: IconButtonSize;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
  // Renders a link styled as this button.
  href?: string;
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
  const widthClass = fullWidth ? "w-full" : "";

  const mergedClassName = [
    BUTTON_BASE,
    "gap-1.5 rounded-lg disabled:opacity-50",
    SIZE_CLASSES[size],
    BUTTON_VARIANTS[variant],
    widthClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const computedAriaLabel = ariaLabel ?? label;

  return (
    <ButtonOrLink
      type={type}
      aria-label={computedAriaLabel}
      className={mergedClassName}
      {...rest}
    >
      <Icon className={ICON_SIZES[size]} aria-hidden={!!label} />
      {label && <span>{label}</span>}
    </ButtonOrLink>
  );
}
