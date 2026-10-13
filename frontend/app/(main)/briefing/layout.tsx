import { pageMetadata } from "@/lib/site"

export const metadata = pageMetadata({
  title: "시황 브리핑",
  description:
    "국내외 시장의 핵심 뉴스와 흐름을 AI가 요약한 데일리 브리핑",
  path: "/briefing",
})

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
