import Link from "next/link";
import Logo from "@/components/layouts/Logo";
import MobileMenu from "@/components/layouts/MobileMenu";
import { sectionLinks } from "@/lib/site";

/** Pink bar, then a header over the hero: links left, logo centered, call to action right. */
export default function Navbar() {
  return (
    <div className="relative z-20">
      <p className="bg-pink px-5 py-2 text-center text-[13px] uppercase text-[#00050a]">Early access · SP1 proving API</p>
      <header className="tone-night absolute inset-x-0 top-full text-fg">
        <div className="flex h-16 items-center justify-between gap-4 px-5 sm:px-8 lg:grid lg:grid-cols-3">
          <nav aria-label="Primary" className="order-2 hidden items-center gap-4 md:flex lg:order-1 lg:gap-5">
            {sectionLinks.map(({ label, href }) => (
              <a key={href} href={href} className="whitespace-nowrap py-2 text-[13px] uppercase text-fg hover:text-white">
                {label}
              </a>
            ))}
          </nav>
          <Link href="/" aria-label="Orcyn home" className="order-1 lg:order-2 lg:justify-self-center">
            <Logo />
          </Link>
          <a href="#waitlist" className="order-3 inline-flex min-h-11 items-center justify-self-end max-md:ml-auto whitespace-nowrap text-[13px] uppercase text-[#ff6fdc] hover:text-white">
            Get early access
          </a>
          <MobileMenu />
        </div>
      </header>
    </div>
  );
}
