/** 사이트 대표 주소 - OG 이미지·sitemap의 절대 주소 기준. 배포 주소가 바뀌면 NEXT_PUBLIC_SITE_URL로 덮어쓴다 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://gaemigul-app.vercel.app"
).replace(/\/+$/, "")

export const SITE_NAME = "개미굴 | Gaemigul"
export const SITE_DESCRIPTION =
  "국내외 시세·뉴스·일정을 한 화면에서 확인하는 금융 뉴스 요약 및 시황 AI 인사이트 대시보드"
