import { pageMetadata } from "@/lib/site"

export const metadata = pageMetadata({
  title: "아이디 찾기",
  description:
    "가입한 이메일로 개미굴 아이디를 찾아보세요",
  path: "/find-id",
  noindex: true,
})

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
