"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const LEGAL_TABS = [
  { value: "privacy-policy", href: "/privacy-policy", label: "개인정보처리방침" },
  { value: "terms", href: "/terms", label: "이용약관" },
  { value: "data-ai-usage", href: "/data-ai-usage", label: "데이터·AI 이용 안내" },
]

/** 개인정보 처리방침/이용약관/데이터·AI 이용 안내처럼 텍스트 위주 고정 페이지의 공용 레이아웃.
 * 셋 사이를 오가는 탭을 상단 가운데에 둬서 푸터까지 내려가지 않아도 서로 넘나들 수 있게 한다. */
export default function StaticPage({
  title,
  updatedAt,
  children,
}: {
  title: string
  updatedAt: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const activeTab = LEGAL_TABS.find((tab) => tab.href === pathname)?.value ?? "privacy-policy"

  return (
    <div className="flex min-h-svh justify-center bg-background p-3 sm:p-4 lg:p-6">
      <div className="flex w-full max-w-180 flex-col items-center gap-6 py-6">
        <Tabs value={activeTab}>
          <TabsList className="h-auto rounded-full bg-neutral-100 p-1 dark:bg-neutral-800">
            {LEGAL_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                render={<Link href={tab.href} />}
                nativeButton={false}
                className="rounded-full px-4 py-1.5 text-neutral-500 data-active:bg-point data-active:text-white data-active:shadow-none dark:text-neutral-400"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex w-full flex-col gap-1">
          <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
          <p className="text-xs text-muted-foreground">최종 업데이트 {updatedAt}</p>
        </div>
        <div className="flex w-full flex-col gap-6 text-sm leading-relaxed text-foreground [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-foreground [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_section]:flex [&_section]:flex-col [&_section]:gap-2">
          {children}
        </div>
      </div>
    </div>
  )
}
