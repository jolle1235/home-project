"use client";
import Link from "next/link";
import { useState } from "react";

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-900 p-4 shadow-md sticky">
      <div className="container mx-auto">
        {/* Mobile menu button */}
        <div className="flex justify-between items-center md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white p-2"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
          <span className="text-white font-semibold">Home Project</span>
        </div>

        <div className={`${isMenuOpen ? "block" : "hidden"} md:block`}>
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
            <Link
              className="text-white hover:text-gray-300 transition-colors py-2 md:py-0"
              href="/recipes"
              onClick={() => setIsMenuOpen(false)}
            >
              Opskrifter
            </Link>
            <Link
              className="text-white hover:text-gray-300 transition-colors py-2 md:py-0"
              href="/weekPlanner"
              onClick={() => setIsMenuOpen(false)}
            >
              Madplan
            </Link>
            <Link
              className="text-white hover:text-gray-300 transition-colors py-2 md:py-0"
              href="/drinks"
              onClick={() => setIsMenuOpen(false)}
            >
              Drinks
            </Link>
            <Link
              className="text-white hover:text-gray-300 transition-colors py-2 md:py-0"
              href="/admin"
              onClick={() => setIsMenuOpen(false)}
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
