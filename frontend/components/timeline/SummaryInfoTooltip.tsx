"use client"

import { Info } from "lucide-react"

export default function SummaryInfoTooltip() {
  return (
    <div className="group relative shrink-0">
      <button
        type="button"
        aria-label="AI 요약 안내"
        className="flex size-6 cursor-pointer items-center justify-center rounded-full text-neutral-300 transition-colors duration-200 hover:text-neutral-400"
      >
        <Info size={16} />
      </button>
      <div className="pointer-events-none absolute top-full right-0 z-10 mt-2 hidden w-114 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-popover p-3 text-[12px] leading-relaxed text-muted-foreground shadow-lg group-hover:block">
        <p className="mb-1 font-semibold text-popover-foreground">
          🐜 개미봇 알림
        </p>
        <p>
          AI 개미가 빠르게 훑어온 요약 정보입니다. <br />
          시장 탐색용으로 가볍게 참고해 주시고, 최종 투자 결정과 책임은 투자자
          본인에게 있습니다.
        </p>
      </div>
    </div>
  )
}
