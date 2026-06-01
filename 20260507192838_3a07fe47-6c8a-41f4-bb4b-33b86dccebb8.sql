CREATE TABLE public.aura_name_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid NOT NULL,
  name text NOT NULL,
  phone text,
  birth_date text,
  aura_color text NOT NULL,
  aura_color_hex text NOT NULL,
  chakra text NOT NULL,
  frequency_hz numeric NOT NULL,
  significado text NOT NULL,
  tratamento text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.aura_name_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own aura readings all" ON public.aura_name_readings
  FOR ALL USING (auth.uid() = therapist_id) WITH CHECK (auth.uid() = therapist_id);

CREATE INDEX idx_aura_name_readings_therapist ON public.aura_name_readings(therapist_id, created_at DESC);