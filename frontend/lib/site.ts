import type { Metadata } from "next"

/** 사이트 대표 주소 - OG 이미지·sitemap의 절대 주소 기준. 배포 주소가 바뀌면 NEXT_PUBLIC_SITE_URL로 덮어쓴다 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://gaemigul-app.vercel.app"
).replace(/\/+$/, "")

export const SITE_NAME = "개미굴 | 국내외 시세·뉴스·경제 일정을 한 화면에서. 개미 투자자를 위한 시황 AI 요약 서비스"
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

/** 피드백 구글폼 주소 */
export const FEEDBACK_FORM_URL = "https://forms.gle/8meYJL8mXp8WpZoJA"

/** 검색엔진에 알리는 사이트 정보(JSON-LD) */
export const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "개미굴",
  alternateName: "Gaemigul",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: "ko-KR",
}

type PageMetadataInput = {
  /** 화면 이름 - 브라우저 탭에는 "화면 이름 | 개미굴"로 나온다 */
  title: string
  description: string
  /** 화면 경로(예: "/heatmap") - canonical·공유 주소 */
  path: string
  /** 로그인 전용 화면처럼 검색에 나오면 안 되는 화면 */
  noindex?: boolean
}

/** 화면별 메타데이터 - 제목·설명·canonical·공유 미리보기(Open Graph)·검색 노출 여부를 한 번에 만든다.
 * Open Graph는 루트 값이 통째로 상속되지 않고 화면별 값이 있어야 해서 여기서 같이 지정한다 */
export function pageMetadata({
  title,
  description,
  path,
  noindex,
}: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      siteName: "개미굴",
      title: `${title} | 개미굴`,
      description,
      url: path,
      images: [
        { url: "/og.png", width: 1200, height: 630, alt: "개미굴 Gaemigul" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | 개미굴`,
      description,
      images: ["/og.png"],
    },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  }
}
