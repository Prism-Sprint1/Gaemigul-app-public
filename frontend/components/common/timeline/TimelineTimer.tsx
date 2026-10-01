"use client"

import { formatClock } from "@/lib/utils"

import { Separator } from "../../ui"
import Timeline from "./Timeline"
import { useTimelineSchedule } from "./use-timeline-schedule"

export default function TimelineTimer() {
  const { now, nextItem, remainingLabel } = useTimelineSchedule(1000)

  return (
    <>
      <div className="w-full bg-card px-5 py-3 pr-1">
        <div className="text-right text-[12px] text-muted-foreground">
          {/* 타임라인 타이머 */}
          <div className="flex gap-0.5">
            {/* <span className="text-[12px] text-muted-foreground">현재 시간</span> */}
            <div className="flex w-full items-center justify-between">
              <strong className="text-[32px] leading-6 font-bold tracking-[1px] text-foreground">
                {now ? formatClock(now) : "--:--:--"}
              </strong>

              <div className="mt-px flex flex-col gap-px">
                <div className="flex items-center justify-end">
                  {/* <p>다음 일정 | </p> */}
                  <p className="text-[10px] text-foreground">
                    {nextItem ? nextItem.title : "-"}
                  </p>
                </div>
                <p className="-mt-1 font-semibold text-point">
                  {remainingLabel ?? "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col gap-1">
        <Separator className="w-full" />
        <Separator className="w-full" />
      </div>
      <Timeline />
    </>
  )
}
