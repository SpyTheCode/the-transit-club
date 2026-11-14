import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export default function NotFound() {
  return (
    <main className="auth-page">
      <section className="dashboard-panel">
        <p className="eyebrow">{siteConfig.brands.malak}</p>
        <h1>Page not found.</h1>
        <p>This address may have changed, or the page may no longer exist.</p>
        <Link className="button button-primary" href="/">
          Return home
        </Link>
      </section>
    </main>
  );
}
