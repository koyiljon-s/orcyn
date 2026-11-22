/** Site-wide content and settings, kept in one place. */

export const site = {
  name: "Orcyn",
  url: "https://orcyn.xyz",
  tagline: "ZK proving infrastructure for SP1",
  description:
    "Orcyn is a proving API for SP1 programs. Send a program and its input, get back a verified zero-knowledge proof — no GPU cluster to run.",

  // Read at build time (NEXT_PUBLIC_*). Empty string = not configured.
  waitlistEndpoint: process.env.NEXT_PUBLIC_WAITLIST_ENDPOINT ?? "",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
} as const;

/** Navbar and footer links: sections on the home page. */
export const sectionLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Use cases", href: "#use-cases" },
  { label: "Roadmap", href: "#roadmap" },
] as const;
