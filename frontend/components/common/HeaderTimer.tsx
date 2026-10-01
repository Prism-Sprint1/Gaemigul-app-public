"use client"

import { Badge } from "@/components/ui"
import { useIndicatorCountdown } from "@/hooks/use-indicator-schedule"

export default function HeaderTimer() {
  const remaining = useIndicatorCountdown()

  return (
    <strong className="flex items-center gap-1 text-[18px] text-point">
      <Badge className="bg-point text-[12px] text-white">TIMER</Badge>
      {remaining}
    </strong>
  )
}
