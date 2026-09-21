import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Separator } from "@/components/ui"

/**
 * 인증 관련 페이지(로그인/회원가입/아이디 찾기 등) 공용 레이아웃 - 기존 서브 페이지
 * (비축 캘린더, 개미 용어 사전 등)와 같은 전체 폭 컨테이너/카드 스타일을 그대로 쓴다.
 * 폼 자체는 카드 안에서 좁게(maxWidthClassName) 가운데 정렬한다.
 */
export function AuthCard({
  title,
  description,
  icon: Icon,
  children,
  maxWidthClassName = "max-w-md",
}: {
  title: string
  description?: string
  icon?: LucideIcon
  children: ReactNode
  maxWidthClassName?: string
}) {
  return (
    <div className="flex justify-center bg-background p-3 sm:p-4 lg:p-6">
      <div className="flex w-full flex-col gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-lg leading-none font-bold sm:text-xl lg:text-2xl">
            {Icon && <Icon className="text-point" size={22} />}
            {title}
          </div>
          {description && (
            <p className="truncate text-[10px] text-muted-foreground sm:text-xs">{description}</p>
          )}
        </div>
        <Separator />

        <main className="flex min-w-0 justify-center rounded-xl border bg-card px-3 py-10 shadow-sm sm:px-5 sm:py-14">
          <div className={`w-full ${maxWidthClassName}`}>{children}</div>
        </main>
      </div>
    </div>
  )
}
