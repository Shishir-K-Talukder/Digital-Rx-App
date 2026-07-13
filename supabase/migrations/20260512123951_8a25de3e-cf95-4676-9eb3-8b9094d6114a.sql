
-- Dedupe medicines first
DELETE FROM public.medicines a USING public.medicines b
WHERE a.ctid > b.ctid
  AND lower(a.name) = lower(b.name)
  AND lower(a.strength) = lower(b.strength)
  AND lower(a.company) = lower(b.company);

CREATE TABLE IF NOT EXISTS public.sync_state (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sync_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view sync state" ON public.sync_state
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can modify sync state" ON public.sync_state
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE UNIQUE INDEX IF NOT EXISTS medicines_unique_lower
  ON public.medicines (lower(name), lower(strength), lower(company));

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
