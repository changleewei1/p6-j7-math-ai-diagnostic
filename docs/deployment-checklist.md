# 正式上線部署檢查清單（Vercel + Supabase）

本專案為 **Next.js（App Router）+ TypeScript + Tailwind + Supabase**，可部署至 **Vercel**。完成下列步驟可縮小上線風險。

---

## 1. GitHub 上線前檢查

1. 確認 **`main` 分支**已包含要上線的程式碼，且與遠端同步。
2. 本機可成功建置：  
   `npm ci`（或 `npm install`）→ `npm run build`
3. 不要將 **`.env.local`**、**`SUPABASE_SERVICE_ROLE_KEY`**、**`ADMIN_DASHBOARD_SECRET`** 提交到公開儲存庫。

---

## 2. Vercel 新建專案步驟

1. 登入 [Vercel](https://vercel.com) → **Add New…** → **Project**。
2. **Import** 本 Git 儲存庫，選 **Production Branch**：**`main`**（勿選錯分支）。
3. **Root Directory**：留空或 **`./`**（專案在 repo 根目錄時）。
4. **Framework Preset**：應自動偵測為 **Next.js**；**Build Command** 預設 `next build` 即可，**Output** 由 Vercel 處理。
5. 於下方 **Environment Variables** 先依 [§3](#3-environment-variables) 填寫，再點 **Deploy**。
6. 若舊的 Vercel 專案曾改名、網域混亂或長期 404，**建議新建專案**並使用新 Production 網域測試，避免歷史設定干擾。

---

## 3. Environment Variables

在 Vercel **Settings → Environment Variables** 中，**Production**（與需要時 **Preview**）應具備與下表相同之 **鍵名**（值依你的 Supabase／營運需求填寫）：

| 變數 | 必填 | 說明 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 是 | Supabase 專案 URL（**Project Settings → API**） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 是 | Anon public key（同上） |
| `SUPABASE_SERVICE_ROLE_KEY` | 是 | Service role，**僅放伺服器**；勿加 `NEXT_PUBLIC_` |
| `ADMIN_DASHBOARD_SECRET` | 是* | 足夠長的隨機字串，供 `/admin-login` 與 `proxy` 驗證；勿暴露於前端建置 |
| `NEXT_PUBLIC_APP_URL` | 強烈建議 | 正式站**完整根網址**（如 `https://你的網域`），**勿**尾隨斜線。後臺「複製報告連結」、對外分享需正確網域時**必須**設定 |

\*若未設 `ADMIN_DASHBOARD_SECRET`，後臺相關路由會回 **503**，其餘前台不受影響。

儲存變數後，請對**最新一筆部署執行 Redeploy**，環境變數才會完整套用至執行中的 Serverless 函式。

參考範本：專案根目錄 **`.env.example`**。

---

## 4. Supabase：Migration 執行順序

請在 **同一個 Supabase 專案** 依檔名時間序執行（**SQL Editor 貼上執行** 或 **Supabase CLI `db push`** 皆可）：

| 順序 | 檔案 | 內容摘要 |
|------|------|----------|
| 1 | `202604220001_init_schema.sql` | 主 schema（含 `question_bank`、測驗相關表等） |
| 2 | `202604220002_add_marketing_opt_in.sql` | 家長行銷同意欄位 |
| 3 | `202604220003_booking_session_id.sql` | `bookings.session_id`（預約與診斷場次關聯） |
| 4 | `202604220004_conversion_events.sql` | 轉換事件表（埋點用） |
| 5 | `202604230001_add_question_videos.sql` | 題目與 YouTube 對應表 `question_videos` |

若日後還有新增 migration，請併入同一流程、依檔名順序執行。

---

## 5. 本機／CI 可選：Seed 指令

| 指令 | 時機 | 說明 |
|------|------|------|
| `npm run seed:questions` | 上線前至少一次 | 匯入題庫，否則抽題可能失敗 |
| `npm run seed:videos` | 可選 | 匯入模組影片庫 `video_recommendations`（報告模組推薦用） |

兩者皆需可存取 **同一 Supabase 專案** 的 `NEXT_PUBLIC_SUPABASE_URL` 與 **`SUPABASE_SERVICE_ROLE_KEY`**（在 Vercel 不會自動幫你跑 seed，請在本機或 CI 對遠端 DB 執行）。

---

## 6. 路由保護與主流程（不影響首頁）

- 本專案使用專案根目錄 **`proxy.ts`**（Next 內建對應 **Edge / Proxy**），`matcher` 僅含 **`/admin/*`** 與 **`/api/admin/*`**。
- **首頁、註冊、測驗、報告、預約、靜態頁**不經此保護，不會被誤攔。

---

## 7. 樣式（Tailwind）在 Vercel 務必可用

本專案已做兩件事（請勿隨意還原）：

1. **`app/globals.css`** 使用 `@import "tailwindcss" source("..");`  
   全域 CSS 置於 `app/` 子目錄時，應讓掃描**以專案根為基準**，否則在 Linux／CI 上可能幾乎掃不到 `app/`、`components/` 內的 class，產出「空 utility」→ 首頁像純 HTML。
2. **`tailwindcss` 與 `@tailwindcss/postcss` 列在 `dependencies`**（非僅 `devDependencies`）  
   正式建置階段一定會安裝，避免少數環境省略 dev 依賴導致 PostCSS 外掛缺失。

若上線後仍無樣式：檢查該次 **Build Logs** 是否有 PostCSS／Tailwind 錯誤，並強制重新整理或略過 CDN 快取後再試。

---

## 8. 部署成功後驗證

於瀏覽器以 **正式網域** 檢查（或 Vercel 提供的 `*.vercel.app`，以目前專案綁定者為準）：

| 路徑 | 預期 |
|------|------|
| `/` | 首頁正常 |
| `/health` | 出現 *Deployment OK* / *Site is running.* |
| `/api/health` | JSON：`{ "success": true, "message": "API OK" }` |
| `/register` | 註冊表單可開啟（送出需 DB／環境變數正確） |
| `/admin-login` | 可開啟；登入後可進入 `/admin`（需 `ADMIN_DASHBOARD_SECRET`） |

若僅 Vercel 出現**平台層級** `NOT_FOUND` 而本機正常，多為**網域／專案指錯**或舊專案殘留，請對照 README「Vercel 專案重新命名」一節。

---

## 9. 上線前最後提醒

1. **GitHub `main` 必須是你要上線的 commit。**
2. Vercel **Production** 需綁定 **`main`（或你們共識的正式分支）**。
3. **Root Directory** 維持空白或 **`./`**（單一 Next app 在 repo 根目錄時）。
4. 舊 Vercel 專案若難以除錯，**新建專案** 往往比較快釐清。
5. 報告連結、後臺分享**完整 https 網址**時，務必設定 **`NEXT_PUBLIC_APP_URL`** 指向正式學生／家長使用的網域。

更細的開發者說明見專案 **README.md**。
