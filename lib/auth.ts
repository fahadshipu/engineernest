export const AUTH_COOKIE = "engineernest_admin_token";

const DEFAULT_ADMIN_ALLOWLIST = "fahad.shipu@gmail.com";

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const allowedEmails = (process.env.ADMIN_GOOGLE_ALLOWLIST ?? DEFAULT_ADMIN_ALLOWLIST)
  .split(",")
  .map(normalizeEmail)
  .filter(Boolean);

export const ADMIN_ALLOWED_EMAILS = new Set(allowedEmails.length > 0 ? allowedEmails : [DEFAULT_ADMIN_ALLOWLIST]);

export const isAllowedAdminEmail = (email?: string | null) => {
  if (!email) {
    return false;
  }

  return ADMIN_ALLOWED_EMAILS.has(normalizeEmail(email));
};

const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
};

export const validateGoogleAdminToken = async (accessToken?: string | null) => {
  if (!accessToken) {
    return { ok: false as const, status: 401, message: "Missing access token" };
  }

  const supabase = getSupabaseConfig();
  if (!supabase) {
    return { ok: false as const, status: 500, message: "Supabase environment is not configured" };
  }

  const authorizationHeader = `******;

  const response = await fetch(`${supabase.url}/auth/v1/user`, {
    method: "GET",
    headers: {
      Authorization: authorizationHeader,
      apikey: supabase.anonKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return { ok: false as const, status: 401, message: "Invalid Supabase session token" };
  }

  const user = (await response.json()) as { email?: string };
  if (!isAllowedAdminEmail(user.email)) {
    return { ok: false as const, status: 403, message: "Google account is not allowlisted for admin access" };
  }

  return { ok: true as const, email: user.email ?? "" };
};
