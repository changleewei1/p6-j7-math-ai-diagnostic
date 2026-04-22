-- 轉換與行為追蹤（前台埋點）；RLS 待日後僅供後台／service 讀取
CREATE TABLE public.conversion_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.test_sessions (id) ON DELETE SET NULL,
  event_type text NOT NULL,
  meta_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversion_events_session_id ON public.conversion_events (session_id);
CREATE INDEX idx_conversion_events_event_type ON public.conversion_events (event_type);
CREATE INDEX idx_conversion_events_created_at ON public.conversion_events (created_at);

COMMENT ON TABLE public.conversion_events IS '轉換／行為事件。RLS: TODO 啟用，前台僅寫入。';
COMMENT ON COLUMN public.conversion_events.event_type IS '例：report_view, click_line, click_booking, submit_booking';
COMMENT ON COLUMN public.conversion_events.meta_json IS '補充脈絡，可為空物件';
