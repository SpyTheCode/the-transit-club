function normalizeSupabaseUrl(value: string) {
  let url = value.trim();
  const quote = url[0];

  if (
    (quote === '"' || quote === "'") &&
    url[url.length - 1] === quote
  ) {
    url = url.slice(1, -1).trim();
  }

  return url.replace(/\/+$/, "");
}

export function getSupabaseConfig() {
  const rawUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!rawUrl || !anonKey) {
    return null;
  }

  const url = normalizeSupabaseUrl(rawUrl);
  if (!url) return null;

  return { url, anonKey };
}
