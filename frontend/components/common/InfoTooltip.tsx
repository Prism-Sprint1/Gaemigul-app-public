"use client"

import { useEffect, useRef, useState } from "react"
import { Info } from "lucide-react"

import { cn } from "@/lib/utils"

type InfoTooltipProps = {
  label: string
  children: React.ReactNode
  className?: string
  align?: "left" | "right"
  iconSize?: number
  buttonClassName?: string
  panelClassName?: string
}

const VIEWPORT_GAP = 8

export default function InfoTooltip({
  label,
  children,
  className,
  align = "left",
  iconSize = 14,
  buttonClassName,
  panelClassName,
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false)
  const [shiftX, setShiftX] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // 모바일처럼 좁은 화면에서 툴팁이 화면 밖으로 잘리지 않도록 가로 위치를 보정한다.
  useEffect(() => {
    if (!open) {
      setShiftX(0)
      return
    }

    const panel = panelRef.current
    if (!panel) return

    const rect = panel.getBoundingClientRect()
    const overflowRight = rect.right - (window.innerWidth - VIEWPORT_GAP)
    const overflowLeft = VIEWPORT_GAP - rect.left

    if (overflowRight > 0) {
      setShiftX((prev) => prev - overflowRight)
    } else if (overflowLeft > 0) {
      setShiftX((prev) => prev + overflowLeft)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  return (
    <div
      ref={containerRef}
      className={cn("group relative inline-flex shrink-0", className)}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex size-5 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors duration-200 hover:bg-neutral-100 hover:text-neutral-600",
          buttonClassName
        )}
      >
        <Info size={iconSize} />
      </button>
      <div
        ref={panelRef}
        className={cn(
          "absolute top-full z-20 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-popover p-3 text-[12px] leading-relaxed text-muted-foreground opacity-0 shadow-lg transition-opacity duration-150",
          "pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100",
          align === "right" ? "right-0" : "left-0",
          open && "pointer-events-auto opacity-100",
          panelClassName
        )}
        style={shiftX ? { transform: `translateX(${shiftX}px)` } : undefined}
      >
        {children}
      </div>
    </div>
  )
}
