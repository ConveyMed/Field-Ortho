import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// delete-user — removes a user's auth account AND their public.users profile.
// Handles two cases from one endpoint:
//   * Self-delete: caller sends no userId → deletes their own account (Apple
//     account-deletion compliance, reached from Profile → Delete Account).
//   * Admin-delete: caller sends { userId } and must be is_admin/is_owner →
//     deletes that user (Manage Users).
// Service role is required because deleting auth.users needs the admin API,
// which a SECURITY DEFINER SQL RPC cannot do. The caller's JWT is verified
// manually against /auth/v1/user (verify_jwt is off, matching the other fns).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
};

serve(async (req) => {
  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // 1. Identify the caller from their session JWT.
    const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
    if (!token) return json(401, { error: "Not authenticated" });

    const meRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: anonKey },
    });
    if (!meRes.ok) return json(401, { error: "Invalid session" });
    const me = await meRes.json();
    const callerId = me?.id;
    if (!callerId) return json(401, { error: "Not authenticated" });

    // 2. Resolve the target. Default = self-delete.
    const body = await req.json().catch(() => ({}));
    let targetId = callerId;

    if (body?.userId && body.userId !== callerId) {
      // Admin-delete: caller must be admin or owner.
      const adminRes = await fetch(
        `${supabaseUrl}/rest/v1/users?id=eq.${callerId}&select=is_admin,is_owner`,
        { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
      );
      const rows = await adminRes.json();
      const caller = Array.isArray(rows) ? rows[0] : null;
      if (!caller || (!caller.is_admin && !caller.is_owner)) {
        return json(403, { error: "Admin access required" });
      }
      targetId = body.userId;
    }

    const svc = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    };

    // 3. Clear the one NO-ACTION reference (nullable) so the profile delete
    //    can't be blocked by it. No-op today (chat unused) but future-proof.
    await fetch(`${supabaseUrl}/rest/v1/chat_members?added_by=eq.${targetId}`, {
      method: "PATCH",
      headers: { ...svc, Prefer: "return=minimal" },
      body: JSON.stringify({ added_by: null }),
    }).catch(() => {});

    // 4. Delete the profile row. Children CASCADE (user_products, chat_*) or
    //    SET NULL (authored chats/messages/products). Service role bypasses RLS.
    const delProfile = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${targetId}`, {
      method: "DELETE",
      headers: { ...svc, Prefer: "return=minimal" },
    });
    if (!delProfile.ok && delProfile.status !== 404) {
      return json(500, { error: "Failed to delete profile", detail: await delProfile.text() });
    }

    // 5. Delete the auth user (removes their ability to log in).
    const delAuth = await fetch(`${supabaseUrl}/auth/v1/admin/users/${targetId}`, {
      method: "DELETE",
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    if (!delAuth.ok && delAuth.status !== 404) {
      return json(500, { error: "Failed to delete auth user", detail: await delAuth.text() });
    }

    return json(200, { success: true });
  } catch (e) {
    return json(500, { error: String((e as Error)?.message || e) });
  }
});
