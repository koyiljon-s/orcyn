"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { IconChevronRight } from '@tabler/icons-react';


export default function Navbar() {

  return (
    <>
      <header className="sticky top-0 z-50 bg-white">
        <div className="max-w-384 mx-auto">
          <div className="flex items-center justify-between py-3 px-6">
            <Link
              href="/"
              aria-label="Orcyn home"
              className="inline-flex items-center justify-self-start"
            >
              <span className="text-black italic gap-2 flex text-3xl md:text-[1.5rem] font-bold tracking-[-0.04em] leading-none">
                orcyn 
                <span className="not-italic text-[#0051ff]">DOCS</span>
              </span>
            </Link>

            <Button
              variant="outline"
              size="default"
              nativeButton={false}
              render={<a href="mailto:hello@orcyn.xyz" />}
              className="text-white text-md"
            >
              Get help
              <IconChevronRight stroke={1.75} />
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}