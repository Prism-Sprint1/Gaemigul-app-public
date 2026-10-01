"use client"

import {
  Header,
  Footer,
  ScrollTopButton,
  Sidebar,
  WhisperChat,
} from "@/components/common"
import ReportSidebar from "@/components/home/reportSidebar/ReportSidebar"
import { usePathname } from "next/navigation"

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const activeTargets = ["/briefing", "/timeline"]
  const isMatch = activeTargets.some((target) => pathname.includes(target))

  return (
    <>
      <div className="flex w-full">
        {/* 모든 페이지 공통 콘텐츠 여백: 모바일 좌우 16px·위아래 24px, 데스크톱 사방 24px.
            페이지마다 따로 padding을 주지 말고 여기 값만 바꾼다 */}
        <main
          className={`min-w-0 px-4 py-6 md:p-6 ${isMatch ? "w-full md:w-[calc(100%-270px)]" : "mx-auto w-full 2xl:max-w-7xl"}`}
        >
          {children}
        </main>
        <ReportSidebar />
      </div>
      <WhisperChat />
      <ScrollTopButton />
    </>
  )
}
