"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui"
import { TONE_FILTERS, type ToneFilter } from "@/lib/glossary"

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
      <TabsList className="h-auto rounded-full bg-neutral-100 p-1 dark:bg-neutral-800">
        {TONE_FILTERS.map(({ key, label }) => (
          <TabsTrigger
            key={key}
            value={key}
            className="rounded-full px-4 py-1.5 text-neutral-500 data-active:bg-point data-active:text-white data-active:shadow-none dark:text-neutral-400"
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
