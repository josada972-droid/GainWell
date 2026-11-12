/**
 * Maps Supabase Auth errors to message keys in the `auth` namespace. The
 * mapping is intentionally coarse: user-facing text must not leak whether an
 * email exists beyond what Supabase itself reveals, and must never echo
 * server internals. Unknown codes collapse to a generic failure.
 */
export function authErrorKey(error: unknown): string {
  if (error === null || typeof error !== "object") return "unexpected";
  const code = "code" in error ? String(error.code) : "";
  const status = "status" in error ? Number(error.status) : 0;

  switch (code) {
    case "invalid_credentials":
    case "user_not_found":
    case "user_banned":
      return "invalidCredentials";
    case "user_already_exists":
    case "email_exists":
      return "emailTaken";
    case "email_not_confirmed":
      return "emailNotConfirmed";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "rateLimited";
    case "weak_password":
      return "weakPassword";
    case "refresh_token_not_found":
    case "session_not_found":
      return "sessionExpired";
    default:
      break;
  }

  // Older servers send HTTP status codes without a stable `code`.
  if (status === 400) return "invalidCredentials";
  if (status === 422) return "emailTaken";
  if (status === 429) return "rateLimited";

  return "unexpected";
}
