"use client"

import { useEffect, useState } from "react"

import { Badge } from "@/components/ui"
import { getTimelineGlossary } from "@/lib/api/timeline"

interface AntTerm {
  term: string
  description: string
}

/** 용어 사전에서 오늘의 한 입으로 보여줄 항목 하나를 날짜 기준으로 고정 선택한다. */
function pickDailyTerm(glossary: Record<string, string>): AntTerm | null {
  const entries = Object.entries(glossary)
  if (entries.length === 0) return null

  const dayIndex = Math.floor(Date.now() / 86_400_000)
  const [term, description] = entries[dayIndex % entries.length]
  return { term, description }
}

export default function TodayAntTermCard() {
  const [antTerm, setAntTerm] = useState<AntTerm | null>(null)

  useEffect(() => {
    let cancelled = false

    getTimelineGlossary()
      .then((glossary) => {
        if (!cancelled) setAntTerm(pickDailyTerm(glossary))
      })
      .catch((error) => {
        console.error("[getTimelineGlossary] 실패", error)
      })

    return () => {
      cancelled = true
    }
  }, [])

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
          &ldquo;{antTerm.description}&rdquo;
        </p>
      </div>
    </div>
  )
}
