import type { ApiGlossaryTerm } from "@/lib/types/GlossaryType"

// 페이지 상단 "난이도 필터" 칩의 키. 목록을 거르지 않고, 모든 카드의 설명 톤을 한꺼번에 바꾸는 용도다.
// "전체"와 "청년 개미"는 같은 톤(mid)을 쓴다 - 팀 확인 사항: "전체" 기본 톤은 mid로 통일.
export type ToneFilter = "all" | "easy" | "mid" | "hard"

export const TONE_FILTERS: { key: ToneFilter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "easy", label: "애기 개미" },
  { key: "mid", label: "청년 개미" },
  { key: "hard", label: "고참 개미" },
]

const TONE_FIELD: Record<ToneFilter, keyof ApiGlossaryTerm> = {
  all: "mid_description",
  easy: "easy_description",
  mid: "mid_description",
  hard: "hard_description",
}

/** 선택된 톤 필터에 맞는 설명 문장을 고른다 */
export function descriptionForTone(term: ApiGlossaryTerm, tone: ToneFilter): string {
  return term[TONE_FIELD[tone]] as string
}

/** 로그인한 유저의 등급에 맞는 톤을 기본값으로 고른다. 처음 진입 시 한 번만 쓰인다(설계 단계에서
 * "나중에 붙이기 쉬운 구조로" 요청받은 부분 - 등급 값이 늘어나도 이 매핑만 고치면 된다) */
export function toneForGrade(grade: string): ToneFilter {
  if (grade === "애기 개미") return "easy"
  if (grade === "고참 개미") return "hard"
  return "mid" // 청년 개미 + 알 수 없는 값은 중간 톤
}

/** 검색어로 용어명을 거른다 (대소문자·공백 무시) */
export function matchesQuery(term: ApiGlossaryTerm, query: string): boolean {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return term.term.toLowerCase().includes(normalized)
}
