export const resolveMediaUrl = (raw, apiBaseUrl) => {
  if (!raw || typeof raw !== "string") return null;

  const value = raw.trim();
  if (!value) return null;

  if (/^\d+x\d+$/.test(value)) return null;
  if (/^https?:\/\/\d+x\d+/.test(value)) return null;
  if (value.includes("via.placeholder.com")) return null;
  if (value.includes("placeholder.com")) return null;

  if (value.startsWith("http")) return value;

  const normalized = value.replace(/\\/g, "/");
  const withSlash = normalized.startsWith("/") ? normalized : `/${normalized}`;

  // If the backend stored a local uploads path, prefer same-origin so Vite proxy can serve it.
  // This avoids cross-origin/CSP issues in development.
  if (withSlash.startsWith("/uploads/")) return withSlash;

  return `${apiBaseUrl}${withSlash}`;
};
