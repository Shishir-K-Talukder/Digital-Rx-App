// Scrapes medex.com.bd brand listings and upserts into public.medicines.
// Resumable: stores last_page in sync_state. Triggered weekly or manually by admin.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders as baseCorsHeaders } from "npm:@supabase/supabase-js@2/cors";

const functionCorsHeaders = {
  ...baseCorsHeaders,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BASE = "https://medex.com.bd/brands?page=";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

interface Brand { name: string; strength: string; generic: string; company: string; }

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...functionCorsHeaders, "Content-Type": "application/json" },
  });

const cleanText = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function parsePage(html: string): { brands: Brand[]; totalPages: number } {
  const brands: Brand[] = [];
  // Current medex markup: <a href="..." class="brand-card"> ... </a>
  const blocks = html.match(/<a[^>]*class="[^"]*brand-card[^"]*"[\s\S]*?<\/a>/g)
    // Legacy markup fallback
    || html.match(/<a[^>]*class="[^"]*hoverable-block[^"]*"[\s\S]*?<\/a>/g)
    || [];

  for (const block of blocks) {
    const pick = (cls: string) => {
      const m = block.match(new RegExp(`class="${cls}"[^>]*>([\\s\\S]*?)<\\/(?:div|span)>`, "i"));
      return cleanText(m?.[1] || "");
    };

    const name = pick("brand-card__name") || cleanText(block.match(/data-row-top[^>]*>[\s\S]*?<\/span>\s*([^<]+)/i)?.[1] || "");
    if (!name) continue;

    brands.push({
      name,
      strength: pick("brand-card__strength"),
      generic: pick("brand-card__generic"),
      company: pick("brand-card__company"),
    });
  }

  const pages = [...html.matchAll(/[?&]page=(\d+)/g)].map((m) => parseInt(m[1], 10));
  const totalPages = pages.length ? Math.max(...pages) : 1;

  return { brands, totalPages };
}


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: functionCorsHeaders });

  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: "Backend sync is not configured" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Authorize: matching DB cron secret OR admin user JWT
    const auth = req.headers.get("Authorization") || "";
    const token = auth.replace(/^Bearer\s+/i, "");
    const cronSecret = req.headers.get("x-cron-secret") || "";

    let isAuthorized = false;

    if (cronSecret) {
      const { data: secret, error: secretError } = await supabase
        .from("sync_state").select("value").eq("key", "cron_secret").maybeSingle();
      if (secretError) throw secretError;
      if (secret && (secret.value as any)?.token === cronSecret) isAuthorized = true;
    }

    if (!isAuthorized && token) {
      const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
      if (claimsError || !claimsData?.claims?.sub) {
        return jsonResponse({ error: "Please sign in again, then retry sync" }, 401);
      }

      const { data: role, error: roleError } = await supabase
        .from("user_roles").select("role").eq("user_id", claimsData.claims.sub).eq("role", "admin").maybeSingle();
      if (roleError) throw roleError;
      if (role) isAuthorized = true;
    }

    if (!isAuthorized) {
      return jsonResponse({ error: "Only admins can sync medicines" }, 403);
    }

    const url = new URL(req.url);
    const reset = url.searchParams.get("reset") === "1";
    const requestedPages = parseInt(url.searchParams.get("pages") || "10", 10);
    const pagesToFetch = Number.isFinite(requestedPages) ? Math.min(Math.max(requestedPages, 1), 25) : 10;

    let startPage = 1;
    if (!reset) {
      const { data: state, error: stateError } = await supabase.from("sync_state").select("value").eq("key", "medex_last_page").maybeSingle();
      if (stateError) throw stateError;
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

        const seen = new Map<string, Brand>();
        for (const b of brands) {
          const k = `${b.name.toLowerCase()}|${b.strength.toLowerCase()}|${b.company.toLowerCase()}`;
          if (!seen.has(k)) seen.set(k, b);
        }

        const unique = [...seen.values()];
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

    const nextPage = lastDone >= totalPages ? 0 : lastDone;
    const { error: syncStateError } = await supabase.from("sync_state").upsert({
      key: "medex_last_page",
      value: { page: nextPage, total_pages: totalPages, last_run: new Date().toISOString(), errors: errors.slice(0, 5) },
      updated_at: new Date().toISOString(),
    });
    if (syncStateError) throw syncStateError;

    return jsonResponse({
      success: true, fromPage: startPage, toPage: lastDone, totalPages,
      upserted: totalUpserted, nextPage, errors: errors.slice(0, 10),
    });
  } catch (e) {
    console.error("sync-medicines error", e);
    return jsonResponse({ error: (e as Error).message || "Medicine sync failed" }, 500);
  }
});
