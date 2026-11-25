import Container from "@/components/layouts/Container";
import Logo from "@/components/layouts/Logo";
import { sectionLinks, site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-page">
      <Container className="flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="text-sm text-muted-fg">{site.tagline}</p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          {sectionLinks.map(({ label, href }) => (
            <a key={href} href={href} className="text-sm text-muted-fg transition-colors duration-200 hover:text-fg">
              {label}
            </a>
          ))}
          {site.contactEmail && (
            <a href={`mailto:${site.contactEmail}`} className="text-sm text-muted-fg transition-colors duration-200 hover:text-fg">
              Contact
            </a>
          )}
        </nav>

        <p className="text-sm text-muted-fg">&copy; 2026 orcyn.xyz</p>
      </Container>
    </footer>
  );
}
