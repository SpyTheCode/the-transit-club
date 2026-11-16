import Link from "next/link";

export function AdminNavigation() {
  return (
    <nav className="admin-navigation" aria-label="Admin sections">
      <Link href="/admin">OVERVIEW</Link>
      <Link href="/admin/products">PRODUCTS</Link>
    </nav>
  );
}
