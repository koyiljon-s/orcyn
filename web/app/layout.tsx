import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

// Headings and body.
const satoshi = localFont({
  src: [
    { path: "../public/fonts/Satoshi_Complete/Fonts/WEB/fonts/Satoshi-Variable.woff2", weight: "300 900", style: "normal" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

// Labels, tags and code.
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
    siteName: site.name,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased font-sans", satoshi.variable, geistMono.variable)}
    >
      <body className="min-h-full flex flex-col bg-page text-fg">{children}</body>
    </html>
  );
}
