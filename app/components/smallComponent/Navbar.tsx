"use client"
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

        {/* Desktop menu */}
        <div className="hidden md:flex justify-between items-center">
          <div className="flex space-x-4">
            <Link className="text-white hover:text-gray-300 transition-colors" href="/recipes">Opskrifter</Link>
            <Link className="text-white hover:text-gray-300 transition-colors" href="/weekPlanner">Madplan</Link>
            <Link className="text-white hover:text-gray-300 transition-colors" href="/shoppinglist">Indkøbsliste</Link>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`${
            isMenuOpen ? "block" : "hidden"
          } md:hidden mt-4 space-y-2`}
        >
          <Link
            className="block text-white hover:text-gray-300 transition-colors py-2"
            href="/recipes"
            onClick={() => setIsMenuOpen(false)}
          >
            Opskrifter
          </Link>
          <Link
            className="block text-white hover:text-gray-300 transition-colors py-2"
            href="/weekPlanner"
            onClick={() => setIsMenuOpen(false)}
          >
            Madplan
          </Link>
          <Link
            className="block text-white hover:text-gray-300 transition-colors py-2"
            href="/shoppinglist"
            onClick={() => setIsMenuOpen(false)}
          >
            Indkøbsliste
          </Link>
        </div>
      </div>
    </nav>
  );
}
