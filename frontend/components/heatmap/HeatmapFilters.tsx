"use client"

import { useEffect, useState } from "react"
import { Clock3, Lock, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SEGMENT_LIST, SEGMENT_TRIGGER } from "@/lib/constant/surface"
import {
  formatCountdown,
  isAfterMarketClose,
  PERIOD_LABELS,
} from "@/lib/heatmap-format"
import type { HeatmapMarket, HeatmapPeriod } from "@/lib/types/HeatmapType"

const MARKETS = ["kospi", "kosdaq"] as const
const PERIODS = ["day", "week", "month"] as const

export default function HeatmapFilters({
  market,
  period,
  onMarketChange,
  onPeriodChange,
  nextUpdateAt,
  manualRefreshDisabled,
  isLoading,
  refreshWaitSeconds,
  onRefresh,
}: {
  market: HeatmapMarket
  period: HeatmapPeriod
  onMarketChange: (market: HeatmapMarket) => void
  onPeriodChange: (period: HeatmapPeriod) => void
  nextUpdateAt: string | null | undefined
  manualRefreshDisabled: boolean
  isLoading: boolean
  refreshWaitSeconds: number
  onRefresh: () => void
}) {
  const isCoolingDown = refreshWaitSeconds > 0
  const [marketClosed, setMarketClosed] = useState(isAfterMarketClose)
  const [remainingMs, setRemainingMs] = useState(() =>
    nextUpdateAt ? Date.parse(nextUpdateAt) - Date.now() : null
  )

  useEffect(() => {
    function tick() {
      setMarketClosed(isAfterMarketClose())
      setRemainingMs(
        nextUpdateAt ? Date.parse(nextUpdateAt) - Date.now() : null
      )
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [nextUpdateAt])

  const updateDisabled = manualRefreshDisabled || marketClosed

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2.5">
          <Tabs
            value={market}
            onValueChange={(value) => onMarketChange(value as HeatmapMarket)}
          >
            <TabsList
              aria-label="시장 선택"
              className={SEGMENT_LIST}
            >
              {MARKETS.map((value) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={SEGMENT_TRIGGER}
                >
                  {value.toUpperCase()}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Tabs
            value={period}
            onValueChange={(value) => onPeriodChange(value as HeatmapPeriod)}
          >
            <TabsList
              aria-label="기간 선택"
              className={SEGMENT_LIST}
            >
              {PERIODS.map((value) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={SEGMENT_TRIGGER}
                >
                  {PERIOD_LABELS[value]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {!marketClosed && remainingMs !== null && (
            <span
              className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 tabular-nums"
              aria-label="다음 자동 갱신까지 남은 시간"
            >
              <Clock3 className="size-3.5" />
              다음 갱신까지 {formatCountdown(remainingMs)}
            </span>
          )}
          <Button
            size="sm"
            disabled={updateDisabled}
            onClick={onRefresh}
            aria-label={
              marketClosed
                ? "장 마감 이후에는 업데이트할 수 없습니다"
                : isCoolingDown
                  ? `${refreshWaitSeconds}초 후 수동 업데이트 가능`
                  : "최신 히트맵 다시 확인"
            }
            title={
              marketClosed
                ? "정규장 마감(15:30) 이후에는 업데이트할 수 없습니다."
                : "수동 업데이트는 1분에 한 번 가능합니다."
            }
            className="h-10 rounded-lg bg-neutral-900 px-3 text-xs font-semibold text-white tabular-nums hover:bg-neutral-700 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:opacity-100 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-400"
          >
            {marketClosed || isCoolingDown ? (
              <Lock />
            ) : (
              <RefreshCw
                className={isLoading ? "motion-safe:animate-spin" : ""}
              />
            )}
            {marketClosed
              ? "장 마감"
              : isCoolingDown
                ? `${refreshWaitSeconds}초`
                : "새로고침"}
          </Button>
        </div>
      </div>
      {marketClosed && (
        <p className="mt-3 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
          장 마감 이후에는 마지막 수집 시세를 표시합니다. 다음 정규장에
          갱신됩니다.
        </p>
      )}
    </div>
  )
}
