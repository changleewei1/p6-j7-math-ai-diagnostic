-- =============================================================================
-- p6-j7-math-ai-diagnostic 初始 schema
-- 小六升國一數學 AI 診斷測驗 — 第 1 階段：資料表、索引、約束、updated_at 觸發
-- =============================================================================

-- 注意：上線前請針對各表啟用 RLS 並撰寫 policies。本遷移僅在檔案末尾附 **TODO 註解**，
--       不預先 ENABLE ROW LEVEL SECURITY，避免開發階段阻擋 anon key 的存取實驗。

-- 常用列舉（CHECK）：
--   difficulty: easy | medium | hard
--   qtype: mcq
--   test_sessions.status: pending | in_progress | completed
--   follow_up_status: 未追蹤 | 已聯絡 | 已預約 | 已報名
--   confidence_level: high | medium | low
--   五大模組名稱見 question_bank、session_questions 之 CHECK

-- =============================================================================
-- 1. 學生
-- =============================================================================
CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  school text,
  grade text NOT NULL DEFAULT '小六',
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.students IS '受測學生。RLS: TODO 啟用並撰寫 policies。';

-- =============================================================================
-- 2. 家長
-- =============================================================================
CREATE TABLE public.parents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  line_id text,
  email text,
  consent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.parents IS '家長聯絡與授權。RLS: TODO 啟用並撰寫 policies。';

-- =============================================================================
-- 3. 測驗工作階段
-- =============================================================================
CREATE TABLE public.test_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students (id) ON DELETE CASCADE,
  parent_id uuid NOT NULL REFERENCES public.parents (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  started_at timestamptz,
  completed_at timestamptz,
  total_questions int NOT NULL DEFAULT 15,
  adaptive_version text NOT NULL DEFAULT 'v2',
  overall_score numeric,
  overall_level text,
  summary_json jsonb,
  follow_up_status text NOT NULL DEFAULT '未追蹤',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_test_sessions_status CHECK (status IN ('pending', 'in_progress', 'completed')),
  CONSTRAINT chk_test_sessions_follow_up
    CHECK (follow_up_status IN ('未追蹤', '已聯絡', '已預約', '已報名'))
);

CREATE INDEX idx_test_sessions_status ON public.test_sessions (status);
CREATE INDEX idx_test_sessions_follow_up ON public.test_sessions (follow_up_status);
CREATE INDEX idx_test_sessions_student_id ON public.test_sessions (student_id);
CREATE INDEX idx_test_sessions_parent_id ON public.test_sessions (parent_id);

COMMENT ON TABLE public.test_sessions IS '單次診斷測驗。RLS: TODO 啟用並撰寫 policies。';

-- =============================================================================
-- 4. 題庫
-- =============================================================================
CREATE TABLE public.question_bank (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL,
  difficulty text NOT NULL,
  qtype text NOT NULL DEFAULT 'mcq',
  prompt text NOT NULL,
  choices jsonb NOT NULL,
  correct_choice_index int NOT NULL,
  answer text NOT NULL,
  explain text NOT NULL,
  ability_tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  estimated_time_seconds int NOT NULL DEFAULT 30,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_question_bank_module CHECK (
    module IN (
      '數感與基本運算',
      '分數/小數/比例',
      '代數前導',
      '幾何與圖形',
      '文字題與閱讀理解'
    )
  ),
  CONSTRAINT chk_question_bank_difficulty CHECK (difficulty IN ('easy', 'medium', 'hard')),
  CONSTRAINT chk_question_bank_qtype CHECK (qtype = 'mcq')
);

CREATE INDEX idx_question_bank_module ON public.question_bank (module);
CREATE INDEX idx_question_bank_difficulty ON public.question_bank (difficulty);
CREATE INDEX idx_question_bank_is_active ON public.question_bank (is_active) WHERE is_active = true;
CREATE INDEX idx_question_bank_module_difficulty ON public.question_bank (module, difficulty);

COMMENT ON TABLE public.question_bank IS '靜態題庫。RLS: TODO 啟用（通常僅讀或後台）。';

-- 自動更新 updated_at
CREATE OR REPLACE FUNCTION public.touch_question_bank_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- 若你使用的 Postgres 不支援 EXECUTE FUNCTION，可改為：EXECUTE PROCEDURE public.touch_question_bank_updated_at();
CREATE TRIGGER trg_question_bank_updated_at
  BEFORE UPDATE ON public.question_bank
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_question_bank_updated_at();

