import type { Metadata } from "next"

import { fetchReportForMetadata } from "@/lib/api/report-server"
import { pageMetadata } from "@/lib/site"

import BriefingClient from "./briefing-client"

type PageProps = {
  searchParams: Promise<{ type?: string; date?: string }>
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function formatDate(value: string) {
  return value.replaceAll("-", ".")
}

/** 브리핑 날짜(?type=&date=)가 바뀌면 제목·설명도 그 브리핑 기준으로 바뀐다.
 * 쿼리가 없거나 브리핑이 없으면 layout.tsx의 기본값("시황 브리핑 | 개미굴")이 쓰인다 */
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { type, date } = await searchParams
  if ((type !== "daily" && type !== "weekly") || !date || !DATE_PATTERN.test(date)) {
    return {}
  }

  const report = await fetchReportForMetadata(type, date)
  if (!report) return {}

  const label =
    type === "weekly"
      ? `${formatDate(report.start_date)}~${formatDate(report.end_date)} 주간 시황 브리핑`
      : `${formatDate(report.end_date)} 시황 브리핑`
  const description = (report.summary ?? report.title ?? "").replace(/\s+/g, " ").trim().slice(0, 150)

  return pageMetadata({
    title: label,
    description: description || "국내외 시장의 핵심 뉴스와 흐름을 AI가 요약한 브리핑",
    path: `/briefing?type=${type}&date=${date}`,
  })
}

export default function BriefingPage() {
  return <BriefingClient />
}
