
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE public.medicines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  strength TEXT NOT NULL DEFAULT '',
  generic TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view medicines" ON public.medicines FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add medicines" ON public.medicines FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update medicines" ON public.medicines FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete medicines" ON public.medicines FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_medicines_name ON public.medicines USING btree (name);
CREATE INDEX idx_medicines_name_trgm ON public.medicines USING gin (name gin_trgm_ops);
