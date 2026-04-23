-- 題目對應補充／講解影片（一題多支；priority 預留排序；日後可與弱點推薦銜接）
CREATE TABLE public.question_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.question_bank (id) ON DELETE CASCADE,
  youtube_url text NOT NULL,
  title text,
  priority integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_question_videos_question_id ON public.question_videos (question_id);
CREATE INDEX idx_question_videos_question_priority ON public.question_videos (question_id, priority, created_at);

COMMENT ON TABLE public.question_videos IS '題目對應 YouTube 等補充影片。RLS: TODO（多為後台 service 寫入）。';
COMMENT ON COLUMN public.question_videos.priority IS '顯示順序，數字越小越前；預留拖曳排序與規則推薦。';
