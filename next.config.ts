import type { NextConfig } from "next";

function getSupabaseImageHostname() {
  const value = process.env.SUPABASE_URL?.trim().replace(/^["']|["']$/g, "");
  if (!value) return undefined;

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.hostname : undefined;
  } catch {
    return undefined;
  }
}

const supabaseImageHostname = getSupabaseImageHostname();

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    qualities: [50, 55, 65, 68, 70, 72, 75],
    remotePatterns: supabaseImageHostname
      ? ["product-images", "archive-images"].map((bucket) => ({
          protocol: "https" as const,
          hostname: supabaseImageHostname,
          pathname: `/storage/v1/object/public/${bucket}/**`,
        }))
      : [],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "27mb",
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), geolocation=(), microphone=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
