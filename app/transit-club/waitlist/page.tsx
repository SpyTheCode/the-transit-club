import { PortalComingSoon } from "@/components/portal-coming-soon";

export default function TransitClubWaitlistPage() {
  return (
    <PortalComingSoon
      theme="club"
      section="THE TRANSIT CLUB / WAITLIST"
      headline="The next call is coming."
      description="The waitlist is not open yet. Check back soon."
      backHref="/transit-club"
      backLabel="BACK TO THE CLUB"
    />
  );
}
