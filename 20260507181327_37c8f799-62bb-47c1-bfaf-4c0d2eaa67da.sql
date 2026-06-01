ALTER TABLE public.sessions
ADD COLUMN IF NOT EXISTS frequencia_before_hz numeric,
ADD COLUMN IF NOT EXISTS frequencia_after_hz numeric;