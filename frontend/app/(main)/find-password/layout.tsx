import { pageMetadata } from "@/lib/site"

export const metadata = pageMetadata({
  title: "비밀번호 찾기",
  description:
    "가입한 이메일로 개미굴 임시 비밀번호를 받아보세요",
  path: "/find-password",
  noindex: true,
})

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
