// Admin portal API: validates ADMIN_PASSWORD header, then routes to:
//   GET  ?action=orders        -> list orders
//   GET  ?action=transactions  -> list paystack transactions
//   POST { action:"create_product", product } -> insert product
//   POST { action:"update_product", id, patch } -> update product
//   POST { action:"delete_product", id } -> delete product

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-admin-password, content-type, apikey",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const PAYSTACK_SECRET = Deno.env.get("PAYSTACK_SECRET_KEY") ?? "";
const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Auth
  const password = req.headers.get("x-admin-password") ?? "";
  if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
    return json({ error: "Unauthorized" }, 401);
  }

  try {
    const url = new URL(req.url);

    if (req.method === "GET") {
      const action = url.searchParams.get("action");

      if (action === "orders") {
        const { data, error } = await admin
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500);
        if (error) throw error;
        return json({ orders: data ?? [] });
      }

      if (action === "transactions") {
        if (!PAYSTACK_SECRET) return json({ error: "Paystack not configured" }, 500);
        const perPage = url.searchParams.get("perPage") ?? "50";
        const page = url.searchParams.get("page") ?? "1";
        const r = await fetch(
          `https://api.paystack.co/transaction?perPage=${perPage}&page=${page}`,
          { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } },
        );
        const body = await r.json();
        return json(body, r.status);
      }

      if (action === "stats") {
        const { count: orderCount } = await admin
          .from("orders").select("*", { count: "exact", head: true });
        const { count: productCount } = await admin
          .from("products").select("*", { count: "exact", head: true });
        const { count: totalUsers } = await admin
          .from("users").select("*", { count: "exact", head: true });
        const { data: revRows } = await admin
          .from("orders").select("amount").eq("status", "paid");
        const revenue = (revRows ?? []).reduce((s, r: any) => s + Number(r.amount || 0), 0);
        return json({ orderCount, productCount, totalUsers, revenue });
      }

      if (action === "customers") {
        const { data, error } = await admin
          .from("users")
          .select("id, email, first_name, last_name, phone, role, status, created_at, updated_at")
          .order("created_at", { ascending: false })
          .limit(500);
        if (error) throw error;
        return json({ customers: data ?? [] });
      }

      return json({ error: "Unknown action" }, 400);
    }

    if (req.method === "POST") {
      const body = await req.json();
      const action = body?.action;

      if (action === "create_product") {
        const { data, error } = await admin.from("products").insert(body.product).select().single();
        if (error) throw error;
        return json({ product: data });
      }
      if (action === "update_product") {
        const { data, error } = await admin
          .from("products").update(body.patch).eq("id", body.id).select().single();
        if (error) throw error;
        return json({ product: data });
      }
      if (action === "delete_product") {
        const { error } = await admin.from("products").delete().eq("id", body.id);
        if (error) throw error;
        return json({ ok: true });
      }
      if (action === "update_order_status") {
        const { data, error } = await admin
          .from("orders").update({ status: body.status }).eq("id", body.id).select().single();
        if (error) throw error;
        return json({ order: data });
      }
      if (action === "update_customer_status") {
        const { data, error } = await admin
          .from("users").update({ status: body.status }).eq("id", body.id).select().single();
        if (error) throw error;
        return json({ customer: data });
      }

      return json({ error: "Unknown action" }, 400);
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (err) {
    console.error("admin-api error", err);
    return json({ error: (err as Error).message }, 500);
  }
});
