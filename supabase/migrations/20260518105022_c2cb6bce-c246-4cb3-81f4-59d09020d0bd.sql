
-- 1. Helper to check active/non-expired user
CREATE OR REPLACE FUNCTION public.is_user_active(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id
      AND is_active = true
      AND (panel_expires_at IS NULL OR panel_expires_at > now())
  )
$$;

-- 2. Tighten user-scoped policies to require active account
-- patients
DROP POLICY IF EXISTS "Users can view their own patients" ON public.patients;
DROP POLICY IF EXISTS "Users can insert their own patients" ON public.patients;
DROP POLICY IF EXISTS "Users can update their own patients" ON public.patients;
DROP POLICY IF EXISTS "Users can delete their own patients" ON public.patients;
CREATE POLICY "Users can view their own patients" ON public.patients FOR SELECT USING (auth.uid() = user_id AND public.is_user_active(auth.uid()));
CREATE POLICY "Users can insert their own patients" ON public.patients FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_user_active(auth.uid()));
CREATE POLICY "Users can update their own patients" ON public.patients FOR UPDATE USING (auth.uid() = user_id AND public.is_user_active(auth.uid()));
CREATE POLICY "Users can delete their own patients" ON public.patients FOR DELETE USING (auth.uid() = user_id AND public.is_user_active(auth.uid()));

-- prescriptions
DROP POLICY IF EXISTS "Users can view their own prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Users can insert their own prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Users can update their own prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Users can delete their own prescriptions" ON public.prescriptions;
CREATE POLICY "Users can view their own prescriptions" ON public.prescriptions FOR SELECT USING (auth.uid() = user_id AND public.is_user_active(auth.uid()));
CREATE POLICY "Users can insert their own prescriptions" ON public.prescriptions FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_user_active(auth.uid()));
CREATE POLICY "Users can update their own prescriptions" ON public.prescriptions FOR UPDATE USING (auth.uid() = user_id AND public.is_user_active(auth.uid()));
CREATE POLICY "Users can delete their own prescriptions" ON public.prescriptions FOR DELETE USING (auth.uid() = user_id AND public.is_user_active(auth.uid()));

-- appointments
DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can insert their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can delete their own appointments" ON public.appointments;
CREATE POLICY "Users can view their own appointments" ON public.appointments FOR SELECT USING (auth.uid() = user_id AND public.is_user_active(auth.uid()));
CREATE POLICY "Users can insert their own appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_user_active(auth.uid()));
CREATE POLICY "Users can update their own appointments" ON public.appointments FOR UPDATE USING (auth.uid() = user_id AND public.is_user_active(auth.uid()));
CREATE POLICY "Users can delete their own appointments" ON public.appointments FOR DELETE USING (auth.uid() = user_id AND public.is_user_active(auth.uid()));

-- treatment_templates
DROP POLICY IF EXISTS "Users can view their own templates" ON public.treatment_templates;
DROP POLICY IF EXISTS "Users can insert their own templates" ON public.treatment_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON public.treatment_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON public.treatment_templates;
CREATE POLICY "Users can view their own templates" ON public.treatment_templates FOR SELECT USING (auth.uid() = user_id AND public.is_user_active(auth.uid()));
CREATE POLICY "Users can insert their own templates" ON public.treatment_templates FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_user_active(auth.uid()));
CREATE POLICY "Users can update their own templates" ON public.treatment_templates FOR UPDATE USING (auth.uid() = user_id AND public.is_user_active(auth.uid()));
CREATE POLICY "Users can delete their own templates" ON public.treatment_templates FOR DELETE USING (auth.uid() = user_id AND public.is_user_active(auth.uid()));

-- doctor_settings
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.doctor_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.doctor_settings;
CREATE POLICY "Users can insert their own settings" ON public.doctor_settings FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_user_active(auth.uid()));
CREATE POLICY "Users can update their own settings" ON public.doctor_settings FOR UPDATE USING (auth.uid() = user_id AND public.is_user_active(auth.uid()));

-- 3. Restrict medicines INSERT to admins only
DROP POLICY IF EXISTS "Authenticated users can add medicines" ON public.medicines;
CREATE POLICY "Admins can add medicines" ON public.medicines FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. Storage UPDATE policies for private buckets
DROP POLICY IF EXISTS "Users can update own patient docs" ON storage.objects;
CREATE POLICY "Users can update own patient docs" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'patient-documents' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'patient-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update own prescription pdfs" ON storage.objects;
CREATE POLICY "Users can update own prescription pdfs" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'prescription-pdfs' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'prescription-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 5. Prevent listing of profile-photos bucket: restrict storage.objects SELECT to owner.
-- Public photo URLs work without RLS via the CDN, so this only affects API listing.
DROP POLICY IF EXISTS "Anyone can view profile photos" ON storage.objects;
CREATE POLICY "Owners can list own profile photos" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 6. Revoke EXECUTE on trigger functions from anon/authenticated (only triggers call them)
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
