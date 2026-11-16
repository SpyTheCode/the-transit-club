import { Suspense } from "react";
import { PortalShell } from "@/components/portal-shell";
import {
  WaitlistForm,
  type WaitlistEventOption,
} from "@/components/waitlist-form";
import { getUpcomingEvents, upcomingEventsPlaceholder } from "@/lib/events";
import { formatDate } from "@/lib/format-date";

async function WaitlistContent() {
  const events = await getUpcomingEvents();
  const eventOptions: WaitlistEventOption[] = events
    .filter(
      (event): event is typeof event & { start_date: string } =>
        event.id !== upcomingEventsPlaceholder.id &&
        event.start_date !== null &&
        Number.isFinite(Date.parse(event.start_date)),
    )
    .map((event) => ({
      id: event.id,
      title: event.title,
      startDate: formatDate(new Date(event.start_date)),
    }));

  return (
    <WaitlistForm events={eventOptions} />
  );
}

export default function TransitClubWaitlistPage() {
  return (
    <PortalShell theme="club" title="THE TRANSIT CLUB / WAITLIST">
      <section className="portal-hero portal-hero-small">
        <div>
          <p className="portal-eyebrow">THE TRANSIT CLUB / WAITLIST</p>
          <h1>Keep a place open.</h1>
        </div>
      </section>
      <section className="portal-panel waitlist-panel">
        <p>Leave your details. We will share the next call when it is ready.</p>
        <Suspense
          fallback={
            <div className="club-state" role="status">
              <p>Preparing the waitlist.</p>
            </div>
          }
        >
          <WaitlistContent />
        </Suspense>
      </section>
    </PortalShell>
  );
}
