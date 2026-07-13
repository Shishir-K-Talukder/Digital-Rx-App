import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactBody {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

async function sendViaSMTP(settings: any, to: string, subject: string, html: string) {
  // Use Deno's native TCP-based SMTP via denomailer
  const { SMTPClient } = await import('https://deno.land/x/denomailer@1.6.0/mod.ts');
  const client = new SMTPClient({
    connection: {
      hostname: settings.host,
      port: settings.port,
      tls: settings.use_tls,
      auth: { username: settings.username, password: settings.password },
    },
  });
  await client.send({
    from: `${settings.from_name} <${settings.from_email}>`,
    to,
    subject,
    content: 'auto',
    html,
  });
  await client.close();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const body: ContactBody = await req.json();
    if (!body.email || !body.name || !body.message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: settings } = await supabase.from('smtp_settings').select('*').limit(1).maybeSingle();

    if (!settings || !settings.host || !settings.username || !settings.notification_email) {
      // SMTP not configured — message is already saved in DB, just acknowledge
      return new Response(JSON.stringify({ ok: true, emailed: false, reason: 'SMTP not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const html = `
      <h2>New contact message — Digital Rx</h2>
      <p><b>Name:</b> ${body.name}</p>
      <p><b>Email:</b> ${body.email}</p>
      <p><b>Phone:</b> ${body.phone || '-'}</p>
      <p><b>Subject:</b> ${body.subject || '-'}</p>
      <hr/>
      <p style="white-space:pre-wrap">${body.message}</p>
    `;

    await sendViaSMTP(settings, settings.notification_email, `[Digital Rx] ${body.subject || 'New contact'} — ${body.name}`, html);

    return new Response(JSON.stringify({ ok: true, emailed: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('send-contact-email error', e);
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
