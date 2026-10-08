import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"

// 검색에 노출할 공개 화면만 넣는다 (로그인·가입·마이페이지 등은 제외)
const PUBLIC_PATHS = [
  "/",
  "/timeline",
  "/heatmap",
  "/calendar",
  "/briefing",
  "/glossary",
  "/data-sources",
  "/terms",
  "/privacy-policy",
]

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({ url: `${SITE_URL}${path === "/" ? "" : path}` }))
}
