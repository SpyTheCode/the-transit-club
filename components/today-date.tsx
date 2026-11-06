"use client";

import { useSyncExternalStore } from "react";
import { formatDate } from "@/lib/format-date";

function subscribe(onChange: () => void) {
  const interval = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(interval);
}

function getSnapshot() {
  return formatDate(new Date());
}

function getServerSnapshot() {
  return "";
}

export function TodayDate() {
  const today = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return <time aria-label="Current date">{today}</time>;
}
