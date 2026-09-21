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
      className={cn("antialiased", pretendard.variable, "font-sans")}
    >
      <body>
        <ThemeProvider>
          <AuthProvider>
            <MobileSidebarProvider>
              <Header />
              <div className="flex">
                <Sidebar />
                <main className="w-full min-w-0 px-4 py-10 md:px-0 md:py-0">
                  {children}
                </main>
              </div>
              <Footer />
            </MobileSidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
