import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "섹터 히트맵",
  description:
    "상승률부터 연관 산업, 최신 뉴스까지 섹터별 시장 온도를 한눈에 보는 히트맵",
  alternates: { canonical: "/heatmap" },
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
