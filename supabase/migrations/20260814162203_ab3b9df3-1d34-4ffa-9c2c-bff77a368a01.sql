ALTER TABLE public.startups
  ADD COLUMN IF NOT EXISTS ai_summary text,
  ADD COLUMN IF NOT EXISTS ai_summary_status text NOT NULL DEFAULT 'none';

CREATE TABLE public.startup_deck_text (
  startup_id uuid PRIMARY KEY REFERENCES public.startups(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.startup_deck_text TO authenticated;
GRANT ALL ON public.startup_deck_text TO service_role;
ALTER TABLE public.startup_deck_text ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders read own deck text" ON public.startup_deck_text
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.startups s
    JOIN public.founders f ON f.id = s.founder_id
    WHERE s.id = startup_deck_text.startup_id AND f.user_id = auth.uid()
  ));

CREATE POLICY "Matched investors read deck text" ON public.startup_deck_text
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.matches m
    JOIN public.investors i ON i.id = m.investor_id
    WHERE m.startup_id = startup_deck_text.startup_id
      AND m.status = 'matched'
      AND i.user_id = auth.uid()
  ));

CREATE TRIGGER update_startup_deck_text_updated_at
  BEFORE UPDATE ON public.startup_deck_text
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.startup_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  investor_id uuid NOT NULL REFERENCES public.investors(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX startup_questions_startup_investor_idx
  ON public.startup_questions (startup_id, investor_id, created_at DESC);

GRANT SELECT ON public.startup_questions TO authenticated;
GRANT ALL ON public.startup_questions TO service_role;
ALTER TABLE public.startup_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Investors read own questions" ON public.startup_questions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.investors i
    WHERE i.id = startup_questions.investor_id AND i.user_id = auth.uid()
  ));

CREATE POLICY "Founders read questions on own startups" ON public.startup_questions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.startups s
    JOIN public.founders f ON f.id = s.founder_id
    WHERE s.id = startup_questions.startup_id AND f.user_id = auth.uid()
  ));