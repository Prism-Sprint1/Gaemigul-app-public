import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "실시간 시장 신호",
  description:
    "시장의 급박한 변화와 핵심 뉴스 요약을 페로몬 흔적처럼 빠르게 따라가는 실시간 시황 타임라인",
  alternates: { canonical: "/timeline" },
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
