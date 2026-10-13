import { pageMetadata } from "@/lib/site"

export const metadata = pageMetadata({
  title: "뉴스레터 동의",
  description:
    "개미굴 뉴스레터 수신 동의 안내",
  path: "/newsletter-consent",
  noindex: true,
})

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
