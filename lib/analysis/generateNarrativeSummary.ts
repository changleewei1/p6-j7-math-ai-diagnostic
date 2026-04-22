import type {
  ConfidenceSummary,
  ModuleAnalysisRow,
  NarrativeSummaryBlock,
} from "@/types/sessionAnalysis";
import type { TimingSummary } from "@/types/sessionAnalysis";
import type { QuizModule } from "@/types/quiz";

export type GenerateNarrativeInput = {
  studentName: string;
  overallLevel: "A" | "B" | "C" | "D";
  overallScore: number;
  moduleResults: ModuleAnalysisRow[];
  timingSummary: TimingSummary;
  confidenceSummary: ConfidenceSummary;
  riskTags: string[];
};

function sortByRate(asc: boolean, rows: ModuleAnalysisRow[]): ModuleAnalysisRow[] {
  return [...rows].sort((a, b) => (asc ? a.correctRate - b.correctRate : b.correctRate - a.correctRate));
}

function nameList(mods: readonly QuizModule[], rows: Map<QuizModule, ModuleAnalysisRow>): string {
  return mods
    .map((m) => rows.get(m))
    .filter((x): x is ModuleAnalysisRow => x != null)
    .map((r) => `「${r.module}」`)
    .join("、");
}

/**
 * 規則式產生家長可讀診斷摘要（繁中、補教語氣、不做外部 AI 呼叫）
 */
