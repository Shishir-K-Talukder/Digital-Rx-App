const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Scrapes medex.com.bd brand search page to find the indication & dose snippet.
async function scrapeMedex(query: string) {
  const q = encodeURIComponent(query);
  // Search page
  const searchUrl = `https://medex.com.bd/search?type=brand&search=${q}`;
  const searchRes = await fetch(searchUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DigitalRxBot/1.0)' },
  });
  const searchHtml = await searchRes.text();
  // Find first brand link: /brands/<id>/<slug>
  const m = searchHtml.match(/href="(\/brands\/\d+\/[^"]+)"/);
  if (!m) return { found: false, error: 'No brand match on medex.com.bd' };
  const brandUrl = `https://medex.com.bd${m[1]}`;

  const brandRes = await fetch(brandUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DigitalRxBot/1.0)' },
  });
  const html = await brandRes.text();

  // Strip tags helper
  const strip = (s: string) => s.replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim();

  const pickSection = (label: string) => {
    const re = new RegExp(`${label}[\\s\\S]{0,50}?<\\/h[1-6]>([\\s\\S]{0,2000}?)(?:<h[1-6]|<\\/section)`, 'i');
    const mm = html.match(re);
    return mm ? strip(mm[1]) : '';
  };

  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const brandName = titleMatch ? strip(titleMatch[1]) : query;
  const genericMatch = html.match(/Generic Name[\s\S]{0,200}?<a[^>]*>([\s\S]*?)<\/a>/i);
  const strengthMatch = html.match(/Strength[\s\S]{0,200}?<div[^>]*>([\s\S]*?)<\/div>/i);
  const companyMatch = html.match(/Manufactured by[\s\S]{0,200}?<a[^>]*>([\s\S]*?)<\/a>/i);

  return {
    found: true,
    sourceUrl: brandUrl,
    brand: brandName,
    generic: genericMatch ? strip(genericMatch[1]) : '',
    strength: strengthMatch ? strip(strengthMatch[1]) : '',
    company: companyMatch ? strip(companyMatch[1]) : '',
    indication: pickSection('Indications?'),
    dose: pickSection('(?:Dose\\s*&amp;\\s*Administration|Dosage|Adult Dose|Dose)'),
    pediatric: pickSection('(?:Paediatric|Pediatric|Children)'),
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
    const result = await scrapeMedex(query.trim());
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('scrape-medex-dose error', e);
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
