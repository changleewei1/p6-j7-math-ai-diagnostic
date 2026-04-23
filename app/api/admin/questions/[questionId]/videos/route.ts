import { assertAdminOr401 } from "@/lib/admin/assertAdminApi";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { parseQuestionIdParam } from "@/lib/validations/quiz";
import { postQuestionVideoBodySchema } from "@/lib/validations/questionVideos";
import type {
  AdminQuestionVideoCreateApiResponse,
  AdminQuestionVideoDto,
  AdminQuestionVideosApiResponse,
} from "@/types/api";
import type { QuestionVideoRow } from "@/types/database";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type RouteParams = { questionId: string };

function toDto(r: QuestionVideoRow): AdminQuestionVideoDto {
  return {
    id: r.id,
    questionId: r.question_id,
    youtubeUrl: r.youtube_url,
    title: r.title,
    priority: r.priority,
    createdAt: r.created_at,
  };
}

/**
 * 後台：單一題目之影片清單
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<RouteParams> },
) {
  const c = (await cookies()).get("admin_gate")?.value;
  const unauth = await assertAdminOr401(c);
  if (unauth) return unauth;

  let questionId: string;
  try {
    questionId = parseQuestionIdParam((await context.params).questionId);
  } catch (e) {
    const m = e instanceof Error ? e.message : "參數錯誤";
    return NextResponse.json({ success: false, message: m, question: null, videos: [] }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();
  const { data: q, error: qe } = await supabase
    .from("question_bank")
    .select("id, module, difficulty, prompt")
    .eq("id", questionId)
    .maybeSingle();

  if (qe) {
    console.error("admin/questions/.../videos get question", qe);
    return NextResponse.json(
      { success: false, message: "讀取題目失敗", question: null, videos: [] } satisfies AdminQuestionVideosApiResponse,
      { status: 500 },
    );
  }
  if (!q) {
    return NextResponse.json(
      { success: false, message: "找不到此題目", question: null, videos: [] } satisfies AdminQuestionVideosApiResponse,
      { status: 404 },
    );
  }

  const { data: rows, error: ve } = await supabase
    .from("question_videos")
    .select("id, question_id, youtube_url, title, priority, created_at")
    .eq("question_id", questionId)
    .order("priority", { ascending: true })
    .order("created_at", { ascending: true });

  if (ve) {
    console.error("admin/questions/.../videos", ve);
    return NextResponse.json(
      { success: false, message: "讀取影片清單失敗", question: null, videos: [] } satisfies AdminQuestionVideosApiResponse,
      { status: 500 },
    );
  }

  const videos = (rows ?? [] as QuestionVideoRow[]).map(toDto);
  return NextResponse.json({
    success: true,
    question: { id: q.id, module: q.module, difficulty: q.difficulty, prompt: q.prompt },
    videos,
  } satisfies AdminQuestionVideosApiResponse);
}

/**
 * 後台：新增題目影片
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<RouteParams> },
) {
  const c = (await cookies()).get("admin_gate")?.value;
  const unauth = await assertAdminOr401(c);
  if (unauth) return unauth;

  let questionId: string;
  try {
    questionId = parseQuestionIdParam((await context.params).questionId);
  } catch (e) {
    const m = e instanceof Error ? e.message : "參數錯誤";
    return NextResponse.json({ success: false, message: m } satisfies AdminQuestionVideoCreateApiResponse, {
      status: 400,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "無效的 JSON" } satisfies AdminQuestionVideoCreateApiResponse,
      { status: 400 },
    );
  }

  const parsed = postQuestionVideoBodySchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "參數驗證失敗";
    return NextResponse.json(
      { success: false, message: msg } satisfies AdminQuestionVideoCreateApiResponse,
      { status: 400 },
    );
  }
  const { youtube_url, title: titleRaw } = parsed.data;
  const title = titleRaw?.trim() ? titleRaw.trim() : null;

  const supabase = createAdminSupabaseClient();
  const { data: q, error: qe } = await supabase
    .from("question_bank")
    .select("id")
    .eq("id", questionId)
    .maybeSingle();

  if (qe) {
    console.error("admin/questions/.../videos post question", qe);
    return NextResponse.json(
      { success: false, message: "讀取題目失敗" } satisfies AdminQuestionVideoCreateApiResponse,
      { status: 500 },
    );
  }
  if (!q) {
    return NextResponse.json(
      { success: false, message: "找不到此題目" } satisfies AdminQuestionVideoCreateApiResponse,
      { status: 404 },
    );
  }

  const { data: maxRow } = await supabase
    .from("question_videos")
    .select("priority")
    .eq("question_id", questionId)
    .order("priority", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPriority = (maxRow?.priority ?? -1) + 1;

  const { data: ins, error: ie } = await supabase
    .from("question_videos")
    .insert({
      question_id: questionId,
      youtube_url: youtube_url,
      title,
      priority: nextPriority,
    })
    .select("id, question_id, youtube_url, title, priority, created_at")
    .single();

  if (ie || !ins) {
    console.error("admin/questions/.../videos insert", ie);
    return NextResponse.json(
      { success: false, message: "新增影片失敗" } satisfies AdminQuestionVideoCreateApiResponse,
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    video: toDto(ins as QuestionVideoRow),
  } satisfies AdminQuestionVideoCreateApiResponse);
}
