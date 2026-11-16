"use client";

import { useActionState } from "react";
import {
  joinWaitlistAction,
  type WaitlistActionState,
} from "@/app/transit-club/waitlist/actions";

const initialState: WaitlistActionState = {};

export type WaitlistEventOption = {
  id: string;
  title: string;
  startDate: string;
};

export function WaitlistForm({
  events,
}: {
  events: WaitlistEventOption[];
}) {
  const [state, formAction, pending] = useActionState(
    joinWaitlistAction,
    initialState,
  );

  if (state.success) {
    return (
      <div className="waitlist-success" role="status">
        <p className="portal-eyebrow">THE TRANSIT CLUB / WAITLIST</p>
        <h2>{state.success}</h2>
        <p>We will share the next details when they are ready.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="waitlist-form">
      <div className="waitlist-form-grid">
        <label>
          First name
          <input
            autoComplete="given-name"
            maxLength={80}
            name="firstName"
            required
          />
        </label>
        <label>
          Last name
          <input
            autoComplete="family-name"
            maxLength={80}
            name="lastName"
            required
          />
        </label>
        <label className="waitlist-email">
          Email address
          <input
            autoComplete="email"
            maxLength={254}
            name="email"
            required
            type="email"
          />
        </label>
        {events.length > 0 && (
          <label className="waitlist-email">
            Event (optional)
            <select defaultValue="" name="eventId">
              <option value="">Any upcoming event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title} — {event.startDate}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div className="waitlist-honeypot" aria-hidden="true">
        <label>
          Leave this field empty
          <input
            autoComplete="off"
            name="website"
            tabIndex={-1}
            type="text"
          />
        </label>
      </div>
      {state.error && (
        <p className="waitlist-error" role="alert">
          {state.error}
        </p>
      )}
      <p className="waitlist-rate-note">
        Basic rate limiting is enabled as a best-effort spam measure.
      </p>
      <button
        className="portal-button portal-button-primary"
        disabled={pending}
        type="submit"
      >
        {pending ? "ADDING YOU..." : "JOIN THE WAITLIST"}
      </button>
    </form>
  );
}
