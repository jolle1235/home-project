import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";

type ButtonOrLinkProps = ButtonHTMLAttributes<HTMLButtonElement> & { href?: string };

// A link when there's an href (Next prefetches it while it's on screen, loading
// screen included), otherwise a button. Shared by Button and IconButton. A
// disabled (or loading) one stays a disabled button: a link can't be disabled.
export function ButtonOrLink({
  href,
  className,
  children,
  "aria-label": ariaLabel,
  ...buttonProps
}: ButtonOrLinkProps) {
  if (href && !buttonProps.disabled) {
    return (
      <Link href={href} className={className} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }
  return (
    <button className={className} aria-label={ariaLabel} {...buttonProps}>
      {children}
    </button>
  );
}
