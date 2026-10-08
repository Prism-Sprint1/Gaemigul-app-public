import { MessageSquareHeart } from "lucide-react"

import FeedbackLink from "@/components/common/FeedbackLink"
import { SECTION_CARD } from "@/lib/constant/surface"
import { cn } from "@/lib/utils"

/** 메인 맨 아래 피드백 배너 - 검색으로 들어온 사용자도 의견을 남길 수 있게 구글폼으로 연결한다 */
export default function FeedbackBanner() {
  return (
    <section
      className={cn(
        SECTION_CARD,
        "flex flex-col gap-4 bg-point/5 sm:flex-row sm:items-center sm:justify-between"
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <MessageSquareHeart
          className="mt-0.5 size-5 shrink-0 text-point"
          aria-hidden
        />
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-sm font-bold text-foreground sm:text-base">
            개미굴이 더 단단해지려면 여러분의 한마디가 필요해요
          </h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            불편했던 점, 있었으면 하는 기능을 알려주세요. 1분이면 충분해요!
          </p>
        </div>
      </div>
      <FeedbackLink
        location="home_banner"
        className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-point px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 active:translate-y-px"
      >
        피드백 남기기
      </FeedbackLink>
    </section>
  )
}
