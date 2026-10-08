import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"

// 로그인한 사용자만 쓰는 화면은 검색에 노출하지 않는다
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/mypage", "/change-password", "/onboarding", "/newsletter-consent"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
