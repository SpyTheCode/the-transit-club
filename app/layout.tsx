import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

export const metadata: Metadata = {
  title: `${siteConfig.brands.malak} — Made for the way there`,
  description:
    "An experiential arm and collective archive by Malak. A community for explorers, nomads, and the space between destinations.",
  icons: {
    icon: "/logo/malak-mark.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
