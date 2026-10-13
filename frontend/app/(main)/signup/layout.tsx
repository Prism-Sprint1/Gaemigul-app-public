import { pageMetadata } from "@/lib/site"

export const metadata = pageMetadata({
  title: "회원가입",
  description:
    "개미굴에 가입하고 맞춤 용어 학습과 시황 정보를 이용해 보세요",
  path: "/signup",
})

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
