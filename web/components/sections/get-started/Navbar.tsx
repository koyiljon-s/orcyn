"use client";

import Link from "next/link";


export default function Navbar() {

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-[1fr_auto] md:grid-cols-[auto_auto_1fr] items-center py-3.75">
            <Link
              href="/"
              aria-label="Orcyn home"
              className="inline-flex items-center justify-self-start"
            >
              <span className="text-[#1e2026] italic flex text-3xl md:text-[2.02rem] font-bold tracking-[-0.04em] leading-none py-2">
                orcyn
              </span>
            </Link>
            
          </div>
        </div>
      </header>
    </>
  );
}