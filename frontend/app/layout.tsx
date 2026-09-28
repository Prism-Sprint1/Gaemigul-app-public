import type { Metadata } from "next"
import "./globals.css"
import localFont from "next/font/local"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

import {
  AuthProvider,
  Footer,
  Header,
  MobileSidebarProvider,
  Sidebar,
} from "@/components/common"

const pretendard = localFont({
  src: "../public/fonts/pretendard/PretendardVariable.woff2",
  display: "swap",
  weight: "100 900",
  variable: "--font-pretendard",
})

export const metadata: Metadata = {
  title: "개미굴 | Gaemigul",
  description:
    "국내외 시세·뉴스·일정을 한 화면에서 확인하는 금융 뉴스 요약 및 시황 AI 인사이트 대시보드",
  icons: {
    icon: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      // 가로 스크롤 방지: html은 hidden(iOS Safari는 body 값만으로는 막히지 않는다), body는 clip.
      // 둘 다 hidden이면 body가 스크롤 컨테이너가 되어 sticky(헤더 아래 고정 영역)가 모두 깨지므로 body는 clip으로 둔다
      className={cn(
        "overflow-x-hidden antialiased",
        pretendard.variable,
        "font-sans"
      )}
    >
      <head>
        {/* Google tag (gtag.js) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-6VZETDPYRJ"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-6VZETDPYRJ');
            `,
          }}
        />
      </head>
      <body className="overflow-x-clip">
        <ThemeProvider>
          <AuthProvider>
            <MobileSidebarProvider>
              <Header />
              <div className="flex">
                <Sidebar />
                {/* 페이지 콘텐츠 여백은 (main)/layout.tsx 한 곳에서만 준다 - 여기와 각 페이지에는 넣지 않는다 */}
                <main className="w-full min-w-0">{children}</main>
              </div>
              <Footer />
            </MobileSidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
