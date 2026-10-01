"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui"
import { CATEGORY_FILTERS, type CategoryFilter } from "@/lib/glossary"
import { SEGMENT_LIST, SEGMENT_TRIGGER } from "@/lib/constant/surface"
import { cn } from "@/lib/utils"

/** "카테고리 필터" 칩 — GlossaryToneTabs와 같은 모양이지만 목록을 실제로 거른다.
 * 칩이 7개라 좁은 화면에서는 가로로 스크롤된다 */
export function GlossaryCategoryTabs({
  value,
  onChange,
}: {
  value: CategoryFilter
  onChange: (category: CategoryFilter) => void
}) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onChange(next as CategoryFilter)}
      className="max-w-full min-w-0"
    >
      <div className="max-w-full overflow-x-auto">
        <TabsList className={SEGMENT_LIST}>
          {CATEGORY_FILTERS.map(({ key, label }) => (
            <TabsTrigger
              key={key}
              value={key}
              className={cn(SEGMENT_TRIGGER, "shrink-0")}
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  )
}
