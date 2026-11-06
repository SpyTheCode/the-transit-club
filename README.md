# The Transit Club

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

## Environment variables

Copy `.env.example` to `.env.local` and add your service credentials there.
Never commit `.env` or `.env.local`; `.env.example` contains names only.

For sign-up, email verification, password reset, and protected pages, set:

- `SUPABASE_URL`: your Supabase project URL.
- `SUPABASE_ANON_KEY`: the project's public/anon key. This is safe to use with
  the Supabase RLS policies; never put the service-role key in browser code.
- `NEXT_PUBLIC_SITE_URL`: `http://localhost:3000` for local development, or
  your production HTTPS URL after deployment.

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

The public event list reads from the `events` table. Until an upcoming event is
added, it shows the retreat at Epe with the requested unconfirmed date
placeholder. The event status controls its call to action: only
`open_for_payment` events show a sign-up link; view-only events do not.

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
