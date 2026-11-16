# MALAK

A Next.js App Router site built with TypeScript and Tailwind CSS.

## Run locally

1. Install [Node.js](https://nodejs.org/) if it is not already on your computer.
2. Open a terminal in this project folder.
3. Run `npm install` to install the project dependencies.
4. Run `npm run dev` to start the local preview.
5. Visit [http://localhost:3000](http://localhost:3000) in your browser. Press
   **Ctrl+C** in the terminal to stop the preview.

The date labels use `lib/format-date.ts`. The logo and gallery images are in
`public/logo` and `public/images`.

## Site structure

- `/` is the Nexus gateway between MALAK and THE TRANSIT CLUB.
- `/malak` and `/malak/services` introduce the brand and its services.
- `/malak/products`, `/malak/products/[slug]`, and
  `/malak/category/[slug]` show the product catalog.
- `/transit-club` contains the events, gallery, ripple, and road scene.
- `/transit-club/archive` displays published archive items, and
  `/transit-club/waitlist` accepts waitlist entries.

The MALAK logo is `public/logo/malak-logo.jpg`; the community logo is
`public/logo/transit-club-logo.png`. The original files remain in the logo
folder.

## Environment variables

Copy `.env.example` to `.env.local` and add your service credentials there.
Never commit `.env` or `.env.local`; `.env.example` contains names only.

For sign-up, email verification, password reset, and protected pages, set:

- `SUPABASE_URL`: your Supabase project URL.
- `SUPABASE_ANON_KEY`: the project's public/anon key. This is safe to use with
  the Supabase RLS policies; never put the service-role key in browser code.
- `NEXT_PUBLIC_SITE_URL`: `http://localhost:3000` for local development, or
  your production HTTPS URL after deployment.

Run `npm run check:supabase` to confirm the required environment variables,
check the project URL format, and make a read-only request to the public
`events` table. It reports status only and never prints credentials or the URL.

In Supabase, open **Authentication → URL Configuration**. Set the Site URL to
your current site URL, and add these Redirect URLs:

- `http://localhost:3000/auth/callback`
- `https://your-domain.example/auth/callback` (replace with your real domain)

Under **Authentication → Sign In / Providers → Email**, make sure email
confirmation is enabled so new accounts must verify their address.

Email verification and password-reset links return through `/auth/callback`.
The callback sends members to `/dashboard`, sub-admins to `/staff`, admins to
`/admin`, and password-reset links to `/auth/update-password`.
For production, also add the production callback URL to the Supabase redirect
allowlist and set `NEXT_PUBLIC_SITE_URL` to the exact public site origin.

The public event list reads from the `events` table. Add event details and dates
to that table; there is no hardcoded retreat or date. If no events are
available, the site shows `DATE TO BE ANNOUNCED`. Only `open_for_payment`
events show a sign-up link; view-only events do not.

Site names and contact links are held in `lib/site-config.ts`. The MALAK
Instagram URL and order WhatsApp number are intentionally empty until provided.

## Product catalog setup

The catalog requires the existing base schema first because it reuses the
`public.is_admin()` permission function.

1. In the Supabase Dashboard, open **SQL Editor → New query**.
2. If the base website schema has not been installed, run the full
   [`supabase/schema.sql`](./supabase/schema.sql) first. Do not run this step
   again if the existing tables and `public.is_admin()` function are already
   in place.
3. Open another **New query**, paste the full contents of
   [`supabase/schema-shop.sql`](./supabase/schema-shop.sql), and click **Run**.
   The script creates the product tables, category seeds, starter products,
   access policies, and the public `product-images` storage bucket.
4. In **Table Editor**, confirm that `categories` contains five rows,
   `products` contains eight starter rows, and `product_images` contains eight
   static-image records. The eight public images are files already under
   `public/images`; the two MALAK landing-page photos under
   `public/images/malak` are not products.
5. In **Storage → product-images**, confirm the bucket is public, allows JPG,
   PNG, and WebP files, and has a 5 MB file-size limit. The SQL policies allow
   public reads and restrict file changes to admins.
6. Visit `/malak/products` to confirm the published starter catalog appears.
   Uploaded product photos appear in the public catalog after the product is
   published.

Product prices are entered in naira in the admin screen and saved as integer
kobo. Product ordering is not enabled yet; the order button stays hidden until
the MALAK WhatsApp number is added in `lib/site-config.ts`.

## Archive and waitlist setup

The archive and waitlist schema requires the base schema (`events`,
`public.is_admin()`, and `public.set_updated_at()`).

1. In Supabase Dashboard → **SQL Editor**, open a new query.
2. Paste the full contents of [`supabase/schema-archive.sql`](./supabase/schema-archive.sql)
   and click **Run**. No archive items are seeded.
3. In **Table Editor**, confirm `archive_items` and `waitlist_entries` exist.
   The archive table should be empty. Confirm waitlist row-level security is on;
   the public can insert, but only admins can read rows.
4. In **Storage → archive-images**, confirm the bucket is public-read, allows
   JPG, PNG, and WebP files, and has a 5 MB file-size limit. The SQL policies
   restrict uploads and deletes to admins.
5. Test `/transit-club/archive`, `/transit-club/waitlist`, and (as an admin)
   `/admin/archive` and `/admin/waitlist`.

The waitlist stores first name, last name, email, optional event id, and the
database-generated creation time. Rate limiting is best effort because it uses
short-lived server memory and is not shared across server instances.

## Supabase database

1. Sign in to the Supabase dashboard and open your project.
2. Before running the schema, create the Auth user for
   `Viamalak.com@gmail.com` under **Authentication → Users → Add user**. Verify
   the email address. If you have not created or verified this account yet, the
   SQL script still creates the schema and tells you to rerun its admin seed
   block after verification.
3. Open **SQL Editor → New query**, then paste the entire contents of
   [`supabase/schema.sql`](./supabase/schema.sql) and click **Run**.
4. If you created the admin after running the script, select and run only its
   final `DO $$ ... $$;` block again from the SQL Editor.

Events and fees are publicly readable; only the admin can change them.
Authenticated users can read their own orders, attendees, payments, and
tickets. Orders, attendees, payment records, and tickets have no client write
policies: create or update them only from a trusted server using the Supabase
service-role key, after verifying the payment with Paystack. Never put that key
in browser code. Monetary columns are integer minor units (for NGN, kobo).
Sub-admins currently have no extra database permissions.

Sign-up and password-reset actions use server-side Supabase clients. The
`proxy.ts` check verifies sessions before protected URLs are rendered, and
server layouts/pages independently verify the session and database role.

## Production build

Run `npm run build` to create the production build and `npm run start` to serve
that build locally.
