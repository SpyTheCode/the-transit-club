import type { Metadata } from "next";
import { IBM_Plex_Mono, Oswald } from "next/font/google";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const industrial = Oswald({
  subsets: ["latin"],
  variable: "--font-industrial",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${siteConfig.brands.gateway} — ${siteConfig.brands.malak}`,
  description:
    "Two connected worlds: MALAK objects and THE TRANSIT CLUB community.",
  icons: {
    icon: "/logo/malak-logo.jpg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html className={`${industrial.variable} ${mono.variable}`} lang="en">
      <body>{children}</body>
    </html>
  );
}
