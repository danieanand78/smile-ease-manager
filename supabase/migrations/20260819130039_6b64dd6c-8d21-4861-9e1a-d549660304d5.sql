ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS profession text,
  ADD COLUMN IF NOT EXISTS assurance text,
  ADD COLUMN IF NOT EXISTS contact_urgence text,
  ADD COLUMN IF NOT EXISTS maladies_chroniques text,
  ADD COLUMN IF NOT EXISTS medicaments text,
  ADD COLUMN IF NOT EXISTS age integer;

ALTER TABLE public.visits
  ADD COLUMN IF NOT EXISTS consultation_no text NOT NULL DEFAULT to_char(now(), '"C"YYYYMMDDHH24MISS'),
  ADD COLUMN IF NOT EXISTS dentiste_id uuid,
  ADD COLUMN IF NOT EXISTS duree_min integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS observations text,
  ADD COLUMN IF NOT EXISTS conseils text,
  ADD COLUMN IF NOT EXISTS traitements text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS dents_details jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS prochain_rdv timestamptz;

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS dentiste_id uuid;

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text NOT NULL DEFAULT to_char(now(), '"F"YYYYMMDDHH24MISS'),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  visit_id uuid REFERENCES public.visits(id) ON DELETE SET NULL,
  date_facture timestamptz NOT NULL DEFAULT now(),
  montant numeric NOT NULL DEFAULT 0,
  remise numeric NOT NULL DEFAULT 0,
  tva numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  mode_paiement text NOT NULL DEFAULT 'Espèces',
  statut text NOT NULL DEFAULT 'Payé',
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS invoices_all_auth ON public.invoices;
CREATE POLICY invoices_all_auth ON public.invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.clinic_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  nom text NOT NULL DEFAULT 'Cabinet dentaire',
  adresse text,
  telephone text,
  email text,
  logo_url text,
  devise text NOT NULL DEFAULT 'Ar',
  tva_taux numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.clinic_settings TO authenticated;
GRANT INSERT, UPDATE ON public.clinic_settings TO authenticated;
GRANT ALL ON public.clinic_settings TO service_role;
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS clinic_settings_select ON public.clinic_settings;
CREATE POLICY clinic_settings_select ON public.clinic_settings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS clinic_settings_admin_insert ON public.clinic_settings;
CREATE POLICY clinic_settings_admin_insert ON public.clinic_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS clinic_settings_admin_update ON public.clinic_settings;
CREATE POLICY clinic_settings_admin_update ON public.clinic_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.clinic_settings (singleton) VALUES (true) ON CONFLICT (singleton) DO NOTHING;

DROP POLICY IF EXISTS user_roles_select_own ON public.user_roles;
CREATE POLICY user_roles_select_own ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
DROP POLICY IF EXISTS user_roles_admin_insert ON public.user_roles;
CREATE POLICY user_roles_admin_insert ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS user_roles_admin_update ON public.user_roles;
CREATE POLICY user_roles_admin_update ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS user_roles_admin_delete ON public.user_roles;
CREATE POLICY user_roles_admin_delete ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));