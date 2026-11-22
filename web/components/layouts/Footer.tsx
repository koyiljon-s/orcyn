import Container from "@/components/layouts/Container";
import { sectionLinks, site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink">
      <Container className="flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <span className="text-2xl font-bold italic leading-none tracking-[-0.04em]">orcyn</span>
          <p className="text-sm text-subtle">{site.tagline}</p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          {sectionLinks.map(({ label, href }) => (
            <a key={href} href={href} className="text-sm text-subtle transition-colors duration-200 hover:text-fg">
              {label}
            </a>
          ))}
          {site.contactEmail && (
            <a href={`mailto:${site.contactEmail}`} className="text-sm text-subtle transition-colors duration-200 hover:text-fg">
              Contact
            </a>
          )}
        </nav>

        <p className="text-sm text-subtle">&copy; 2026 orcyn.xyz</p>
      </Container>
    </footer>
  );
}
