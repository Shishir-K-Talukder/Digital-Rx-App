const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const strip = (s: string) =>
  s.replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&frac12;/g, '½')
    .replace(/&frac14;/g, '¼')
    .replace(/&frac34;/g, '¾')
    .replace(/&deg;/g, '°')
    .replace(/&micro;/g, 'µ')
    .replace(/&#(\d+);/g, (_m, d) => String.fromCharCode(Number(d)))
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();


// Sections on a medex generic page look like:
// <div id="indications"><h3 ...>Indications</h3></div><div class="ac-body"> content </div>
function pickSection(html: string, id: string) {
  const idx = html.indexOf(`id="${id}"`);
  if (idx === -1) return '';
  const after = html.slice(idx, idx + 20000);
  const bodyIdx = after.search(/class="ac-body"/);
  if (bodyIdx === -1) return '';
  const rest = after.slice(bodyIdx);
  const open = rest.indexOf('>');
  const chunk = rest.slice(open + 1, open + 8000);
  const end = chunk.search(/<div\s+id="/);
  return strip(end === -1 ? chunk : chunk.slice(0, end));
}

async function get(url: string) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' } });
  return await res.text();
}

async function scrapeGeneric(query: string) {
  const searchHtml = await get(`https://medex.com.bd/search?type=generic&search=${encodeURIComponent(query)}`);
  const links = [...searchHtml.matchAll(/href="https:\/\/medex\.com\.bd(\/generics\/\d+\/[^"?]+)"/g)].map((m) => m[1]);
  if (!links.length) return { found: false, error: 'No generic match on medex.com.bd' };

  const q = query.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const best = links.find((l) => l.split('/').pop() === q) || links[0];
  const sourceUrl = `https://medex.com.bd${best}`;
  const html = await get(sourceUrl);

  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);

  return {
    found: true,
    sourceUrl,
    generic: titleMatch ? strip(titleMatch[1]) : query,
    indications: pickSection(html, 'indications'),
    dosage: pickSection(html, 'dosage'),
    sideEffects: pickSection(html, 'side_effects'),
    contraindications: pickSection(html, 'contraindications'),
    precautions: pickSection(html, 'precautions'),
    interaction: pickSection(html, 'interaction'),
    pediatricUses: pickSection(html, 'pediatric_uses'),
    pregnancy: pickSection(html, 'pregnancy_cat'),
    overdose: pickSection(html, 'overdose_effects'),
    modeOfAction: pickSection(html, 'mode_of_action'),
    drugClass: pickSection(html, 'drug_classes'),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return new Response(JSON.stringify({ error: 'query required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const result = await scrapeGeneric(query.trim());
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('scrape-medex-generic error', e);
    return new Response(JSON.stringify({ error: String((e as Error)?.message || e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
