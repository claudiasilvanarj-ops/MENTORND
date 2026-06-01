ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS phone TEXT;
CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients (therapist_id, phone);