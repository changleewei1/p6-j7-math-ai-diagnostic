-- 預約單可選關聯診斷 session（從報告導向 /booking?sessionId= 時寫入，利於日後跟進）
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES public.test_sessions (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_session_id ON public.bookings (session_id);

COMMENT ON COLUMN public.bookings.session_id IS '可選。來自診斷報告 CTA 之預約時帶入。';
