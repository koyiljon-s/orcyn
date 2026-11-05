"use client";

import { useState } from "react";
import Link from "next/link";


const navLinks = [
  { label: "Whitepaper", href: "/whitepaper" },
  { label: "Solutions", href: "/solutions" },
  { label: "Technology", href: "/technology" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#02090a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-[1fr_auto] md:grid-cols-[auto_auto_1fr] items-center gap-8 py-3.75">
            <Link
              href="/"
              aria-label="Orcyn home"
              className="inline-flex items-center justify-self-start"
            >
              <span className="text-white italic flex text-3xl md:text-[2.02rem] font-bold tracking-[-0.04em] leading-none">
                orcyn
              </span>
            </Link>

            <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-6 justify-self-start">
              {navLinks.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-white font-medium text-lg px-1.5 py-1 rounded hover:text-[#9898a3] transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3 justify-self-end">
              <Link
                href="/get-started"
                className="hidden sm:inline-flex items-center gap-1.5 border-2 border-[#36f5a2] hover:bg-white hover:text-[#171717] hover:border-white text-white font-medium text-lg rounded-full px-4 py-2 transition-colors"
              >
                Get started
              </Link>
              <button
                aria-label="Open navigation menu"
                onClick={() => setMobileOpen(true)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded text-[#061a30] hover:bg-black/5 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}