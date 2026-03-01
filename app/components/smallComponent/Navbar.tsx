"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  ShoppingCart,
  Martini,
  Shield,
} from "lucide-react";

export default function NavBar() {
  const pathname = usePathname();

  const linkBaseClasses =
    "flex flex-col items-center justify-center gap-1 text-xs sm:text-sm py-1 px-2 transition-colors";

  const makeLinkClasses = (href: string) => {
    const isActive = pathname?.startsWith(href);
    return [
      linkBaseClasses,
      isActive ? "text-action" : "text-white hover:text-gray-300",
    ]
      .filter(Boolean)
      .join(" ");
  };

  return (
    <nav className="bg-gray-900 p-2 shadow-md sticky top-0 z-40">
      <div className="flex justify-around max-w-xl mx-auto">
        <Link
          href="/recipes"
          aria-label="Opskrifter"
          className={`${makeLinkClasses("/recipes")} group`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="hidden md:inline-flex text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            Opskrifter
          </span>
        </Link>
        <Link
          href="/weekPlanner"
          aria-label="Madplan"
          className={`${makeLinkClasses("/weekPlanner")} group`}
        >
          <CalendarDays className="w-5 h-5" />
          <span className="hidden md:inline-flex text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            Madplan
          </span>
        </Link>
        <Link
          href="/shoppinglist"
          aria-label="Indkøbsliste"
          className={`${makeLinkClasses("/shoppinglist")} group`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="hidden md:inline-flex text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            Indkøbsliste
          </span>
        </Link>
        <Link
          href="/drinks"
          aria-label="Drinks"
          className={`${makeLinkClasses("/drinks")} group`}
        >
          <Martini className="w-5 h-5" />
          <span className="hidden md:inline-flex text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            Drinks
          </span>
        </Link>
        <Link
          href="/admin"
          aria-label="Admin"
          className={`${makeLinkClasses("/admin")} group`}
        >
          <Shield className="w-5 h-5" />
          <span className="hidden md:inline-flex text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            Admin
          </span>
        </Link>
      </div>
    </nav>
  );
}
