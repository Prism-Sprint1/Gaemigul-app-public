"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { Lightbulb, X } from "lucide-react"
import { cn } from "@/lib/utils"

import { Separator } from "../../ui"
import { HeaderAuthAction, ThemeToggle } from "../Header"
import { ScheduleClock, TimelineTimer } from "../timeline"

import SidebarNav from "./SidebarNav"
import { useMobileSidebar } from "./MobileSidebarContext"

export default function Sidebar() {
  const { isOpen, close } = useMobileSidebar()
  const pathname = usePathname()

  useEffect(() => {
    close()
  }, [pathname, close])

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
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-67.5 bg-card transition-all transition-discrete duration-300",
          "md:sticky md:top-18.75 md:z-auto md:flex md:h-[calc(100vh-75px)] md:w-auto md:max-w-67.5 md:translate-x-0 md:flex-col md:overflow-hidden",
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
          {/* 매초 갱신되는 시계는 ScheduleClock 안에서만 리렌더링된다 */}
          <div className="flex items-start justify-between">
            <ScheduleClock />
          </div>
        </div>
        <Separator className="w-full md:hidden" />
        <SidebarNav />
        <div className="absolute bottom-6 left-5 md:hidden">
          <ThemeToggle />
        </div>
        <Separator className="w-full" />
        <div className="hidden min-h-0 md:flex md:flex-1 md:flex-col">
          <TimelineTimer />
        </div>
        <div className="hidden shrink-0 bg-point3/60 p-3 px-5 md:block">
          <p className="flex items-center gap-1 text-[14px] font-semibold text-point2 dark:text-neutral-900">
            <Lightbulb size="16" />
            TIP 불개미 꿀팁!
          </p>
          <p className="mt-0.5 text-[12px] text-neutral-500 dark:text-neutral-800">
            매크로 지표 발표 직후 5분은 뇌동매매를 멈추고 페로몬 신호의 방향성을
            확인하세요.
          </p>
        </div>
      </aside>
    </>
  )
}
