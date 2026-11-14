import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import {
  getUpcomingEvents,
  upcomingEventsPlaceholder,
  type UpcomingEvent,
} from "@/lib/events";
import { formatDate, formatDateRange } from "@/lib/format-date";
import { EVENT_DATE_PLACEHOLDER } from "@/lib/site-config";

function eventDateLabel(event: UpcomingEvent) {
  if (event.start_date && event.end_date) {
    return formatDateRange(new Date(event.start_date), new Date(event.end_date));
  }
  if (event.start_date) return formatDate(new Date(event.start_date));
  if (event.end_date) return formatDate(new Date(event.end_date));
  return EVENT_DATE_PLACEHOLDER;
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
              {event.destination && (
                <p className="event-destination">{event.destination}</p>
              )}
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
  return <EventCards events={[upcomingEventsPlaceholder]} />;
}
