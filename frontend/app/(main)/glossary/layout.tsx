import { pageMetadata } from "@/lib/site"

export const metadata = pageMetadata({
  title: "주식·경제 용어 사전",
  description:
    "난이도에 맞는 톤으로 투자 용어를 익히는 개미 주식·경제 용어 사전",
  path: "/glossary",
})

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
