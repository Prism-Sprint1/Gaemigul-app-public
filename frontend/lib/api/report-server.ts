import type { ApiReportResponse } from "@/lib/types/ReportType"
import { SITE_URL } from "@/lib/site"

/** 서버에서 브리핑 1건을 가져온다(메타 태그용). 실패하거나 없으면 null - 호출한 쪽이 기본 제목으로 대체한다.
 * API 주소가 "/api"처럼 상대 경로이면 사이트 주소를 기준으로 절대 주소를 만든다 */
export async function fetchReportForMetadata(
  type: "daily" | "weekly",
  date: string
): Promise<ApiReportResponse | null> {
  try {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:8000"
    const url = new URL(`${base.replace(/\/$/, "")}/timeline/report`, SITE_URL)
    url.searchParams.set("type", type)
    url.searchParams.set("date", date)

    const response = await fetch(url, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(3000),
    })
    if (!response.ok) return null

    const report = (await response.json()) as ApiReportResponse | null
    return report && report.title && report.sections?.length > 0 ? report : null
  } catch {
    return null
  }
}
