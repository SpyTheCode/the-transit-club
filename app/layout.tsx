import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Transit Club — Made for the way there",
  description:
    "Independent everyday goods inspired by the places, people and journeys that move us.",
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