-- =============================================================================
-- 5. 測驗中選題快照（順序、模組、難度）
-- =============================================================================
CREATE TABLE public.session_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.test_sessions (id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.question_bank (id) ON DELETE CASCADE,
  question_order int NOT NULL,
  module text NOT NULL,
  difficulty text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_session_questions_module CHECK (
    module IN (
      '數感與基本運算',
      '分數/小數/比例',
      '代數前導',
      '幾何與圖形',
      '文字題與閱讀理解'
    )
  ),
  CONSTRAINT chk_session_questions_difficulty CHECK (difficulty IN ('easy', 'medium', 'hard'))
);

CREATE INDEX idx_session_questions_session_id ON public.session_questions (session_id);
CREATE INDEX idx_session_questions_question_id ON public.session_questions (question_id);
CREATE INDEX idx_session_questions_module ON public.session_questions (module);

COMMENT ON TABLE public.session_questions IS '每場測驗實際出題。RLS: TODO 啟用並撰寫 policies。';

-- =============================================================================
-- 6. 作答紀錄
-- =============================================================================
CREATE TABLE public.answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.test_sessions (id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.question_bank (id) ON DELETE CASCADE,
  selected_choice_index int,
  is_correct boolean NOT NULL,
  time_spent_seconds numeric NOT NULL DEFAULT 0,
  confidence_level text NOT NULL,
  shown_at timestamptz NOT NULL,
  answered_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_answers_confidence
    CHECK (confidence_level IN ('high', 'medium', 'low'))
);

CREATE INDEX idx_answers_session_id ON public.answers (session_id);
CREATE INDEX idx_answers_question_id ON public.answers (question_id);
CREATE INDEX idx_answers_is_correct ON public.answers (is_correct);
CREATE INDEX idx_answers_shown_at ON public.answers (shown_at);

COMMENT ON TABLE public.answers IS '單題作答。RLS: TODO 啟用並撰寫 policies。';

-- =============================================================================
-- 7. 學習建議
-- =============================================================================
CREATE TABLE public.recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.test_sessions (id) ON DELETE CASCADE,
  recommendation_type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_recommendations_session_id ON public.recommendations (session_id);
CREATE INDEX idx_recommendations_type ON public.recommendations (recommendation_type);

COMMENT ON TABLE public.recommendations IS '測驗產生之建議。RLS: TODO 啟用並撰寫 policies。';

-- =============================================================================
-- 8. 影片推薦目錄
-- =============================================================================
CREATE TABLE public.video_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL,
  title text NOT NULL,
  url text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_video_recommendations_module CHECK (
    module IN (
      '數感與基本運算',
      '分數/小數/比例',
      '代數前導',
      '幾何與圖形',
      '文字題與閱讀理解'
    )
  )
);

CREATE INDEX idx_video_recommendations_module ON public.video_recommendations (module);
CREATE INDEX idx_video_recommendations_is_active
  ON public.video_recommendations (is_active) WHERE is_active = true;

COMMENT ON TABLE public.video_recommendations IS '影片庫。RLS: TODO 啟用（多為公開讀取）。';

-- =============================================================================
-- 9. 後台管理員
-- =============================================================================
CREATE TABLE public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_users_username ON public.admin_users (username);

COMMENT ON TABLE public.admin_users IS '後台帳密（僅 server 端驗證）。RLS: TODO 啟用或改僅 service role 存取。';

-- =============================================================================
-- 10. 預約 / 名單
-- =============================================================================
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  parent_name text NOT NULL,
  phone text NOT NULL,
  interested_course text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_phone ON public.bookings (phone);
CREATE INDEX idx_bookings_created_at ON public.bookings (created_at);

COMMENT ON TABLE public.bookings IS '預約與名單。RLS: TODO 啟用並僅限後台。';

-- =============================================================================
-- 11. LINE 推播日誌
-- =============================================================================
CREATE TABLE public.line_push_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.test_sessions (id) ON DELETE SET NULL,
  parent_id uuid REFERENCES public.parents (id) ON DELETE SET NULL,
  target_line_id text,
  message_type text NOT NULL,
  payload_json jsonb,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_line_push_logs_session_id ON public.line_push_logs (session_id);
CREATE INDEX idx_line_push_logs_parent_id ON public.line_push_logs (parent_id);
CREATE INDEX idx_line_push_logs_status ON public.line_push_logs (status);
CREATE INDEX idx_line_push_logs_created_at ON public.line_push_logs (created_at);

COMMENT ON TABLE public.line_push_logs IS 'LINE 推播紀錄。RLS: TODO 啟用並僅限後台 / service。';

-- =============================================================================
-- 結束；RLS 之後續作業（本版不執行 ENABLE）
-- =============================================================================
-- RLS 後續：ALTER TABLE <table> ENABLE ROW LEVEL SECURITY; 再為每個角色寫政策。
