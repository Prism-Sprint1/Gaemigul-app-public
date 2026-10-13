import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "경제 캘린더",
  description:
    "수익을 좌우할 주요 경제 지표와 기업 일정을 미리 모아 대비하는 경제 캘린더",
  alternates: { canonical: "/calendar" },
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
