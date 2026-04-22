-- =============================================================================
-- 第 4 段：家長行銷同意（與 consent 個資同意分欄位）
-- marketing_opt_in：是否願意接收診斷報告與課程／活動等招生相關訊息
-- =============================================================================

ALTER TABLE public.parents
  ADD COLUMN IF NOT EXISTS marketing_opt_in boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.parents.marketing_opt_in IS
  '行銷／教學關聯通訊同意（如報告與課程建議）；與 consent（個資蒐集）分開。';
