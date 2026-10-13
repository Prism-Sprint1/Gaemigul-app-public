import { pageMetadata } from "@/lib/site"

export const metadata = pageMetadata({
  title: "비밀번호 변경",
  description:
    "개미굴 계정 비밀번호를 변경하세요",
  path: "/change-password",
  noindex: true,
})

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
