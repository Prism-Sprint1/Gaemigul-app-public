// ── 백엔드 GET /glossary/terms 응답 DTO (backend/domain/glossary/schemas/glossary_term.py와 1:1 대응) ──
// timeline 도메인의 ApiGlossaryTerm(용어 -> 설명 dict, "오늘의 개미 용어 한 입"용)과는 별개 데이터다.

export type GlossaryDifficulty = "애기 개미" | "청년 개미" | "고참 개미"

export type ApiGlossaryTerm = {
  id: number
  term: string
  // 이번 "개미 용어 사전" 페이지 UI는 이 값을 쓰지 않는다(향후 카드 배지 기능용으로 미리 내려받아 둠)
  difficulty: GlossaryDifficulty
  easy_description: string
  mid_description: string
  hard_description: string
  related_terms: string[]
}
