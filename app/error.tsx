"use client";

import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="auth-page">
      <section className="dashboard-panel" role="alert">
        <p className="eyebrow">{siteConfig.brands.malak}</p>
        <h1>We hit a snag.</h1>
        <p>
          This page did not load as expected. Please try again or return home.
        </p>
        <button className="button button-primary" onClick={reset} type="button">
          Try again
        </button>
        <p>
          <Link className="text-link" href="/">
            Return home
          </Link>
        </p>
      </section>
    </main>
  );
}
