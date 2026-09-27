"use client"

import { Info } from "lucide-react"

type InfoTooltipProps = {
  label: string
  children: React.ReactNode
  className?: string
}

export default function InfoTooltip({
  label,
  children,
  className,
}: InfoTooltipProps) {
  return (
    <div className={`group relative inline-flex shrink-0 ${className ?? ""}`}>
      <button
        type="button"
        aria-label={label}
        className="flex size-5 cursor-pointer items-center justify-center rounded-full text-neutral-300 transition-colors duration-200 hover:text-neutral-400"
      >
        <Info size={14} />
      </button>
      <div className="pointer-events-none absolute top-full left-0 z-10 mt-2 hidden w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-popover p-3 text-[12px] leading-relaxed text-muted-foreground shadow-lg group-hover:block">
        {children}
      </div>
    </div>
  )
}
