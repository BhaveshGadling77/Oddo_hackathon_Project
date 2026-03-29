// ─── formatCurrency.js ───────────────────────────────────────────────────────
export const formatCurrency = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style:                 "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);

export const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day:   "numeric",
        year:  "numeric",
      })
    : "—";

export const initials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