export function generateNarrativeSummary(input: GenerateNarrativeInput): NarrativeSummaryBlock {
  const {
    studentName,
    overallLevel,
    overallScore,
    moduleResults,
    timingSummary,
    confidenceSummary,
    riskTags,
  } = input;
  const displayName = studentName.trim() || "同學";
  const byMod = new Map(moduleResults.map((m) => [m.module, m]));
  const bestTwo = sortByRate(false, moduleResults).slice(0, 2);
  const worstTwo = sortByRate(true, moduleResults).slice(0, 2);

  const overviewParts: string[] = [];
  if (overallLevel === "A") {
    overviewParts.push(
      `${displayName} 本次診斷整體表現穩定，已具備不錯的銜接基礎。`,
    );
  } else if (overallLevel === "B") {
    overviewParts.push(
      `${displayName} 已具備部分國一銜接基礎，整體仍有可再系統化鞏固的空間。`,
    );
  } else if (overallLevel === "C") {
    overviewParts.push(
      `${displayName} 在幾個模組上可見學習與解題上的落差，建議有節奏地補齊。`,
    );
  } else {
    overviewParts.push(
      `本次診斷中，${displayName} 多數單元仍有明顯加強空間，及早補齊能減少升國一時的斷層。`,
    );
  }
  overviewParts.push(
    `整體分數為 ${String(overallScore)} 分、等第 ${overallLevel}；以下依模組表現、作答節奏與信心，整理觀察重點。`,
  );
  if (worstTwo.length > 0) {
    const w = nameList(
      worstTwo.map((m) => m.module),
      byMod,
    );
    if (w) {
      overviewParts.push(`就模組觀之，可優先關注 ${w} 的穩定度。`);
    }
  }

  const strengthLines: string[] = [];
  for (const m of bestTwo) {
    if (m.correctRate >= 80) {
      strengthLines.push(
        `在「${m.module}」答對率約 ${m.correctRate}%，屬相對強勢，代表在此方向的觀念或計算有良好掌握。`,
      );
    } else {
      strengthLines.push(
        `相對其餘單元，「${m.module}」表現略佳（約 ${m.correctRate}%），可作為建立信心的切入口。`,
      );
    }
  }
  if (strengthLines.length === 0) {
    strengthLines.push(
      `從分模組觀察，${displayName} 的強勢單元尚未顯著突出，可透過有引導的練習，逐步看見「我會的」的分布。`,
    );
  }
  if (moduleResults.some((m) => m.status === "高潛力")) {
    strengthLines.push(
      `有模組在正確與用時的組合上像「高潛力型」表現，代表在節奏與觀念兼顧時，能發揮不錯水準。`,
    );
  }

  const riskLines: string[] = [];
  for (const m of worstTwo) {
    if (m.module === "分數/小數/比例" && m.correctRate < 70) {
      riskLines.push(
        `在分數、小數與比例相關題目表現較不穩定；此區若未提前補強，升國一後在代數與應用銜接時容易吃力。`,
      );
    } else if (m.module === "文字題與閱讀理解" && m.correctRate < 70) {
      riskLines.push(
        `在閱讀條件與列式上較容易猶豫；建議以引導式應用題練習，讓敘事與圖表一起建立習慣。`,
      );
    } else if (m.correctRate < 50) {
      riskLines.push(
        `「${m.module}」單元答對率偏低，建議釐清是觀念或步驟斷在何處，再分段補。`,
      );
    }
  }
  if (timingSummary.slowQuestionCount >= 2) {
    riskLines.push(
      `有數題作答時間明顯偏長，可能代表列式、計算或判讀在壓力下還不夠順手。`,
    );
  }
  for (const t of riskTags) {
    if (t.includes("分數") || t.includes("比例")) {
      riskLines.push(
        `綜合指標上亦見「分數比例」相關的穩定度提醒，可與導師討論是否需專章複習。`,
      );
      break;
    }
  }
  if (confidenceSummary.highConfidenceWrongCount >= 2) {
    riskLines.push(
      `部分錯誤出現在「自評較有把握」的題目上，顯示少數觀念或判讀可能有誤判，宜重新釐清。`,
    );
  }
  if (riskLines.length === 0) {
    riskLines.push(
      `目前沒有單一極端警訊，但建議仍依弱勢單元做週性檢核，讓學習能「看得見小進步」。`,
    );
  }

  const studyLines: string[] = [];
  if (confidenceSummary.lowConfidenceCorrectCount > 0 && overallLevel !== "D") {
    studyLines.push(
      `出現「信心偏低但其實答對」的題目，顯示基礎存在但穩定度與自我評估可再校準。`,
    );
  }
  if (timingSummary.fastButInaccurateCount >= 1) {
    studyLines.push(
      `有偏快卻未答妥的情形，可練習「讀完再下筆」的節奏，減少漏看條件。`,
    );
  }
  if (worstTwo.some((m) => m.module === "幾何與圖形" && m.correctRate < 60)) {
    studyLines.push(
      `圖形與空間相關題，可從關鍵性質與圖上標記兩手並進，讓作圖也成為解題步驟。`,
    );
  }
  if (studyLines.length === 0) {
    studyLines.push(
      `建議以兩週一小段、每段聚焦一個模組的方式穩定練習，並在錯題旁簡要寫出「我卡在哪一步」。`,
    );
  } else {
    studyLines.push(
      `可搭配少量錯題再現與老師一對一討論，讓學習迴路再縮短。`,
    );
  }

  const parentMsgLines: string[] = [];
  parentMsgLines.push(
    `感謝您願意陪 ${displayName} 完成診斷。數學銜接重在「釐清學到什麼、哪裡還不踏實」，我們會依需要提供更聚焦的學習建議。`,
  );
  if (overallLevel === "C" || overallLevel === "D") {
    parentMsgLines.push(
      `此階段出現差距並非定論，關鍵是接下來的節奏與支持；我們很樂意與您討論合適的課程或練習路徑。`,
    );
  } else {
    parentMsgLines.push(
      `若希望進一步了解課程如何銜接段考重點，歡迎透過本頁下方管道與我們聯絡。`,
    );
  }

  return {
    headline: `${displayName} 的診斷觀察：等第 ${overallLevel}（${String(overallScore)} 分）`,
    overviewParagraph: overviewParts.join(" "),
    strengthsParagraph: strengthLines.join(" "),
    risksParagraph: Array.from(new Set(riskLines)).join(" "),
    studyAdviceParagraph: studyLines.join(" "),
    parentMessageParagraph: parentMsgLines.join(" "),
  };
}
