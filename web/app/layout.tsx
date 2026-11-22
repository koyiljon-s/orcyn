import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Geist, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

// Monospace font for the terminal and code snippets.
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const satoshi = localFont({
  src: "../public/fonts/Satoshi_Complete/Fonts/WEB/fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  weight: "300 900",
  style: "normal",
  display: "swap",
});

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
      className={cn(
        "h-full",
        "antialiased",
        satoshi.variable,
        "font-sans",
        geist.variable,
        jetbrains.variable,
      )}
    >
      {/* bg-ink on body too, so overscroll / short pages never flash white */}
      <body className="min-h-full flex flex-col bg-ink text-white">{children}</body>
    </html>
  );
}
