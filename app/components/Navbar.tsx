"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  ShoppingCart,
  Settings,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  // The paths that count as this page.
  match: string[];
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/recipes",
    label: "Opskrifter",
    icon: BookOpen,
    match: ["/recipes", "/add-recipe"],
  },
  {
    href: "/shoppinglist",
    label: "Indkøbsliste",
    icon: ShoppingCart,
    match: ["/shoppinglist"],
  },
  {
    href: "/weekPlanner",
    label: "Madplan",
    icon: CalendarDays,
    match: ["/weekPlanner"],
  },
  { href: "/admin", label: "Indstillinger", icon: Settings, match: ["/admin"] },
];

const linkBaseClasses =
  "flex flex-col items-center justify-center gap-1 text-xs sm:text-sm py-2 px-3 rounded-lg transition-colors duration-200";

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="bg-background shadow-md sticky top-0 z-40 border-b border-secondary/30">
      <div className="flex justify-around max-w-xl mx-auto py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
          const isActive = match.some((path) => pathname?.startsWith(path));
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className={`${linkBaseClasses} ${
                isActive
                  ? "bg-secondary text-foreground shadow-md"
                  : "text-foreground hover:bg-secondary-hover hover:text-foreground/90"
              } group`}
            >
              <Icon className="w-6 h-6 sm:w-5 sm:h-5" />
              <span className="hidden md:inline-flex text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
