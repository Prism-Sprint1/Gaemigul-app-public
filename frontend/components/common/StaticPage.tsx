"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// "데이터·AI 이용 안내"(/data-ai-usage)는 "데이터 출처·방법론"으로 합쳤다 (옛 주소는 새 페이지로 이동한다)
const LEGAL_TABS = [
  {
    value: "privacy-policy",
    href: "/privacy-policy",
    label: "개인정보처리방침",
  },
  { value: "terms", href: "/terms", label: "이용약관" },
  {
    value: "newsletter-consent",
    href: "/newsletter-consent",
    label: "개미레터 수신 동의",
  },
  { value: "data-sources", href: "/data-sources", label: "데이터 출처·방법론" },
]

/** 개인정보처리방침/이용약관/데이터 출처·방법론처럼 텍스트 위주 고정 페이지의 공용 레이아웃.
 * 페이지끼리 오가는 탭을 상단 가운데에 둬서 푸터까지 내려가지 않아도 서로 넘나들 수 있게 한다.
 * 본문은 LegalContent.tsx의 조각(LegalSection·LegalTable 등)으로 채운다 */
export default function StaticPage({
  title,
  updatedAt,
  intro,
  children,
}: {
  title: string
  updatedAt: string
  /** 제목 아래 한두 문장 소개 */
  intro?: React.ReactNode
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const activeTab =
    LEGAL_TABS.find((tab) => tab.href === pathname)?.value ?? "privacy-policy"

  return (
    <div className="flex min-h-svh justify-center bg-background p-3 sm:p-4 lg:p-6">
      <div className="flex w-full max-w-220 min-w-0 flex-col items-center gap-8 py-6">
        {/* 좁은 화면에서는 탭이 가로로 스크롤된다 */}
        <Tabs value={activeTab} className="max-w-full min-w-0">
          <div className="max-w-full overflow-x-auto">
            <TabsList className="h-auto w-max rounded-full bg-neutral-100 p-1 dark:bg-neutral-800">
              {LEGAL_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  render={<Link href={tab.href} />}
                  nativeButton={false}
                  className="shrink-0 rounded-full px-4 py-1.5 text-neutral-500 dark:text-neutral-400 data-active:bg-point data-active:text-white data-active:shadow-none"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>

        <div className="flex w-full flex-col gap-2 border-b pb-6">
          <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
          <p className="text-xs text-muted-foreground">
            최종 업데이트 {updatedAt}
          </p>
          {intro && (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {intro}
            </p>
          )}
        </div>

        <div className="flex w-full flex-col gap-10 text-sm leading-relaxed text-foreground">
          {children}
        </div>
      </div>
    </div>
  )
}
