import { ImageOff } from "lucide-react"

import { safeHttpUrl } from "@/lib/safe-url"

type BriefingImageProps = {
  /** null·undefined면 아직 이미지가 준비되지 않은 것으로 보고 기본 이미지를 보여준다. */
  url?: string | null
  alt: string
}

export default function BriefingImage({ url, alt }: BriefingImageProps) {
  // http/https 이미지 주소만 쓰고, 그 외 값은 이미지가 없는 것과 같게 기본 이미지를 보여준다
  const safeUrl = safeHttpUrl(url)
  if (!safeUrl) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="flex aspect-1200/400 w-full flex-col items-center justify-center gap-2 rounded-lg bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
      >
        <ImageOff size={28} />
        <span className="text-xs font-medium">이미지를 준비 중이에요</span>
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- 외부(Supabase Storage) 도메인 이미지라 next/image 설정 없이 바로 사용한다.
    <img
      src={safeUrl}
      alt={alt}
      className="aspect-1200/400 w-full rounded-lg bg-neutral-100 object-cover dark:bg-neutral-800"
    />
  )
}
