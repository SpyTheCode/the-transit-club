import type { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
    icon: "/logo/transit-club-logo.png",
  },
};

export default function TransitClubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
