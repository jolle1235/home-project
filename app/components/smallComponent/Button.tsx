import type { ButtonHTMLAttributes } from "react";

interface ButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "type" | "onClick" | "disabled" | "className" | "children"
  > {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  className?: string;
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

  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-medium
    rounded-xl
    transition-all duration-200
    active:translate-y-[1px]
    disabled:opacity-60
    disabled:cursor-not-allowed
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
    focus-visible:ring-offset-2 focus-visible:ring-offset-background
  `;

  const sizeStyles = {
    sm: "min-h-[32px] px-2 text-sm",
    md: "min-h-[40px] px-4 text-base",
    lg: "min-h-[48px] px-6 text-lg",
  };

  const variantStyles = {
    primary: `
      bg-primary text-white
      hover:bg-primary-hover
      shadow-sm
    `,
    secondary: `
      bg-secondary text-foreground
      hover:bg-secondary-hover
    `,
    ghost: `
      bg-transparent text-foreground
      hover:bg-soft
    `,
    danger: `
      bg-red-600 text-white
      hover:bg-red-700
    `,
  };

  return (
    <button
      onClick={onClick}
      type={type}
      disabled={isDisabled}
      {...rest}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
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
    </button>
  );
}
