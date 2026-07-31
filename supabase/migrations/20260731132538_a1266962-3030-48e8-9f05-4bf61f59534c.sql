CREATE TYPE public.match_status AS ENUM ('pending', 'matched', 'passed');

CREATE TABLE public.founders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.founders TO authenticated;
GRANT ALL ON public.founders TO service_role;
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Founders manage own record" ON public.founders FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.investors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investors TO authenticated;
GRANT ALL ON public.investors TO service_role;
ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Investors manage own record" ON public.investors FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.startups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id uuid NOT NULL REFERENCES public.founders(id) ON DELETE CASCADE,
  name text NOT NULL,
  one_liner text NOT NULL,
  sector text NOT NULL,
  stage text NOT NULL,
  ask_amount numeric,
  deck_url text,
  video_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.startups TO authenticated;
GRANT ALL ON public.startups TO service_role;
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Founders manage own startups" ON public.startups FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.founders f WHERE f.id = startups.founder_id AND f.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.founders f WHERE f.id = startups.founder_id AND f.user_id = auth.uid()));
CREATE POLICY "Investors can browse startups" ON public.startups FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.investors i WHERE i.user_id = auth.uid()));

CREATE TABLE public.investor_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL UNIQUE REFERENCES public.investors(id) ON DELETE CASCADE,
  sectors text[] NOT NULL DEFAULT '{}',
  stages text[] NOT NULL DEFAULT '{}',
  min_ticket numeric,
  max_ticket numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investor_preferences TO authenticated;
GRANT ALL ON public.investor_preferences TO service_role;
ALTER TABLE public.investor_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Investors manage own preferences" ON public.investor_preferences FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.investors i WHERE i.id = investor_preferences.investor_id AND i.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.investors i WHERE i.id = investor_preferences.investor_id AND i.user_id = auth.uid()));

CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  investor_id uuid NOT NULL REFERENCES public.investors(id) ON DELETE CASCADE,
  status public.match_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (startup_id, investor_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.matches TO authenticated;
GRANT ALL ON public.matches TO service_role;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Investors manage own matches" ON public.matches FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.investors i WHERE i.id = matches.investor_id AND i.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.investors i WHERE i.id = matches.investor_id AND i.user_id = auth.uid()));
CREATE POLICY "Founders view matches on their startups" ON public.matches FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.startups s JOIN public.founders f ON f.id = s.founder_id
    WHERE s.id = matches.startup_id AND f.user_id = auth.uid()
  ));