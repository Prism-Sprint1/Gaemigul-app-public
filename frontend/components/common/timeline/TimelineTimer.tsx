"use client"

import { Separator } from "../../ui"
import ScheduleClock from "./ScheduleClock"
import Timeline from "./Timeline"

export default function TimelineTimer() {
  return (
    <>
      <div className="flex w-full items-end justify-between bg-card px-5 py-3">
        {/* 타임라인 타이머 - 매초 갱신은 ScheduleClock 안에서만 일어난다 */}
        <ScheduleClock />
      </div>
      <Separator className="w-full" />
      <Timeline />
    </>
  )
}
