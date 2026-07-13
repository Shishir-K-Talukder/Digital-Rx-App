-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('patient-documents', 'patient-documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('prescription-pdfs', 'prescription-pdfs', false);

-- Profile photos: public read, authenticated upload/delete own files
CREATE POLICY "Anyone can view profile photos" ON storage.objects FOR SELECT USING (bucket_id = 'profile-photos');
CREATE POLICY "Users can upload own profile photo" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can update own profile photo" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own profile photo" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Patient documents: only owner can access
CREATE POLICY "Users can view own patient docs" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'patient-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can upload patient docs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'patient-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete patient docs" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'patient-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Prescription PDFs: only owner can access
CREATE POLICY "Users can view own prescription pdfs" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'prescription-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can upload prescription pdfs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'prescription-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete prescription pdfs" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'prescription-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Add profile_photo_url to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_photo_url text NOT NULL DEFAULT '';
