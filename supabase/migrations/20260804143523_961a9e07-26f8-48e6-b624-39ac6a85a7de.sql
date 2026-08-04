
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX notifications_user_idx ON public.notifications (user_id, created_at DESC);

-- Founders can see investors (and their thesis) who have a match on their startups
CREATE POLICY "Founders view interested investors" ON public.investors
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      JOIN public.startups s ON s.id = m.startup_id
      JOIN public.founders f ON f.id = s.founder_id
      WHERE m.investor_id = investors.id AND f.user_id = auth.uid()
    )
  );

CREATE POLICY "Founders view interested investor preferences" ON public.investor_preferences
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      JOIN public.startups s ON s.id = m.startup_id
      JOIN public.founders f ON f.id = s.founder_id
      WHERE m.investor_id = investor_preferences.investor_id AND f.user_id = auth.uid()
    )
  );

-- Founder decisions
CREATE OR REPLACE FUNCTION public.decide_match(_match_id uuid, _accept boolean)
RETURNS public.matches
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  m public.matches;
  s public.startups;
  inv public.investors;
BEGIN
  SELECT * INTO m FROM public.matches WHERE id = _match_id;
  IF m.id IS NULL THEN RAISE EXCEPTION 'Match not found'; END IF;

  SELECT * INTO s FROM public.startups WHERE id = m.startup_id;
  IF NOT EXISTS (
    SELECT 1 FROM public.founders f WHERE f.id = s.founder_id AND f.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF m.status <> 'pending' THEN RAISE EXCEPTION 'This request was already handled'; END IF;

  UPDATE public.matches
     SET status = CASE WHEN _accept THEN 'matched'::match_status ELSE 'passed'::match_status END
   WHERE id = _match_id
  RETURNING * INTO m;

  IF _accept THEN
    SELECT * INTO inv FROM public.investors WHERE id = m.investor_id;
    INSERT INTO public.notifications (user_id, title, body, link)
    VALUES (
      inv.user_id,
      'You matched with ' || s.name,
      s.name || ' accepted your interest. The full data room, including the pitch deck, is now unlocked.',
      '/discover'
    );
  END IF;

  RETURN m;
END;
$$;

REVOKE ALL ON FUNCTION public.decide_match(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.decide_match(uuid, boolean) TO authenticated;

-- Storage: decks only after an accepted match
DROP POLICY IF EXISTS "Investors can read deck files" ON storage.objects;

CREATE POLICY "Investors read pitch videos" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'videos'
    AND EXISTS (SELECT 1 FROM public.investors i WHERE i.user_id = auth.uid())
  );

CREATE POLICY "Matched investors read decks" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'decks'
    AND EXISTS (
      SELECT 1 FROM public.matches m
      JOIN public.startups s ON s.id = m.startup_id
      JOIN public.investors i ON i.id = m.investor_id
      WHERE i.user_id = auth.uid()
        AND m.status = 'matched'
        AND s.deck_url = storage.objects.name
    )
  );
