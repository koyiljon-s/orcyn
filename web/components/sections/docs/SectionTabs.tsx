"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";

const tabs = [
  { label: "Get Started", href: "/docs/get-started" },
  { label: "Guides", href: "/docs/guides" },
  { label: "API Reference", href: "/docs/api-reference" },
  { label: "Learn", href: "/docs/learn" },
  { label: "Resources", href: "/docs/resources" },
];

export default function SectionTabs() {
  const pathname = usePathname();

  return (
    <div className="border-b border-[#edf1f5] bg-white">
      <nav
        aria-label="Documentation sections"
        className="mx-auto flex max-w-384 items-center gap-6 px-6"
      >
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "-mb-px border-b py-1.5 text-[15px] font-medium transition-colors",
                isActive
                    ? "border-[#004bed] text-[#004bed]"
                    : "border-transparent text-[#26282e] hover:border-[#004bed]",
                )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
