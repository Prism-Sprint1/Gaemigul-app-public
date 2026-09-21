import axios from "axios"

import type { ApiTimelineSlot } from "@/lib/types/TimelineType"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:8000"
const TIMELINE_URL = `${API_BASE_URL.replace(/\/$/, "")}/timeline`

/** GET /timeline?date=YYYY-MM-DD — 하루치 슬롯 목록. date를 빼면 오늘. */
export async function getTimelineDay(date?: string): Promise<ApiTimelineSlot[]> {
  const response = await axios.get<ApiTimelineSlot[]>(TIMELINE_URL, {
    params: date ? { date } : undefined,
  })

  return response.data
}

/** GET /timeline/glossary — 용어 사전 {용어: 설명}. 본문 호버 툴팁에 쓴다. */
export async function getTimelineGlossary(): Promise<Record<string, string>> {
  const response = await axios.get<Record<string, string>>(
    `${TIMELINE_URL}/glossary`
  )

  return response.data
}

/** GET /timeline/available-dates?year=&month= — 그 달에 실제 데이터가 있는 날짜("YYYY-MM-DD") 목록.
 * 날짜 선택 캘린더에서 데이터 없는 날짜를 비활성 처리하는 데 쓴다. */
export async function getTimelineAvailableDates(
  year: number,
  month: number
): Promise<string[]> {
  const response = await axios.get<string[]>(
    `${TIMELINE_URL}/available-dates`,
    { params: { year, month } }
  )

  return response.data
}
