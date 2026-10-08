"use client"

import type { ComponentProps } from "react"

import { trackEvent } from "@/lib/analytics"
import { FEEDBACK_FORM_URL } from "@/lib/site"

type FeedbackLinkProps = Omit<
  ComponentProps<"a">,
  "href" | "target" | "rel"
> & {
  /** 어디서 눌렀는지(GA4 이벤트 구분용) - 예: "footer", "home_banner" */
  location: string
}

/** 피드백 구글폼으로 가는 링크 - 새 탭으로 열고, 클릭을 GA4 이벤트(feedback_click)로 남긴다 */
export default function FeedbackLink({
  location,
  onClick,
  children,
  ...props
}: FeedbackLinkProps) {
  return (
    <a
      {...props}
      href={FEEDBACK_FORM_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => {
        trackEvent("feedback_click", { location })
        onClick?.(event)
      }}
    >
      {children}
    </a>
  )
}
