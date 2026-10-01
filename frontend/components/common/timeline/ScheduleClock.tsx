"use client"

import { formatClock } from "@/lib/utils"

import { useTimelineSchedule } from "./use-timeline-schedule"

/**
 * "현재 시간 / 다음 일정 / 남은 시간" 시계. 매초 갱신되므로 이 부분만 따로 리렌더링되게 분리했다
 * (사이드바 전체와 그 안의 타임라인 목록이 매초 다시 그려지지 않도록). 감싸는 레이아웃은 쓰는 쪽에서 정한다.
 */
export default function ScheduleClock() {
  const { now, nextItem, remainingLabel } = useTimelineSchedule(1000)

  return (
    <>
      <div className="flex flex-col gap-0.5">
        <span className="text-[12px] text-muted-foreground">현재 시간</span>
        <strong className="text-[24px] leading-6 font-semibold tracking-[1px] text-foreground">
          {now ? formatClock(now) : "--:--:--"}
        </strong>
      </div>
      <div className="text-right text-[12px] text-muted-foreground">
        <p>다음 일정</p>
        <p className="pt-0.75 text-foreground">
          {nextItem ? nextItem.title : "-"}
        </p>
        <p className="font-semibold text-point">{remainingLabel ?? "-"}</p>
      </div>
    </>
  )
}
