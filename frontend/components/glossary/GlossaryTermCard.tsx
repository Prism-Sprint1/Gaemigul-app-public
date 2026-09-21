import { Star } from "lucide-react"
import { useRef } from "react"

import { Badge } from "@/components/ui"
import { useRecordTermView } from "@/hooks/use-record-term-view"
import { descriptionForTone, type ToneFilter } from "@/lib/glossary"
import type { ApiGlossaryTerm } from "@/lib/types/GlossaryType"

// 난이도 배지는 이번 스코프에서 UI에 쓰지 않는다 (difficulty 데이터는 향후 카드 배지 기능을 위해
// 미리 채워둔 상태 - 팀 확인 사항 참고). 톤 필터로 고른 설명 한 줄과 연관 용어 태그만 보여준다
export function GlossaryTermCard({
  term,
  tone,
  onTagClick,
  trackView = false,
  favorited = false,
  onToggleFavorite,
}: {
  term: ApiGlossaryTerm
  tone: ToneFilter
  onTagClick: (relatedTerm: string) => void
  /** 로그인 상태일 때만 true로 내려온다 - 등급 시스템 활동 점수용 열람 기록 대상 여부 */
  trackView?: boolean
  favorited?: boolean
  onToggleFavorite: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  useRecordTermView(cardRef, term.id, trackView)

  return (
    <div ref={cardRef} className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="font-bold">{term.term}</span>
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={favorited ? "즐겨찾기 해제" : "즐겨찾기 추가"}
          aria-pressed={favorited}
          className="shrink-0 cursor-pointer text-muted-foreground hover:text-amber-500"
        >
          <Star
            size={18}
            className={favorited ? "fill-amber-400 text-amber-500" : ""}
          />
        </button>
      </div>
      <p className="text-sm text-muted-foreground">
        {descriptionForTone(term, tone)}
      </p>

      {term.related_terms.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {term.related_terms.map((relatedTerm) => (
            <button
              key={relatedTerm}
              type="button"
              onClick={() => onTagClick(relatedTerm)}
            >
              <Badge
                variant="outline"
                className="cursor-pointer text-[11px] hover:bg-muted"
              >
                #{relatedTerm}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
