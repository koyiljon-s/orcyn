"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { sectionLinks } from "@/lib/site";

/** Section links for phones. Closes on choosing a link or pressing Escape. */
export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const Icon = open ? X : Menu;

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="order-4 md:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(!open)}
        className="-mr-3 flex size-11 cursor-pointer items-center justify-center text-fg"
      >
        <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
      </button>
      <nav
        id="mobile-menu"
        aria-label="Sections"
        hidden={!open}
        className="absolute inset-x-0 top-full border-y border-line bg-page px-5"
      >
        {sectionLinks.map(({ label, href }) => (
          <a
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className="flex min-h-13 items-center border-b border-line text-[15px] uppercase text-fg last:border-b-0"
          >
            {label}
          </a>
        ))}
      </nav>
    </div>
  );
}
