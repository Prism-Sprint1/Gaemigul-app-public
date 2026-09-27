"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Info, type LucideIcon } from "lucide-react"

import { cn, supportsHover } from "@/lib/utils"

type InfoTooltipProps = {
  label: string
  children: React.ReactNode
  className?: string
  icon?: LucideIcon
  iconSize?: number
  buttonClassName?: string
  panelClassName?: string
}

// 모든 툴팁 패널은 앵커 위치와 무관하게 브라우저 화면 우측에서 16px 띄운 자리에 뜬다.
const SCREEN_EDGE_GAP = 16
// 버튼 바로 아래 8px 간격(기존 mt-2와 동일)
const VERTICAL_GAP = 8

export default function InfoTooltip({
  label,
  children,
  className,
  icon: Icon = Info,
  iconSize = 14,
  buttonClassName,
  panelClassName,
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false)
  const [hoverOpen, setHoverOpen] = useState(false)
  const [top, setTop] = useState(0)
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // 클릭(모바일 포함)으로 열렸거나, 호버 가능한 기기에서 마우스가 올라가 있으면 보인다.
  const visible = open || hoverOpen

  useEffect(() => {
    setMounted(true)
  }, [])

  const updatePosition = () => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) setTop(rect.bottom + VERTICAL_GAP)
  }

  useLayoutEffect(() => {
    if (visible) updatePosition()
  }, [visible])

  useEffect(() => {
    if (!visible) return

    const close = () => {
      setOpen(false)
      setHoverOpen(false)
    }
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (
        !containerRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        close()
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close()
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    window.addEventListener("resize", updatePosition)
    // 스크롤되는 중첩 컨테이너(대장 챗 패널 등)까지 감지하도록 캡처 단계에서 듣는다.
    window.addEventListener("scroll", updatePosition, true)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
    }
  }, [visible])

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-flex shrink-0", className)}
      onMouseEnter={() => {
        // 터치 기기(pointer: coarse)에서는 호버로 열리지 않고 클릭으로만 연다.
        if (supportsHover()) setHoverOpen(true)
      }}
      onMouseLeave={() => setHoverOpen(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={visible}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex size-5 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors duration-200 hover:bg-neutral-100 hover:text-neutral-600",
          buttonClassName
        )}
      >
        <Icon size={iconSize} />
      </button>
      {mounted &&
        createPortal(
          // document.body에 직접 포탈로 그려서, 부모 트리에 transform/필터가 있어도
          // position:fixed가 항상 실제 브라우저 뷰포트 기준으로 동작하게 한다.
          // 등장 효과는 transform 없이 opacity만으로 처리한다.
          <div
            ref={panelRef}
            className={cn(
              "fixed z-10 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-popover p-3 text-[12px] leading-relaxed text-muted-foreground shadow-lg transition-opacity duration-150",
              visible
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0",
              panelClassName
            )}
            style={{ top, right: SCREEN_EDGE_GAP }}
          >
            {children}
          </div>,
          document.body
        )}
    </div>
  )
}
