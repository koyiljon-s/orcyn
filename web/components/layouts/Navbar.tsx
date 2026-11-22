import Link from "next/link";
import Container from "@/components/layouts/Container";
import { sectionLinks } from "@/lib/site";

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-ink/80 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between gap-8">
          <Link
            href="/"
            aria-label="Orcyn home"
            className="rounded-md text-3xl font-bold italic leading-none tracking-[-0.04em] text-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fg"
          >
            orcyn
          </Link>

          <nav aria-label="Primary" className="hidden flex-1 items-center gap-1 md:flex">
            {sectionLinks.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="rounded-md px-3 py-2 text-base font-medium text-fg/80 transition-colors duration-200 hover:text-fg focus-visible:outline-2 focus-visible:outline-fg"
              >
                {label}
              </a>
            ))}
          </nav>

          <a
            href="#waitlist"
            className="inline-flex min-h-11 items-center rounded-full bg-invert px-5 text-base font-semibold text-on-invert transition-colors duration-200 hover:bg-invert/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
          >
            Get early access
          </a>
        </div>
      </Container>
    </header>
  );
}
