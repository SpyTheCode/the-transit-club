import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Transit Club — Made for the way there",
  description:
    "An experiential arm and collective archive by Malak. A community for explorers, nomads, and the space between destinations.",
  icons: {
    icon: "/logo/logo.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
