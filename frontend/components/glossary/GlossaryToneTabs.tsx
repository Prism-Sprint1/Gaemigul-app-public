"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui"
import { TONE_FILTERS, type ToneFilter } from "@/lib/glossary"
import { SEGMENT_LIST, SEGMENT_TRIGGER } from "@/lib/constant/surface"

/** 페이지 상단 "난이도 필터" 칩 — 목록을 거르지 않고 모든 카드의 설명 톤을 한꺼번에 바꾼다 */
export function GlossaryToneTabs({
  value,
  onChange,
}: {
  value: ToneFilter
  onChange: (tone: ToneFilter) => void
}) {
  return (
    <Tabs value={value} onValueChange={(next) => onChange(next as ToneFilter)}>
      <TabsList className={SEGMENT_LIST}>
        {TONE_FILTERS.map(({ key, label }) => (
          <TabsTrigger
            key={key}
            value={key}
            className={SEGMENT_TRIGGER}
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
