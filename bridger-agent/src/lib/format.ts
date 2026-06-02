/**
 * Convert an integer amount in cents to a formatted USD currency string.
 * e.g. -12450 → "-$124.50"
 */
export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

/**
 * Format an ISO 8601 date string as US-style MM/DD/YYYY.
 * e.g. "2025-01-15T00:00:00.000Z" → "01/15/2025"
 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${mm}/${dd}/${yyyy}`;
}
