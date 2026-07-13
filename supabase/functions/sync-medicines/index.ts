// Scrapes medex.com.bd brand listings and upserts into public.medicines.
// Resumable: stores last_page in sync_state. Triggered weekly via pg_cron or manually by admin.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE = "https://medex.com.bd/brands?page=";
const UA = "Mozilla/5.0 (compatible; LovableMedicineSync/1.0)";

interface Brand { name: string; strength: string; generic: string; company: string; }

function parsePage(html: string): { brands: Brand[]; totalPages: number } {
  const brands: Brand[] = [];
  // Each brand is wrapped in <a class="hoverable-block"> ... </a>
  const blocks = html.match(/<a[^>]*class="[^"]*hoverable-block[^"]*"[\s\S]*?<\/a>/g) || [];
  for (const block of blocks) {
    const nameMatch = block.match(/data-row-top">[\s\S]*?<\/span>\s*([^<]+)/);
    const strengthMatch = block.match(/data-row-strength"[^>]*>\s*<span[^>]*>([^<]*)<\/span>/);
    // Generic line is the col-xs-12 right after strength block
    const genericMatch = block.match(/data-row-strength[\s\S]*?<\/div>\s*<div class="col-xs-12">\s*([^<]+?)\s*<\/div>/);
    const companyMatch = block.match(/data-row-company">([^<]+)<\/span>/);
    const name = (nameMatch?.[1] || "").trim().replace(/\s+/g, " ");
    if (!name) continue;
    brands.push({
      name,
      strength: (strengthMatch?.[1] || "").trim().replace(/&amp;/g, "&"),
      generic: (genericMatch?.[1] || "").trim().replace(/&amp;/g, "&"),
      company: (companyMatch?.[1] || "").trim(),
    });
  }
  // Find max page from pagination links
  const pages = [...html.matchAll(/page=(\d+)/g)].map((m) => parseInt(m[1], 10));
  const totalPages = pages.length ? Math.max(...pages) : 1;
  return { brands, totalPages };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Authorize: matching DB cron secret OR admin user JWT
  const auth = req.headers.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  const cronSecret = req.headers.get("x-cron-secret") || "";
  let isAuthorized = false;
  if (cronSecret) {
    const { data: secret } = await supabase
      .from("sync_state").select("value").eq("key", "cron_secret").maybeSingle();
    if (secret && (secret.value as any)?.token === cronSecret) isAuthorized = true;
  }
  if (!isAuthorized && token) {
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user) {
      const { data: role } = await supabase
        .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      if (role) isAuthorized = true;
    }
  }
  if (!isAuthorized) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const reset = url.searchParams.get("reset") === "1";
  const pagesToFetch = Math.min(parseInt(url.searchParams.get("pages") || "60", 10), 150);

  // Get last synced page
  let startPage = 1;
  if (!reset) {
    const { data: state } = await supabase.from("sync_state").select("value").eq("key", "medex_last_page").maybeSingle();
    startPage = ((state?.value as any)?.page || 0) + 1;
  }

  let totalPages = startPage + pagesToFetch;
  let totalUpserted = 0;
  let lastDone = startPage - 1;
  const errors: string[] = [];

  for (let p = startPage; p < startPage + pagesToFetch; p++) {
    if (p > totalPages && totalPages > 1) break;
    try {
      const res = await fetch(BASE + p, { headers: { "User-Agent": UA } });
      if (!res.ok) { errors.push(`page ${p}: HTTP ${res.status}`); continue; }
      const html = await res.text();
      const { brands, totalPages: tp } = parsePage(html);
      if (tp > 1) totalPages = tp;
      if (brands.length === 0) { lastDone = p; break; }
      // Dedupe within page (case-insensitive) so ON CONFLICT doesn't hit same row twice
      const seen = new Map<string, Brand>();
      for (const b of brands) {
        const k = `${b.name.toLowerCase()}|${b.strength.toLowerCase()}|${b.company.toLowerCase()}`;
        if (!seen.has(k)) seen.set(k, b);
      }
      const unique = [...seen.values()];
      // Upsert in chunks
      for (let i = 0; i < unique.length; i += 100) {
        const chunk = unique.slice(i, i + 100);
        const { error, data } = await supabase
          .from("medicines")
          .upsert(chunk, { onConflict: "name,strength,company", ignoreDuplicates: false })
          .select("id");
        if (error) errors.push(`page ${p}: ${error.message}`);
        else totalUpserted += data?.length ?? chunk.length;
      }
      lastDone = p;
    } catch (e) {
      errors.push(`page ${p}: ${(e as Error).message}`);
    }
  }

  // If reached end, reset for next cycle
  const nextPage = lastDone >= totalPages ? 0 : lastDone;
  await supabase.from("sync_state").upsert({
    key: "medex_last_page",
    value: { page: nextPage, total_pages: totalPages, last_run: new Date().toISOString(), errors: errors.slice(0, 5) },
    updated_at: new Date().toISOString(),
  });

  return new Response(JSON.stringify({
    success: true, fromPage: startPage, toPage: lastDone, totalPages,
    upserted: totalUpserted, nextPage, errors: errors.slice(0, 10),
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
