-- Owner-scoped management: files must live under a folder named with the user's id
CREATE POLICY "Owners manage own deck files"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'decks' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'decks' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owners manage own video files"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Investors can review pitch materials
CREATE POLICY "Investors can read deck files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id IN ('decks', 'videos')
  AND EXISTS (SELECT 1 FROM public.investors i WHERE i.user_id = auth.uid())
);