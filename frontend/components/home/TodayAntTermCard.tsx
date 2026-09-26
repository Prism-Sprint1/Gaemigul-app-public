"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { useAuth } from "@/components/common"
import { Badge } from "@/components/ui"
import { getGlossaryTerms } from "@/lib/api/glossary"
import { descriptionForTone, toneForGrade } from "@/lib/glossary"
import type { ApiGlossaryTerm } from "@/lib/types/GlossaryType"

/** 용어 사전에서 오늘의 한 입으로 보여줄 항목 하나를 날짜 기준으로 고정 선택한다.
 * 목록 순서가 바뀌어도 같은 날엔 같은 용어가 나오도록 id 순으로 정렬한 뒤 고른다. */
function pickDailyTerm(terms: ApiGlossaryTerm[]): ApiGlossaryTerm | null {
  if (terms.length === 0) return null

  const sorted = [...terms].sort((a, b) => a.id - b.id)
  const dayIndex = Math.floor(Date.now() / 86_400_000)
  return sorted[dayIndex % sorted.length]
}

// "개미 용어 사전"(GET /glossary/terms, glossary_term 테이블) 데이터를 쓴다. 예전에 쓰던
// GET /timeline/glossary(백엔드 하드코딩 GLOSSARY)는 레거시로 남겨 두고 여기서는 부르지 않는다
export default function TodayAntTermCard() {
  const { user } = useAuth()
  const [antTerm, setAntTerm] = useState<ApiGlossaryTerm | null>(null)

  useEffect(() => {
    let cancelled = false

    getGlossaryTerms()
      .then((terms) => {
        if (!cancelled) setAntTerm(pickDailyTerm(terms))
      })
      .catch((error) => {
        console.error("[getGlossaryTerms] 실패", error)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // 용어 사전 페이지와 같은 기준 - 비로그인은 청년 개미(mid) 톤, 로그인하면 본인 등급 톤
  const description = useMemo(() => {
    if (!antTerm) return ""
    return descriptionForTone(antTerm, user ? toneForGrade(user.grade) : "mid")
  }, [antTerm, user])

  if (!antTerm) return null

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-point text-[11px] text-white">
            오늘의 한 입
          </Badge>
          <span className="text-sm font-bold text-foreground">
            오늘의 개미 용어 한 입: {antTerm.term}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          &ldquo;{description}&rdquo;
        </p>
        <Link
          href={`/glossary?q=${encodeURIComponent(antTerm.term)}`}
          className="mt-1 inline-flex w-fit items-center gap-1 text-[11px] font-medium text-point hover:underline"
        >
          용어 사전에서 자세히 보기
          <ArrowRight className="size-3" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
