import { pageMetadata } from "@/lib/site"

export const metadata = pageMetadata({
  title: "마이페이지",
  description:
    "내 정보와 학습 기록을 관리하세요",
  path: "/mypage",
  noindex: true,
})

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
