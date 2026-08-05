// Scrapes medex.com.bd generic pages and upserts pediatric + adult dose rules.
// Resumable: stores last page in sync_state under key "medex_generic_last_page".
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders as baseCorsHeaders } from "npm:@supabase/supabase-js@2/cors";

const functionCorsHeaders = {
  ...baseCorsHeaders,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LIST = "https://medex.com.bd/generics?page=";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...functionCorsHeaders, "Content-Type": "application/json" },
  });

const strip = (s: string) =>
  s
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_m, d) => String.fromCharCode(Number(d)))
    .replace(/&[a-z]+;/gi, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

function pickSection(html: string, id: string) {
  const idx = html.indexOf(`id="${id}"`);
  if (idx === -1) return "";
  const after = html.slice(idx, idx + 20000);
  const bodyIdx = after.search(/class="ac-body"/);
  if (bodyIdx === -1) return "";
  const rest = after.slice(bodyIdx);
  const open = rest.indexOf(">");
  const chunk = rest.slice(open + 1, open + 8000);
  const end = chunk.search(/<div\s+id="/);
  return strip(end === -1 ? chunk : chunk.slice(0, end));
}

// Pull the first "N mg/kg" style number so the calculators can compute doses.
function mgPerKg(text: string): number | null {
  const m = text.match(/(\d+(?:\.\d+)?)\s*(?:-|–|to)?\s*(?:\d+(?:\.\d+)?)?\s*mg\s*\/\s*kg/i);
  if (!m) return null;
  const v = parseFloat(m[1]);
  return Number.isFinite(v) && v > 0 && v < 500 ? v : null;
}

function guessFrequency(text: string): string {
  const t = text.toLowerCase();
  if (/(four times|6 hourly|every 6 hours|qds|q6h)/.test(t)) return "QDS";
  if (/(three times|8 hourly|every 8 hours|tds|q8h|thrice)/.test(t)) return "TDS";
  if (/(twice|12 hourly|every 12 hours|bd|bid)/.test(t)) return "BD";
  if (/(once daily|daily|od|24 hourly)/.test(t)) return "OD";
  return "TDS";
}

function pediatricText(html: string) {
  const ped = pickSection(html, "pediatric_uses");
  const dosage = pickSection(html, "dosage");
  const childLine = dosage
    .split("\n")
    .filter((l) => /child|infant|paediatric|pediatric|neonat|year|month/i.test(l))
    .join("\n");
  return [ped, childLine].filter(Boolean).join("\n").trim();
}

function adultText(html: string) {
  const dosage = pickSection(html, "dosage");
  const adultLine = dosage
    .split("\n")
    .filter((l) => /adult/i.test(l))
    .join("\n");
  return (adultLine || dosage).trim();
}

async function get(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: functionCorsHeaders });

  try {
    if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) return jsonResponse({ error: "Backend sync is not configured" }, 500);

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const auth = req.headers.get("Authorization") || "";
    const token = auth.replace(/^Bearer\s+/i, "");
    const cronSecret = req.headers.get("x-cron-secret") || "";
    let isAuthorized = false;

    if (cronSecret) {
      const { data: secret } = await supabase.from("sync_state").select("value").eq("key", "cron_secret").maybeSingle();
      if (secret && (secret.value as any)?.token === cronSecret) isAuthorized = true;
    }

    if (!isAuthorized && token) {
      const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
      if (claimsError || !claimsData?.claims?.sub) {
        return jsonResponse({ error: "Please sign in again, then retry sync" }, 401);
      }
      const { data: role } = await supabase
        .from("user_roles").select("role").eq("user_id", claimsData.claims.sub).eq("role", "admin").maybeSingle();
      if (role) isAuthorized = true;
    }

    if (!isAuthorized) return jsonResponse({ error: "Only admins can sync dose rules" }, 403);

    const url = new URL(req.url);
    const reset = url.searchParams.get("reset") === "1";
    const requested = parseInt(url.searchParams.get("pages") || "2", 10);
    const pagesToFetch = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), 4) : 2;

    let startPage = 1;
    if (!reset) {
      const { data: state } = await supabase
        .from("sync_state").select("value").eq("key", "medex_generic_last_page").maybeSingle();
      startPage = ((state?.value as any)?.page || 0) + 1;
    }

    let totalPages = startPage + pagesToFetch;
    let lastDone = startPage - 1;
    let pedCount = 0;
    let adultCount = 0;
    const errors: string[] = [];

    for (let p = startPage; p < startPage + pagesToFetch; p++) {
      if (p > totalPages && totalPages > 1) break;
      try {
        const listHtml = await get(LIST + p);
        const pages = [...listHtml.matchAll(/[?&]page=(\d+)/g)].map((m) => parseInt(m[1], 10));
        if (pages.length) totalPages = Math.max(totalPages > startPage + pagesToFetch ? totalPages : 0, ...pages);

        const links = [
          ...new Set(
            [...listHtml.matchAll(/href="https:\/\/medex\.com\.bd(\/generics\/\d+\/[^"?]+)"/g)].map((m) => m[1]),
          ),
        ];
        if (!links.length) { lastDone = p; break; }

        const pedRows: Record<string, unknown>[] = [];
        const adultRows: Record<string, unknown>[] = [];

        // Fetch generic detail pages in small concurrent batches.
        for (let i = 0; i < links.length; i += 5) {
          const batch = links.slice(i, i + 5);
          const results = await Promise.all(
            batch.map(async (path) => {
              try {
                const html = await get(`https://medex.com.bd${path}`);
                const name = strip(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "");
                if (!name) return null;
                return {
                  name,
                  ped: pediatricText(html),
                  adult: adultText(html),
                  indications: pickSection(html, "indications"),
                  dosage: pickSection(html, "dosage"),
                };
              } catch {
                return null;
              }
            }),
          );

          for (const r of results) {
            if (!r) continue;
            const pedBody = r.ped || r.dosage;
            if (pedBody) {
              pedRows.push({
                name: r.name,
                generic: r.name,
                category: "8kg/tsf",
                strength: "",
                frequency: guessFrequency(pedBody),
                daily_dose: (mgPerKg(pedBody) ? `${mgPerKg(pedBody)} mg/kg/day` : "").slice(0, 120),
                drop_ratio: null,
                notes: `${r.indications ? `Indications: ${r.indications}\n\n` : ""}${pedBody}`.slice(0, 4000),
              });
            }
            const adultBody = r.adult || r.dosage;
            if (adultBody) {
              const perKg = mgPerKg(adultBody);
              adultRows.push({
                name: r.name,
                generic: r.name,
                kind: perKg ? "per_kg" : "fixed",
                dose: (adultBody.split("\n")[0] || "").slice(0, 200),
                mg_per_kg: perKg,
                frequency: guessFrequency(adultBody),
                route: "PO",
                max_daily: "",
                notes: `${r.indications ? `Indications: ${r.indications}\n\n` : ""}${adultBody}`.slice(0, 4000),
              });
            }
          }
        }

        if (pedRows.length) {
          const { error } = await supabase
            .from("pediatric_dose_rules")
            .upsert(pedRows, { onConflict: "generic", ignoreDuplicates: false });
          if (error) errors.push(`page ${p} pediatric: ${error.message}`);
          else pedCount += pedRows.length;
        }
        if (adultRows.length) {
          const { error } = await supabase
            .from("adult_dose_rules")
            .upsert(adultRows, { onConflict: "generic", ignoreDuplicates: false });
          if (error) errors.push(`page ${p} adult: ${error.message}`);
          else adultCount += adultRows.length;
        }

        lastDone = p;
      } catch (e) {
        errors.push(`page ${p}: ${(e as Error).message}`);
      }
    }

    const nextPage = lastDone >= totalPages ? 0 : lastDone;
    await supabase.from("sync_state").upsert({
      key: "medex_generic_last_page",
      value: { page: nextPage, total_pages: totalPages, last_run: new Date().toISOString(), errors: errors.slice(0, 5) },
      updated_at: new Date().toISOString(),
    });

    return jsonResponse({
      success: true,
      fromPage: startPage,
      toPage: lastDone,
      totalPages,
      pediatricUpserted: pedCount,
      adultUpserted: adultCount,
      nextPage,
      errors: errors.slice(0, 10),
    });
  } catch (e) {
    console.error("sync-generic-doses error", e);
    return jsonResponse({ error: (e as Error).message || "Dose rule sync failed" }, 500);
  }
});
