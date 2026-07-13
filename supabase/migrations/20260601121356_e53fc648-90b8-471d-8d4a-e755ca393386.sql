
-- Pediatric dose rules (admin-managed, shared by all doctors)
CREATE TABLE public.pediatric_dose_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  generic TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '8kg/tsf',  -- 8kg/tsf | 10kg/half | 10kg/tsf | drop/kg
  strength TEXT NOT NULL DEFAULT '',
  frequency TEXT NOT NULL DEFAULT '',
  daily_dose TEXT NOT NULL DEFAULT '',
  drop_ratio NUMERIC,
  notes TEXT NOT NULL DEFAULT '',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pediatric_dose_rules TO authenticated;
GRANT ALL ON public.pediatric_dose_rules TO service_role;

ALTER TABLE public.pediatric_dose_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view pediatric dose rules"
  ON public.pediatric_dose_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert pediatric dose rules"
  ON public.pediatric_dose_rules FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update pediatric dose rules"
  ON public.pediatric_dose_rules FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete pediatric dose rules"
  ON public.pediatric_dose_rules FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_pediatric_dose_rules_updated_at
  BEFORE UPDATE ON public.pediatric_dose_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Adult dose rules (admin-managed, shared by all doctors)
CREATE TABLE public.adult_dose_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  generic TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL DEFAULT 'fixed',   -- fixed | mg/kg
  dose TEXT NOT NULL DEFAULT '',
  mg_per_kg NUMERIC,
  frequency TEXT NOT NULL DEFAULT '',
  route TEXT NOT NULL DEFAULT '',
  max_daily TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.adult_dose_rules TO authenticated;
GRANT ALL ON public.adult_dose_rules TO service_role;

ALTER TABLE public.adult_dose_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view adult dose rules"
  ON public.adult_dose_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert adult dose rules"
  ON public.adult_dose_rules FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update adult dose rules"
  ON public.adult_dose_rules FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete adult dose rules"
  ON public.adult_dose_rules FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_adult_dose_rules_updated_at
  BEFORE UPDATE ON public.adult_dose_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
