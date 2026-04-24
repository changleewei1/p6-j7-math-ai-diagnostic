-- 學生表：介紹人推薦（選填）
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS referrer_name text,
  ADD COLUMN IF NOT EXISTS referrer_contact text;

COMMENT ON COLUMN public.students.referrer_name IS '介紹人姓名（選填，推薦獎勵用）';
COMMENT ON COLUMN public.students.referrer_contact IS '介紹人聯絡方式（選填，推薦獎勵用）';
