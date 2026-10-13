import { pageMetadata } from "@/lib/site"

export const metadata = pageMetadata({
  title: "로그인",
  description:
    "개미굴에 로그인하고 나만의 투자 용어 학습과 관심 정보를 이어가세요",
  path: "/login",
})

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
