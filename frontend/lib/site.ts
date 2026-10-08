/** 사이트 대표 주소 - OG 이미지·sitemap의 절대 주소 기준. 배포 주소가 바뀌면 NEXT_PUBLIC_SITE_URL로 덮어쓴다 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://gaemigul-app.vercel.app"
).replace(/\/+$/, "")

export const SITE_NAME = "개미굴 | Gaemigul"
export const SITE_DESCRIPTION =
  "국내외 시세·뉴스·일정을 한 화면에서 확인하는 금융 뉴스 요약 및 시황 AI 인사이트 대시보드"

/** 구글 서치 콘솔 소유권 확인(HTML 태그) 값 - 공개되는 값이라 비밀이 아니다. 속성을 새로 만들면 NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION으로 바꾼다 */
export const GOOGLE_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() ||
  "2Lx5uqhuLfgnfd3QVcyooh8YN-2MoikLR7oi3QyAI6I"

/** 네이버 서치 어드바이저 소유권 확인(HTML 태그) 값 - 공개되는 값이라 비밀이 아니다. 바꿀 때는 NEXT_PUBLIC_NAVER_SITE_VERIFICATION을 쓴다 */
export const NAVER_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION?.trim() ||
  "94ca2df4b611db1a4706e4e0829775afb53960c3"
