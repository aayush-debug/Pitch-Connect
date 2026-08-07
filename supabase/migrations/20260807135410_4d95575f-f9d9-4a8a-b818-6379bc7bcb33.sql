CREATE TYPE public.subscription_status AS ENUM ('inactive', 'active', 'expired');

ALTER TABLE public.investors
  ADD COLUMN subscription_status public.subscription_status NOT NULL DEFAULT 'inactive',
  ADD COLUMN subscription_expires_at timestamptz;

CREATE TABLE public.investor_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL REFERENCES public.investors(id) ON DELETE CASCADE,
  order_id text NOT NULL UNIQUE,
  payment_id text,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'created',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.investor_payments TO authenticated;
GRANT ALL ON public.investor_payments TO service_role;

ALTER TABLE public.investor_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Investors view own payments"
ON public.investor_payments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.investors i WHERE i.id = investor_payments.investor_id AND i.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_investor_payments_updated_at
BEFORE UPDATE ON public.investor_payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();