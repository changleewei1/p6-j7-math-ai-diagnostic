# p6-j7-math-ai-diagnostic

小六升國一數學 **AI 診斷測驗系統** — 已完成 **第 1～3 段（資料層、測驗與基本報告）** 及 **第 4 段（招生型報告、規則式診斷敘事、圖表、影片推薦、內部後台、行銷同意欄位等）**；**第 5 段** 尚未實作：LINE 串接、完整 CRM、多角色權限、自適應 v3 等。

## 技術棧

- [Next.js](https://nextjs.org) 14+（App Router，本倉庫目前使用 16.x）
- TypeScript
- [Tailwind CSS](https://tailwindcss.com) 4
- [Supabase](https://supabase.com)（PostgreSQL，透過 [@supabase/supabase-js](https://github.com/supabase/supabase-js)，無 ORM）
- [Zod](https://zod.dev) + [React Hook Form](https://react-hook-form.com)（註冊表單）

## 第 1 段已完成內容

- `supabase/migrations/`：初始 schema（表格、索引、CHECK、`question_bank` 之 `updated_at` 觸發；RLS 僅附註 TODO，未強制啟用）
- `types/`：`database.ts`、`quiz.ts`、`analysis.ts`
- `lib/constants/quiz.ts`：模組與狀態常數
- `lib/supabase/`：瀏覽器／server／admin（service role）client 分離；`env.ts` 集中讀取環境變數，**避免在模組頂層 throw 導致建置失敗**
- `data/questionBank.seed.json`：至少 30 題、五大模組 × 三難度
- `scripts/import-question-bank.ts`：以 service role 匯入題庫（依 `module + difficulty + prompt` 去重）

## 第 2 段已完成內容

- **頁面**：`/` 首頁、`/register` 註冊、`/quiz/[sessionId]` 測驗（載入時啟動抽題並顯示第一題）
- **API**：
  - `POST /api/register`：建立 `students` / `parents` / `test_sessions`（**僅 server 端** `createAdminSupabaseClient()`）
  - `POST /api/quiz/start`：依題庫抽 15 題寫入 `session_questions`（已存在則不重抽）
  - `GET /api/quiz/[sessionId]/current`：回傳「下一道未作答題」（`question_order` 最小且尚未出現在 `answers`；若皆已作答則 `completed: true`）
- **邏輯模組**：`lib/quiz/buildInitialSessionQuestions.ts`、`lib/quiz/getCurrentQuestion.ts`、`lib/quiz/parseQuestionChoices.ts`
- **驗證**：`lib/validations/register.ts`、`lib/validations/quiz.ts`
- **前端元件**：`components/home/*`、`components/register/RegisterForm.tsx`、`components/quiz/*`、`components/ui/SectionCard.tsx`

## 如何測試 `/register` 與建立 session

1. 依「環境變數」設定 `.env.local`（需含 `SUPABASE_SERVICE_ROLE_KEY`，API 才能寫入資料庫）。
2. 確認已執行 migration 且已 `npm run seed:questions` 匯入題庫（五大模組 × 每難度至少 1 題，否則 `POST /api/quiz/start` 會回 422）。
3. 啟動開發伺服器：`npm run dev`。
4. 瀏覽 `http://localhost:3000/register`，填寫必填欄位並勾選個資同意後送出。
5. 成功後會導向 `/quiz/[sessionId]`；該頁會自動呼叫 `POST /api/quiz/start` 再 `GET /api/quiz/.../current`，應看到第 1 題與進度條。

## 如何初始化 quiz 題目

- 進入 `/quiz/[sessionId]` 時，前端會呼叫 **`POST /api/quiz/start`**（body: `{ "sessionId": "<uuid>" }`）。
- 若該 session 尚無 `session_questions`，後端會自 `question_bank`（`is_active = true`）依 **每模組 easy / medium / hard 各 1 題** 隨機抽滿 15 題並寫入；若 `session_questions` 已有資料則 **不會重抽**（`existing: true`）。

## 環境變數

1. 複製範本：

   ```bash
   cp .env.example .env.local
   ```

2. 至 Supabase 專案 **Project Settings → API** 填入：

   - `NEXT_PUBLIC_SUPABASE_URL`：專案 URL（例如 `https://xxxx.supabase.co`）
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`：anon public（第 2 段 API 主要用 service role，但建議一併設定）
   - `SUPABASE_SERVICE_ROLE_KEY`：service role（**僅本機與加密部署環境**，不可曝露在前端或 `NEXT_PUBLIC_`）

3. **（建議）** 後臺要複製**對外**完整報告網址（`https://你的網域/report/＜sessionId＞`）予家長時，請設定：

   - `NEXT_PUBLIC_APP_URL`：例如本機 `http://localhost:3000`、上線主網域 `https://你的網站`（**勿**在結尾加斜線）。未設定時，在瀏覽器內操作會**退而求其次**以目前造訪網域組出完整網址；若管理後臺與學生前台網域不同，**務必**設定本變數。

4. 修改 `.env.local` 後請重啟 `npm run dev`。

5. **部署到 Vercel 時**，請在專案 **Settings → Environment Variables** 填入與上方相同鍵名（Production／Preview 視需要勾選），儲存後對最新一筆部署 **Redeploy** 才會套用。

### 家長註冊成功 → 管理者 Email 通知（Resend）

- 家長在 **`/register` 填寫資料**並成功建立 `test_sessions` 後，伺服器會以 [Resend](https://resend.com) 寄出通知信（主旨含「名貫補習班」與學生／家長摘要）；**`RESEND_API_KEY` 僅在伺服器使用，勿加 `NEXT_PUBLIC_`，不會洩露到前端**。
- 若未設定金鑰、收信者或寄件者，僅在伺服器 log 中提示、**不會**讓註冊失敗。
- **必要變數**（見 `.env.example`）  
  - `RESEND_API_KEY`：Resend 後台產生的 API Key  
  - `ADMIN_NOTIFY_EMAIL`：管理者收信信箱（範本預設 **chang.leewei@msa.hinet.net**，可依實務修改）  
  - `EMAIL_FROM`：寄件者；測試階段可填 `onboarding@resend.dev`，上線改為已驗證網域
- 通知信內的「後台查看」按鈕網址格式為：  
  `{NEXT_PUBLIC_APP_URL}/admin-login?redirect=/admin/sessions/{sessionId}`  
  家長需先以管理密碼登入，登入成功後會導向該筆測驗在後臺的脈絡。請在正式站設定正確的 **`NEXT_PUBLIC_APP_URL`**。若未設定，信中會改顯示 session 編號供手動查詢（並嘗試以 `VERCEL_URL` 在 Vercel 上補出預覽網址）。
- **本機測試寄信**：在 `development` 下可對 `POST /api/test-email` 送出一封內建假資料的測試信；**`production` 固定回 403**。

### Vercel：專案重新命名後請改網址

若 Vercel 專案曾由舊名稱改名（例如由 `project-a1a4s` 改為 `p6-j7-math-diagnostic`），**舊子網域**（如 `project-a1a4s.vercel.app`）**通常不再指向目前部署**，瀏覽會出現平台層級 **`404: NOT_FOUND`**（非本專案 Next 的錯誤頁）。

請改為只使用**目前專案**的網址：

1. Vercel → 選已改名的專案（例如 **p6-j7-math-diagnostic**）。
2. **Settings → Domains**：以清單中的 **Production** 網域為準；或到 **Deployments** → 最新一筆 **Ready** → 點 **Visit**，以網址列顯示的站點為準。
3. 更新書籤／分享連結，**勿再使用舊的 `*.vercel.app`**。
4. 若設定與 Git 仍正確但異常，可對最新部署 **Redeploy**；並確認 **Settings → Git** 仍連結本倉庫 `changleewei1/p6-j7-math-ai-diagnostic`。

## 執行資料庫 migration

**建議執行順序**（同一 Supabase 專案，依時間序；SQL Editor 或 CLI 擇一）：

1. `202604220001_init_schema.sql` — 主 schema（題庫、測驗、作答等）  
2. `202604220002_add_marketing_opt_in.sql` — 家長行銷同意  
3. `202604220003_booking_session_id.sql` — 預約關聯 `session_id`（報告導向預約用）  
4. `202604220004_conversion_events.sql` — 轉換／埋點  
5. `202604230001_add_question_videos.sql` — 題目與 YouTube 對應（後臺與報告推薦用）

**A. Supabase 網頁 SQL Editor**  
專案 → **SQL** → 依序貼上各檔內容後執行。

**B. Supabase CLI**（本機有安裝且已 `supabase link` 時）

```bash
supabase db push
```

實際指令以專案設定為準，詳見 [Supabase 文件](https://supabase.com/docs/guides/cli/local-development)。

> **路由保護（後臺）**：本專案使用專案根目錄 **`proxy.ts`**（僅攔截 `/admin`、`/api/admin`；**不影響**首頁、`/register`、`/quiz`、`/report`、`/booking`）。舊版 `middleware.ts` 名稱在 Next 16 已可由 proxy 擔任，請勿再加一層攔截全站。

## 匯入題庫 seed

1. 確認已跑過 migration、`.env.local` 已具備 **同專案** 之 `NEXT_PUBLIC_SUPABASE_URL` 與 `SUPABASE_SERVICE_ROLE_KEY`（匯入腳本不強制需要 anon 金鑰）。

2. 安裝依賴與執行：

   ```bash
   npm install
   npm run seed:questions
   ```

3. 腳本會自 `data/questionBank.seed.json` 讀取；若同 `module + difficulty + prompt` 已存在則**略過**，並於終端列印匯入／略過／失敗筆數。

## 第 3 段已完成內容

### 作答流程（瀏覽器）

1. `/quiz/[sessionId]`：先 `POST /api/quiz/start`，再 `GET /api/quiz/[sessionId]/current`。
2. 選答案 → 選信心度（high / medium / low）→「送出並前往下一題」。
3. `POST /api/quiz/[sessionId]/answer` 寫入 `answers`（含 `shown_at`、`answered_at`、`time_spent_seconds`，不洩漏正解）。
4. 若尚有小題未答：再 `GET .../current` 取得下一題。
5. 若本題為最後一題：answer 回傳 `completed: true` → `POST /api/quiz/[sessionId]/finish`（規則式分析、`summary_json`、`recommendations`、狀態 `completed`）→ 導向 `/report/[sessionId]`。
6. 若重新進入測驗頁時已全答完但未寫入完成狀態：`current` 會 `completed: true`，前端會自動補呼叫 `finish` 再進報告。

### API 一覽（第 3 段新增）

| 方法 | 路徑 | 說明 |
|------|------|------|
| `GET` | `/api/quiz/[sessionId]/current` | 下一道未答題；全答完則 `completed: true`、`question: null`（不洩漏正解欄位） |
| `POST` | `/api/quiz/[sessionId]/answer` | 驗證題目屬於場次、未重複作答，寫入 `answers`，回傳是否已全答完 |
| `POST` | `/api/quiz/[sessionId]/finish` | 驗證題數，`analyzeSession` 後合併敘事等擴充寫入 `summary_json`、寫入 `recommendations`、更新 `test_sessions`；可重複呼叫（已完成則回傳既有摘要） |
| `GET` | `/api/report/[sessionId]` | 學生姓名、完整 `summary_json`、recommendations、**影片建議** `videos`（最多 5 筆）等；未完成則 `reportReady: false` |

### 後端模組

- `lib/quiz/getCurrentQuestion.ts`：`getNextUnansweredSessionQuestion`
- `lib/validations/answer.ts`：送答 body 驗證
- `lib/analysis/analyzeSession.ts`、`lib/analysis/generateBasicRecommendations.ts`
- `types/sessionAnalysis.ts`：`SessionSummaryJsonV1` 結構

### 前端

- `components/quiz/QuizSessionClient.tsx`、`QuizQuestionCard.tsx`、`QuizProgressBar.tsx`：送答、防重送、完成導向
- `components/report/ReportView.tsx` 等、`app/report/[sessionId]/page.tsx`：報告介面

## 第 4 段：招生型報告、診斷敘事、後台與行銷欄位

### 已完成功能

- **報告 UI**：頂部 Hero、規則式「診斷摘要」六段文案（`lib/analysis/generateNarrativeSummary.ts`）、五模組卡片、**Recharts** 三圖表（正答率、用時、信心）、風險標籤、課程建議、**影片建議**（`video_recommendations`＋`lib/analysis/selectVideoRecommendations.ts`）、招生 **CTA**（已完成，見下方「預約試聽與聯絡資訊」）。
- **分析擴充**：`finish` 在 `analyzeSession` 之後，合併敘事、强弱模組、銜接度、建議要點，寫入 `summary_json`（`lib/analysis/enrichSessionReport.ts`）。
- **行銷同意**：`parents.marketing_opt_in`（`supabase/migrations/202604220002_add_marketing_opt_in.sql`），與 `consent`（個資）分欄；註冊表單以 `marketingOptIn` 送出。
- **內部後台**：`/admin` 總覽、`/admin/sessions` 列表（關鍵字／狀態／跟進篩選）、`/admin/sessions/[id]` 詳情與**跟進狀態**更新（`follow_up_status`），以及**報告操作**（新分頁開啟學生報告、一鍵複製報告網址與分享給家長的文案；完整網址建議在環境變數設定 `NEXT_PUBLIC_APP_URL`）與**危險操作**（刪除單筆測驗資料、或刪除該筆學生／家長同配對之所有測驗與名冊）。存取保護：`proxy.ts` ＋ HttpOnly Cookie **`admin_gate`**（以 `ADMIN_DASHBOARD_SECRET` 經 HMAC 產生 cookie 值）。**建議**：從首頁 Footer「**管理入口**」進入 **`/admin-login`** 輸入密碼；亦可沿用 **`/admin?secret=…`** 一次寫入 cookie。
- **API（admin）**：皆使用 `createAdminSupabaseClient()`，且於各 route handler 內建立。摘要如下：

| 方法 | 路徑 | 說明 |
|------|------|------|
| `GET` | `/api/admin/overview` | 總人數、完成數、平均分、等第分佈、弱點模組排行、跟進分佈、最近 10 筆 |
| `GET` | `/api/admin/sessions` | 分頁列表；query：`q`, `status`, `followUp`, `page` |
| `GET` | `/api/admin/sessions/[sessionId]` | 學生／家長、摘要、建議、作答列 |
| `DELETE` | `/api/admin/sessions/[sessionId]` | 刪除此筆測驗（`answers`／`session_questions`／`recommendations`／`test_sessions` 等隨刪；並清除或解除與本場次之 `conversion_events`、`line_push_logs`、關聯之 `bookings.session_id`）；**保留** `students` 與 `parents` |
| `DELETE` | `/api/admin/sessions/[sessionId]/full-delete` | 刪除與本場次**同學生＋家長配對**之所有測驗，再刪學生／家長列（僅在無他場關聯時）；併刪關聯轉換事件、推播日誌、解除預約關聯等 |
| `PATCH` | `/api/admin/sessions/[sessionId]/follow-up` | body: `{ "followUpStatus": "未追蹤" \| "已聯絡" \| "已預約" \| "已報名" }` |
| `POST` | `/api/admin/login` | body: `{ "secret": "與 ADMIN_DASHBOARD_SECRET 相同" }`；成功寫入 `admin_gate` cookie |
| `POST` | `/api/admin/logout` | 清除 `admin_gate` cookie |

### 預約試聽與聯絡資訊（報告 CTA）

- **報告頁 CTA**（`components/report/ReportCtaSection.tsx`）：**聯絡補習班** 外連官方 LINE、**預約試聽** 導向 `/booking`（含 `?sessionId=` 時一併帶入診斷工作階段）、**重新測驗** → `/register`、**返回首頁** → `/`。區塊內嵌 **LINE 諮詢** 與 **服務電話**（可點 `tel:`），實際網址與號碼集中於 **`lib/constants/contact.ts`**（亦用於 `ContactInfoCard`、預約成功頁）。
- **預約頁**：`app/booking/page.tsx`，表單元件 `components/booking/BookingForm.tsx`、成功狀態 `BookingSuccessCard.tsx`；表單樣式與註冊頁一致（Zod、React Hook Form、繁中錯誤、API 錯誤提示）。查詢參數 **`/booking?sessionId=＜uuid＞`**（可選）：會讀取 `GET /api/report/[sessionId]`，預填學生姓名，並依第一則學習建議標題**粗步預選**「想了解的課程」。
- **API**：`POST /api/booking` — 驗證後寫入 `bookings`（`createAdminSupabaseClient()` 僅在 handler 內建立），成功回傳 `{ success: true, bookingId }`。「願意接受聯絡若為否」會併入備註文字；`session_id` 可選、對應診斷場次，需執行 migration `202604220003_booking_session_id.sql`。
- **如何修改官方 LINE 與電話**：僅需編輯 **`lib/constants/contact.ts`** 的 `OFFICIAL_LINE_URL`、`CONTACT_PHONE`（`tel:` 用）、`CONTACT_PHONE_DISPLAY`（畫面顯示用）。

| 方法 | 路徑 | 說明 |
|------|------|------|
| `POST` | `/api/booking` | 預約試聽表單；body 見 `lib/validations/booking.ts`（`BookingBodyInput`） |

### migration：marketing opt-in

1. 在 Supabase SQL Editor 執行 `supabase/migrations/202604220002_add_marketing_opt_in.sql`（或併入既有專案 workflow）。
2. 重啟 `npm run dev`，註冊與管理後台讀寫家長行銷欄位才會成功。

### migration：bookings 關聯診斷工作階段

若需讓 `POST /api/booking` 寫入 `bookings.session_id`（從報告導向預約），請在 Supabase 執行 `supabase/migrations/202604220003_booking_session_id.sql`。未執行時，若 API insert 欄位不存在會失敗，請一併更新本機與遠端 schema。

### 內部後台使用方式

1. 在 `.env.local`（與上線主機的環境變數）設定 **`ADMIN_DASHBOARD_SECRET`**（自訂足夠長的隨機字串）。**禁止**以 `NEXT_PUBLIC_` 暴露到前端；密碼僅在伺服器端與你輸入的欄位比對。
2. 重啟開發伺服器。
3. **建議（一般）**：開啟 **`http://localhost:3000/admin-login`**，輸入與 `ADMIN_DASHBOARD_SECRET` **相同**的密碼，按「進入後台」；成功後寫入 HttpOnly Cookie **`admin_gate`**（`path: /`、**效期 7 日**、 production 下 **`Secure`**），之後可直接造訪 `/admin`。
4. **替代（手動查詢參數，與舊行為相同）**：**`/admin?secret=＜與 .env 相同＞`** 仍會導回並寫入同一顆 `admin_gate` cookie。
5. 後台頁首有「**登出**」，或呼叫 **`POST /api/admin/logout`**，可清除 `admin_gate`；再進後台需重新至 `/admin-login` 或帶 `?secret=`。
6. 未帶正確密碼、亦無有效 cookie 時，受保護的 `/admin` 回 **401**、相關 API 回 JSON `未授權`。

**上線後**：請將 `localhost` 換成實際網域，例如 **`https://你的網域/admin-login`**；環境變數 **`ADMIN_DASHBOARD_SECRET`** 須在 Vercel（或主機）與本機**一致**（值相同、僅存於 server env）。

**首頁入口**：招生首頁 Footer 最底「**管理入口**」導向 **`/admin-login`**。若已具備有效 `admin_gate`，造訪 `/admin-login` 會自動導向 `/admin`。

### 測試報告、影片、跟進

- **完整報告**：新完成的測驗經 `POST /api/quiz/.../finish` 後，`summary_json` 含敘事等擴充欄位，再開 `/report/[sessionId]` 應見新版版面。
- **舊筆測驗**（第 3 段前產生）：可無敘事段落，但仍有模組分數、圖表、建議；或請受測者**重測**以產生新摘要。
- **影片**：`npm run seed:videos` 或依 `data/videoRecommendations.seed.json` 手動在 Supabase `video_recommendations` 建資料；`GET /api/report/[sessionId]` 會帶入 `videos` 陣列（最多 5 筆，弱點模組優先）。

### 第 5 段預留（尚未實作）

- LINE Flex 與推播
- 完整 CRM、CSV 匯出、多角色權限與帳密登入
- 自適應測驗 **v3** 引擎
- 題庫後台 **CRUD**
- RLS 全開與審計日誌
- 家長帳密系統

## 目錄結構（摘要）

```text
app/
  page.tsx, register/, quiz/, report/, booking/, admin/, admin-login/
  api/register, api/quiz/..., api/report/..., api/booking, api/admin/...
components/   home, register, quiz, report, booking, admin, ui
lib/
  validations/, quiz/, analysis/, admin/, report/（`getReportUrl` 等）, constants/, supabase/
proxy.ts（/admin 與 /api/admin 之簡化驗證）
types/   sessionAnalysis, database, quiz, api
scripts/ import-question-bank.ts, import-video-recommendations.ts
data/    questionBank.seed.json, videoRecommendations.seed.json
supabase/migrations/
```

### npm scripts 補充

- `npm run seed:videos`：匯入 `data/videoRecommendations.seed.json` 至 `video_recommendations`（可重複執行，以 module+title+url 去重）。

## 正式上線與 Vercel 部署

- **一鍵檢查表**：[`docs/deployment-checklist.md`](./docs/deployment-checklist.md)（GitHub／Vercel 設定、環境變數、Migration 順序、Seed、上線後驗證路徑）
- **靜態健康頁**：`GET /health`（Deployment OK 提示）  
- **健康 API**：`GET /api/health` → `{ "success": true, "message": "API OK" }`  
- **Node 版本**：建議 **20+**（見 `package.json` 的 `engines`；Vercel 可在專案設定中選 Node 20）
- 部署前請執行 **`npm run build`** 確認可建置；上線分支建議以 **`main`** 為 Production。

上線前請再次確認：若報告或後臺要產生**正確的完整 `https` 分享連結**，務必在 Vercel 設定 **`NEXT_PUBLIC_APP_URL`** 為學生／家長實際造訪的網域。

**Tailwind 樣式**：`app/globals.css` 使用 `@import "tailwindcss" source("..");`，且 `tailwindcss`／`@tailwindcss/postcss` 已列於 **`dependencies`**，以避免正式站與本機路徑不一致時首頁「無樣式」。詳見 `docs/deployment-checklist.md` §7。

## 開發

```bash
npm install
npm run dev
```

## License

Private project.
