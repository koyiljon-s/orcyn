import Link from "next/link";
import Container from "@/components/layouts/Container";
import Logo from "@/components/layouts/Logo";
import { sectionLinks } from "@/lib/site";
import { buttonPrimary } from "@/lib/styles";

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-page">
      <Container className="flex h-16 items-center justify-between gap-2 sm:gap-4 lg:gap-8">
        <Link href="/" aria-label="Orcyn home">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden flex-1 font-medium items-center gap-1 md:flex">
          {sectionLinks.map(({ label, href }) => (
            <a key={href} href={href} className="whitespace-nowrap px-2 py-2 text-[15px] lg:px-3 text-muted-fg transition-colors duration-200 hover:text-fg">
              {label}
            </a>
          ))}
        </nav>

        <a href="#waitlist" className={buttonPrimary}>
          Get early access <span aria-hidden="true">↗</span>
        </a>
      </Container>
    </header>
  );
}
