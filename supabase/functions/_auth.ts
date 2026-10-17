// Shared caller checks for edge functions that run with verify_jwt off.
// verify_jwt stays off so these keep working after the project moves to the
// new publishable/secret keys; the check lives here in code instead.
import { createClient, SupabaseClient, User } from "https://esm.sh/@supabase/supabase-js@2";

export type Caller =
  | { kind: "user"; user: User; isAdmin: boolean }
  | { kind: "service" };

const bearer = (req: Request) =>
  (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();

// Constant-time string compare so secrets can't be guessed byte by byte.
export const safeEqual = (a: string, b: string) => {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

// Returns the signed-in app user (or a server-to-server caller holding the
// service key), or null. Anon keys and expired/forged tokens return null.
// deno-lint-ignore no-explicit-any
export async function getCaller(req: Request, admin: SupabaseClient<any, any, any>): Promise<Caller | null> {
  const token = bearer(req);
  if (!token) return null;

  const serviceKeys = [
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    ...(Deno.env.get("SUPABASE_SECRET_KEYS") ? Object.values(safeJson(Deno.env.get("SUPABASE_SECRET_KEYS")!)) : []),
  ].filter(Boolean) as string[];
  if (serviceKeys.some((k) => safeEqual(token, k))) return { kind: "service" };

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return null;

  const { data: row } = await admin
    .from("users")
    .select("is_admin, is_owner")
    .eq("id", data.user.id)
    .maybeSingle();

  return { kind: "user", user: data.user, isAdmin: !!(row?.is_admin || row?.is_owner) };
}

function safeJson(s: string): Record<string, string> {
  try {
    const v = JSON.parse(s);
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

export const adminClient = () =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
