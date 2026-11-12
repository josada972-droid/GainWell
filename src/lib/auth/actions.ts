"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { authErrorKey } from "@/lib/auth/errors";
import { safeRedirectPath } from "@/lib/auth/redirect";
import {
  forgotPasswordSchema,
  localeSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/auth/schemas";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";

/**
 * All auth mutations run here, server-side, through the server client.
 * Forms never talk to Supabase directly, so the access token never leaves the
 * server-managed cookies and every input passes Zod before it reaches Auth.
 * Messages are i18n keys (see messages/*.json → auth.errors / auth.notices).
 *
 * The locale comes from the page as a validated hidden field: next-intl's
 * request config (getLocale) is not available inside Server Actions under
 * Cache Components, because it reads next/root-params.
 *
 * Password-reset responses are deliberately identical for known and unknown
 * emails: the same success notice regardless of account existence.
 */
export type AuthFormState = {
  errorKey?: string;
  noticeKey?: string;
  email?: string;
};

function firstIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "unexpected";
}

async function requestOrigin(): Promise<string> {
  const h = await headers();
  return (
    h.get("origin") ??
    `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host") ?? "localhost:3000"}`
  );
}

export async function signUpAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName") ?? "",
    locale: formData.get("locale"),
  });
  if (!parsed.success) {
    return {
      errorKey: firstIssueMessage(parsed.error),
      email: String(formData.get("email") ?? ""),
    };
  }
  const { email, password, displayName, locale } = parsed.data;
  const client = await getSupabaseServerClient();
  if (!client) return { errorKey: "config" };

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${await requestOrigin()}/auth/confirm?type=email`,
      data: {
        display_name: displayName || undefined,
        preferred_language: locale,
      },
    },
  });
  if (error) return { errorKey: authErrorKey(error), email };

  // No session means email confirmation is required: ask the visitor to
  // check their inbox instead of creating UI state around a half-login.
  if (!data.session) return { noticeKey: "confirmEmailSent", email };
  return redirect({ href: "/dashboard", locale });
}

export async function signInAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    locale: formData.get("locale"),
  });
  if (!parsed.success) {
    return {
      errorKey: firstIssueMessage(parsed.error),
      email: String(formData.get("email") ?? ""),
    };
  }
  const { email, password, locale } = parsed.data;
  const client = await getSupabaseServerClient();
  if (!client) return { errorKey: "config" };

  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) return { errorKey: authErrorKey(error), email };

  return redirect({
    href: safeRedirectPath(formData.get("next")) ?? "/dashboard",
    locale,
  });
}

export async function signOutAction(formData: FormData): Promise<void> {
  const client = await getSupabaseServerClient();
  if (client) await client.auth.signOut();
  redirect({ href: "/", locale: localeSchema.parse(formData.get("locale")) });
}

export async function forgotPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
    locale: formData.get("locale"),
  });
  if (!parsed.success) {
    return {
      errorKey: firstIssueMessage(parsed.error),
      email: String(formData.get("email") ?? ""),
    };
  }
  const client = await getSupabaseServerClient();
  if (!client) return { errorKey: "config" };

  const { email, locale } = parsed.data;
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${await requestOrigin()}/auth/confirm?type=recovery&next=/${locale}/reset-password`,
  });
  // Rate-limit problems are real and worth surfacing; everything else
  // (including an unknown address) answers with the same neutral notice.
  if (error && authErrorKey(error) === "rateLimited") {
    return { errorKey: "rateLimited", email };
  }
  return { noticeKey: "resetEmailSent", email };
}

export async function resetPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    locale: formData.get("locale"),
  });
  if (!parsed.success) return { errorKey: firstIssueMessage(parsed.error) };

  const client = await getSupabaseServerClient();
  if (!client) return { errorKey: "config" };

  // Only a visitor holding a recovery session (delivered by /auth/confirm)
  // may set a new password; nothing here trusts a client-sent user id.
  const { data } = await client.auth.getUser();
  if (!data.user) return { errorKey: "sessionExpired" };

  const { error } = await client.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { errorKey: authErrorKey(error) };
  return redirect({ href: "/dashboard", locale: parsed.data.locale });
}
