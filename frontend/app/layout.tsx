import type { Metadata } from "next"
import "./globals.css"
import localFont from "next/font/local"
import Script from "next/script"
import { Suspense } from "react"
import GoogleAnalytics from "@/components/common/GoogleAnalytics"
import { ThemeProvider } from "@/components/theme-provider"
import { GA_MEASUREMENT_ID } from "@/lib/analytics"
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site"
import { cn } from "@/lib/utils"

import SidebarNav from "@/components/common/sidebar/SidebarNav"
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
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  icons: {
    icon: "/favicon.svg",
  },
  // 링크 공유(카카오톡·슬랙·SNS) 미리보기 - 이미지는 public/og.png(1200x630)
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "개미굴",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "개미굴 Gaemigul" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/og.png"],
  },
  // 구글 서치 콘솔 'HTML 태그' 소유권 확인용 - 값은 환경변수로만 넣는다(없으면 태그를 넣지 않는다)
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
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
      <body className="overflow-x-clip">
        {/* Google Analytics(GA4) - 측정 ID가 없으면(로컬 등) 아예 렌더링하지 않는다.
            초기화(config)는 lib/analytics.ts에서, 페이지뷰는 GoogleAnalytics 컴포넌트에서 보낸다 */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`}
              strategy="afterInteractive"
            />
            <Suspense fallback={null}>
              <GoogleAnalytics />
            </Suspense>
          </>
        )}
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
              <SidebarNav />
            </MobileSidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
