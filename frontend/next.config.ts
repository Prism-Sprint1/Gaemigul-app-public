import type { NextConfig } from "next"

const isProduction = process.env.NODE_ENV === "production"

/** 백엔드 API 주소의 origin(https://host:port). 상대 경로("/api")이거나 잘못된 값이면 null - 그땐 'self'로 충분하다 */
function apiOrigin(): string | null {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  if (!base) return null
  try {
    return new URL(base).origin
  } catch {
    return null
  }
}

/**
 * Content-Security-Policy - 이 사이트가 실제로 쓰는 외부 주소만 허용한다.
 * - script: Next.js가 페이지에 넣는 인라인 스크립트 때문에 'unsafe-inline'이 필요하다(nonce 방식은 모든 페이지를
 *   동적 렌더링으로 바꿔야 해서 쓰지 않는다). 대신 외부 스크립트는 Google Tag Manager(GA4) 한 곳만 허용한다.
 * - img: 브리핑 이미지가 Supabase Storage(외부 https)라서 https 이미지는 허용한다.
 * - connect: 백엔드 API + GA4 전송 주소
 * - frame-ancestors 'none': 다른 사이트가 이 사이트를 iframe에 넣는 클릭재킹을 막는다
 * 개발 서버(HMR·eval)와 충돌하지 않도록 production 빌드에서만 건다.
 */
function contentSecurityPolicy(): string {
  const api = apiOrigin()
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "font-src": ["'self'", "data:"],
    "connect-src": [
      "'self'",
      ...(api ? [api] : []),
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      "https://*.google-analytics.com",
      "https://*.analytics.google.com",
    ],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  }
  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ")
}

const securityHeaders = [
  // 브라우저가 파일 형식을 마음대로 추측해 스크립트로 실행하지 않게 한다
  { key: "X-Content-Type-Options", value: "nosniff" },
  // CSP frame-ancestors를 모르는 옛 브라우저용 클릭재킹 방어
  { key: "X-Frame-Options", value: "DENY" },
  // 다른 사이트로 이동할 때 주소의 경로·쿼리(예: 용어 검색어)를 넘기지 않는다
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // 쓰지 않는 브라우저 기능(카메라·마이크·위치)을 막는다
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // HTTPS로만 접속하게 한다. includeSubDomains·preload는 다른 서브도메인에 영향을 줄 수 있어 넣지 않는다
  ...(isProduction
    ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }]
    : []),
  ...(isProduction
    ? [{ key: "Content-Security-Policy", value: contentSecurityPolicy() }]
    : []),
]

const nextConfig: NextConfig = {
  // 응답 헤더로 "X-Powered-By: Next.js"를 알려주지 않는다
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
}

export default nextConfig
