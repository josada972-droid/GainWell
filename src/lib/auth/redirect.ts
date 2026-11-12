/**
 * Redirect destination whitelist. Only in-app, origin-relative paths are
 * allowed, so a crafted `?next=https://evil.example` or `?next=//evil.example`
 * can never turn a login or confirmation redirect into an open redirect.
 */
export function safeRedirectPath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const path = raw.trim();
  if (!path || path.length > 512) return null;
  // Must be a path: starts with a single slash, never a scheme or protocol
  // relative URL, never encoded or raw control characters.
  if (!path.startsWith("/")) return null;
  if (path.startsWith("//") || path.startsWith("/\\")) return null;
  if (/[<>"'\\^`{}\r\n\t]/.test(path)) return null;
  if (/%2f|%5c/i.test(path)) return null;
  return path;
}
