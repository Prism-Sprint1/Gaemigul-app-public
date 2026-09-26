"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui"
import { CATEGORY_FILTERS, type CategoryFilter } from "@/lib/glossary"

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
        <TabsList className="h-auto w-max rounded-full bg-neutral-100 p-1 dark:bg-neutral-800">
          {CATEGORY_FILTERS.map(({ key, label }) => (
            <TabsTrigger
              key={key}
              value={key}
              className="shrink-0 rounded-full px-4 py-1.5 text-neutral-500 data-active:bg-point data-active:text-white data-active:shadow-none dark:text-neutral-400"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  )
}
