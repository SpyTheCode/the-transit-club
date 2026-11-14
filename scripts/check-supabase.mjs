import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

const silentLogger = {
  info() {},
  error() {},
};

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production", silentLogger);

const requiredVariables = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SITE_URL",
];
const present = Object.fromEntries(
  requiredVariables.map((name) => [
    name,
    Boolean(process.env[name]?.trim()),
  ]),
);

function normalizeUrl(value) {
  let url = value.trim();
  const quote = url[0];

  if ((quote === '"' || quote === "'") && url.at(-1) === quote) {
    url = url.slice(1, -1).trim();
  }

  return url.replace(/\/+$/, "");
}

let parsedUrl;
if (present.SUPABASE_URL) {
  try {
    parsedUrl = new URL(normalizeUrl(process.env.SUPABASE_URL));
  } catch {
    parsedUrl = undefined;
  }
}

const validUrlFormat = Boolean(
  parsedUrl &&
    parsedUrl.protocol === "https:" &&
    /^[a-z0-9-]+\.supabase\.co$/i.test(parsedUrl.hostname) &&
    parsedUrl.pathname === "/" &&
    !parsedUrl.search &&
    !parsedUrl.hash,
);

let httpStatus;
if (validUrlFormat && present.SUPABASE_ANON_KEY) {
  const endpoint = new URL("/rest/v1/events", parsedUrl.origin);
  endpoint.searchParams.set("select", "id");
  endpoint.searchParams.set("limit", "1");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const key = process.env.SUPABASE_ANON_KEY;
    const response = await fetch(endpoint, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      signal: controller.signal,
      cache: "no-store",
    });
    httpStatus = response.status;
  } catch {
    httpStatus = undefined;
  } finally {
    clearTimeout(timeout);
  }
}

for (const name of requiredVariables) {
  console.log(`${name} exists: ${present[name] ? "yes" : "no"}`);
}
console.log(
  `SUPABASE_URL is HTTPS with a *.supabase.co host and empty path: ${validUrlFormat ? "yes" : "no"}`,
);
console.log(`Events table HTTP status: ${httpStatus ?? "unavailable"}`);

let verdict;
if (!present.SUPABASE_URL || !present.SUPABASE_ANON_KEY) {
  verdict =
    "Set the missing Supabase URL or publishable key, then run this check again.";
} else if (!validUrlFormat) {
  verdict =
    "Use the HTTPS Supabase project URL with no path, query, or fragment.";
} else if (httpStatus === undefined) {
  verdict =
    "The events endpoint could not be reached; check internet access and Supabase project availability.";
} else if (httpStatus >= 200 && httpStatus < 300) {
  verdict = present.NEXT_PUBLIC_SITE_URL
    ? "The events endpoint is reachable."
    : "The events endpoint is reachable, but NEXT_PUBLIC_SITE_URL is missing for authentication links.";
} else if (httpStatus === 401 || httpStatus === 403) {
  verdict =
    "Supabase rejected the publishable key or public read access; check the API key and events-table permissions.";
} else if (httpStatus === 404) {
  verdict =
    "The events endpoint was not found; check the project URL and whether public.events exists.";
} else if (httpStatus === 400) {
  verdict =
    "Supabase rejected the events request; check the table name and API schema exposure.";
} else {
  verdict = `Supabase returned HTTP ${httpStatus}; check the project API status and events-table permissions.`;
}

console.log(`Verdict: ${verdict}`);

if (
  !present.SUPABASE_URL ||
  !present.SUPABASE_ANON_KEY ||
  !present.NEXT_PUBLIC_SITE_URL ||
  !validUrlFormat ||
  httpStatus === undefined ||
  httpStatus < 200 ||
  httpStatus >= 300
) {
  process.exitCode = 1;
}
