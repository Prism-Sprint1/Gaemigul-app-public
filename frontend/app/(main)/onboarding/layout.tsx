import { pageMetadata } from "@/lib/site"

export const metadata = pageMetadata({
  title: "투자 등급 퀴즈",
  description: "나에게 맞는 용어 난이도를 찾는 투자 등급 퀴즈",
  path: "/onboarding/grade-quiz",
  noindex: true,
})

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
