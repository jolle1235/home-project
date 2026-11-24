import type { ButtonHTMLAttributes } from "react";
import { ButtonOrLink } from "./ButtonOrLink";
import { BUTTON_BASE, BUTTON_VARIANTS, type ButtonVariant } from "./buttonStyles";

type ButtonSize = "xs" | "sm" | "md" | "lg";

// xs is a small control (week plan ✕, "Opskrift"): small look, 44×44 tap area. The others
// are at least 44 px tall.
const SIZE_STYLES: Record<ButtonSize, string> = {
  xs: "min-h-8 px-2 text-body-sm hit-area",
  sm: "min-h-11 px-2 text-body-sm",
  md: "min-h-11 px-4 text-body",
  lg: "min-h-12 px-6 text-body",
};

interface ButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "type" | "onClick" | "disabled" | "className" | "children"
  > {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  type?: "button" | "submit" | "reset";
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  className?: string;
  // Renders a link styled as this button.
  href?: string;
}

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  isLoading = false,
  loadingText = "Indlæser...",
  className = "",
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <ButtonOrLink
      onClick={onClick}
      type={type}
      disabled={isDisabled}
      {...rest}
      className={`${BUTTON_BASE} gap-2 rounded-xl disabled:opacity-60 ${SIZE_STYLES[size]} ${
        BUTTON_VARIANTS[variant]
      } ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {loadingText}
        </>
      ) : (
        children
      )}
    </ButtonOrLink>
  );
}
