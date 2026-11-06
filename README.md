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

## Production build

Run `npm run build` to create the production build and `npm run start` to serve
that build locally.
