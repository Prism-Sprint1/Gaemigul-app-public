"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { Lightbulb, X } from "lucide-react"
import { cn, formatClock } from "@/lib/utils"

import { Separator } from "../../ui"
import { HeaderAuthAction, ThemeToggle } from "../Header"
import { TimelineTimer, useTimelineSchedule } from "../timeline"

import { useMobileSidebar } from "./MobileSidebarContext"

export default function Sidebar() {
  const { isOpen, close } = useMobileSidebar()
  const pathname = usePathname()
  const { now, nextItem, remainingLabel } = useTimelineSchedule(1000)

  useEffect(() => {
    close()
  }, [pathname, close])

  // TIP 닫힘 여부 - 사이드바는 루트 레이아웃에 붙어 있어 페이지를 옮겨도 언마운트되지 않으므로
  // 한 번 닫으면 새로고침 전까지 계속 닫혀 있다(저장소에 남기지 않아 새로고침하면 다시 보인다)
  const [tipDismissed, setTipDismissed] = useState(false)
  const asideRef = useRef<HTMLElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)

  // TIP은 타임라인 위에 떠 있으므로(absolute), 그 높이를 --sidebar-tip-height로 내려서
  // 타임라인 목록 하단 여백으로 쓴다 - 마지막 항목이 TIP에 가려지지 않게.
  // 모바일에서는 TIP이 display:none이라 높이가 0으로 잡힌다
  useEffect(() => {
    const aside = asideRef.current
    const tip = tipRef.current
    if (!aside || !tip) return

    const update = () =>
      aside.style.setProperty("--sidebar-tip-height", `${tip.offsetHeight}px`)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(tip)
    return () => {
      observer.disconnect()
      aside.style.removeProperty("--sidebar-tip-height")
    }
  }, [tipDismissed])

  return (
    <>
      <div
        onClick={close}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      {/* 모바일 메뉴: 닫혀 있을 때 화면 오른쪽 밖에 요소가 남아 있으면 iOS 등에서 가로 스크롤이 생긴다.
          그래서 닫히는 애니메이션이 끝나면 display:none(transition-discrete)으로 아예 빼고,
          열 때는 starting: 상태(화면 밖)에서 밀려 들어오게 한다. 데스크톱(md 이상)은 항상 보인다 */}
      <aside
        ref={asideRef}
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-67.5 bg-card transition-all transition-discrete duration-300",
          "md:sticky md:top-18.75 md:z-auto md:flex md:h-[calc(100vh-75px)] md:w-auto md:min-w-67.5 md:translate-x-0 md:flex-col md:overflow-hidden",
          isOpen
            ? "translate-x-0 starting:translate-x-full"
            : "translate-x-full max-md:hidden"
        )}
      >
        <div className="flex flex-col gap-2 px-5 py-3 md:hidden">
          <div className="flex items-center justify-between">
            <HeaderAuthAction />
            <button
              type="button"
              onClick={close}
              aria-label="메뉴 닫기"
              className="w-fit p-1 text-neutral-500 dark:text-neutral-400"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-[12px] text-muted-foreground">
                현재 시간
              </span>
              <strong className="text-[24px] leading-6 font-semibold tracking-[1px] text-foreground">
                {now ? formatClock(now) : "--:--:--"}
              </strong>
            </div>
            <div className="text-right text-[12px] text-muted-foreground">
              <p className="flex items-center gap-0.5 pt-0.75 text-foreground">
                <span>다음 일정 |</span>
                {nextItem ? nextItem.title : "-"}
              </p>
              <p className="font-semibold text-point">{remainingLabel ?? ""}</p>
            </div>
          </div>
        </div>
        <Separator className="w-full md:hidden" />
        <div className="absolute bottom-6 left-5 md:hidden">
          <ThemeToggle />
        </div>
        {/* <Separator className="w-full" /> */}
        <div className="hidden min-h-0 md:flex md:flex-1 md:flex-col">
          <TimelineTimer />
        </div>
        {/* 타임라인 위에 떠 있는 TIP - 반투명 배경 + 블러로 뒤 목록이 살짝 비친다 */}
        {!tipDismissed && (
          <div
            ref={tipRef}
            className="absolute inset-x-0 bottom-0 z-10 hidden bg-point3/60 p-3 px-5 backdrop-blur-sm md:block"
          >
            <p className="flex items-center gap-1 pr-6 text-[14px] font-semibold text-point2 dark:text-neutral-900">
              <Lightbulb size="16" />
              TIP 불개미 꿀팁!
            </p>
            <p className="mt-0.5 text-[12px] text-neutral-500 dark:text-neutral-800">
              매크로 지표 발표 직후 5분은 뇌동매매를 멈추고 페로몬 신호의
              방향성을 확인하세요.
            </p>
            <button
              type="button"
              onClick={() => setTipDismissed(true)}
              aria-label="꿀팁 닫기"
              className="absolute top-2 right-2 flex size-6 cursor-pointer items-center justify-center rounded-full text-point2 transition-colors hover:bg-point2/10 dark:text-neutral-900"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
