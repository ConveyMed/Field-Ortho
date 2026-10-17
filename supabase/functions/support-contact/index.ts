import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Public on purpose: the /support page is the store listing's support URL
    // and works signed out. So the input is bounded and the alert goes to
    // admins only, never to every user.
    const { name, email, subject, message, app_name } = await req.json();

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Name, email, and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tooLong =
      [name, email, subject || "", app_name || ""].some((v) => typeof v !== "string" || v.length > 200) ||
      typeof message !== "string" || message.length > 5000;
    if (tooLong || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid name, email, or message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const appLabel = app_name || "ConveyMed App";
    const subjectLine = subject || `Support Request from ${name}`;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Store in support_requests table
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/support_requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        name,
        email,
        subject: subjectLine,
        message,
        app_name: appLabel,
      }),
    });

    if (!insertRes.ok) {
      console.error("Insert failed:", await insertRes.text());
    }

    // Notify admins via OneSignal push (by external_id = app user id, same
    // delivery path as send-push-notification).
    const onesignalAppId = Deno.env.get("ONESIGNAL_APP_ID");
    const onesignalKey = Deno.env.get("ONESIGNAL_REST_API_KEY");

    const adminsRes = await fetch(
      `${supabaseUrl}/rest/v1/users?or=(is_admin.eq.true,is_owner.eq.true)&select=id`,
      { headers: { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` } },
    );
    const admins = adminsRes.ok ? await adminsRes.json() : [];
    const adminIds = Array.isArray(admins) ? admins.map((a: { id: string }) => a.id) : [];

    if (onesignalAppId && onesignalKey && adminIds.length > 0) {
      const pushRes = await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${onesignalKey}`,
        },
        body: JSON.stringify({
          app_id: onesignalAppId,
          include_external_user_ids: adminIds,
          channel_for_external_user_ids: "push",
          headings: { en: `Support: ${appLabel}` },
          contents: { en: `${name}: ${message.substring(0, 100)}` },
          data: { type: "support_request" },
        }),
      });
      if (!pushRes.ok) console.error("Admin push failed:", pushRes.status, await pushRes.text());
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Support contact error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to submit" }),
      { status: 500, headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" } }
    );
  }
});
