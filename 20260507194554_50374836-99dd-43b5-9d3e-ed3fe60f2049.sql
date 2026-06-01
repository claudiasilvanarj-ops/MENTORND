CREATE TABLE public.physical_photo_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid NOT NULL,
  patient_name text,
  observations text,
  image_url text,
  analise_geral text NOT NULL,
  protocolo_geral text NOT NULL,
  problemas jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.physical_photo_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own physical analyses all"
ON public.physical_photo_analyses
FOR ALL
USING (auth.uid() = therapist_id)
WITH CHECK (auth.uid() = therapist_id);

CREATE INDEX idx_physical_photo_analyses_therapist ON public.physical_photo_analyses(therapist_id, created_at DESC);