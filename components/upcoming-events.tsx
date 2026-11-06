import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import {
  getUpcomingEvents,
  retreatPlaceholder,
  type UpcomingEvent,
} from "@/lib/events";
import { formatDateRange } from "@/lib/format-date";

function eventDateLabel(event: UpcomingEvent) {
  if (event.date_label) return event.date_label;
  if (event.start_date && event.end_date) {
    return formatDateRange(new Date(event.start_date), new Date(event.end_date));
  }
  return "Dates to be announced";
}

function EventCards({ events }: { events: UpcomingEvent[] }) {
  return (
    <>
      {events.map((event, index) => (
        <Reveal className="event-reveal" delay={index * 70} key={event.id}>
          <article className="event-card">
            <div className="event-index">
              {String(index + 1).padStart(2, "0")}
            </div>
            <div className="event-main">
              <p className="event-date">{eventDateLabel(event)}</p>
              <h3>{event.title}</h3>
              <p className="event-destination">{event.destination}</p>
            </div>
            <p className="event-description">
              {event.description ||
                "A gathering for explorers and the in-between."}
            </p>
            <div className="event-action">
              {event.status === "open_for_payment" ? (
                <Link
                  aria-label={`Join ${event.title}`}
                  className="button button-primary"
                  href="/auth/sign-up"
                >
                  Join this gathering
                  <ArrowUpRight aria-hidden="true" size={15} />
                </Link>
              ) : (
                <span className="event-view-only">Details coming soon</span>
              )}
            </div>
          </article>
        </Reveal>
      ))}
    </>
  );
}

export async function UpcomingEvents() {
  const events = await getUpcomingEvents();
  return <EventCards events={events} />;
}

export function UpcomingEventsFallback() {
  return <EventCards events={[retreatPlaceholder]} />;
}
