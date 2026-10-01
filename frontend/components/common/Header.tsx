"use client"

import Link from "next/link"
import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { Badge, Button, Separator } from "@/components/ui"

import DarkLogo from "@/public/images/dark-logo.svg"
import Logo from "@/public/images/logo.svg"

import Marquee from "../marquee/marquee"
import { Info, Menu, Moon, Sun } from "lucide-react"

import { useIndicatorSchedule } from "@/hooks/use-indicator-schedule"
import {
  getTimelineIndicators,
  type MarketIndicatorItem,
} from "@/lib/api/indicator"
import { useAuth } from "./auth/AuthContext"
import { useMobileSidebar } from "./sidebar"

/** 라이트/다크 토글. next-themes는 서버에는 실제 테마를 모르니, 마운트 전엔 자리만 차지해서
 * SSR과 클라이언트 렌더링이 어긋나는 걸(hydration mismatch) 막는다 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="size-8 shrink-0" />

  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className="flex size-8 shrink-0 items-center justify-center rounded-full text-neutral-500 hover:bg-muted dark:text-neutral-400"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}

/** 프로필 이미지가 아직 없어서(업로드 기능 없음) 닉네임 첫 글자로 기본 아바타를 대신한다 */
function ProfileAvatar({ nickname }: { nickname: string }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-point/10 text-xs font-bold text-point">
      {nickname.slice(0, 1)}
    </span>
  )
}

/** 로그인 버튼 <-> [프로필 아바타] [닉네임님] [등급 배지]. status가 loading인 동안은
 * 깜빡임 방지용으로 빈 자리만 차지 */
export function HeaderAuthAction() {
  const { user, status } = useAuth()

  if (status === "loading") return <div className="size-8 shrink-0" />

  if (!user) {
    return (
      <Link href="/login" className="shrink-0">
        <Button variant="secondary" className="h-10 text-xs">
          로그인
        </Button>
      </Link>
    )
  }

  return (
    <Link href="/mypage" className="flex shrink-0 items-center gap-2">
      <ProfileAvatar nickname={user.nickname} />
      <span className="hidden text-sm font-medium sm:inline">
        {user.nickname}님
      </span>
      <Badge className="bg-point3 text-[11px] text-point2">{user.grade}</Badge>
    </Link>
  )
}

export default function Header() {
  const { toggle } = useMobileSidebar()
  const [indicators, setIndicators] = useState<MarketIndicatorItem[]>([])

  // 지수 티커는 데스크톱/모바일용으로 두 번 그려지지만 데이터는 여기서 한 번만 불러온다.
  const fetchIndicators = useCallback(() => {
    getTimelineIndicators()
      .then((data) => setIndicators(data.items))
      .catch((error: unknown) => {
        console.error("[getTimelineIndicators] 실패", error)
      })
  }, [])

  // 최초 진입 시 1회, 이후 정시 기준 15분 경계마다 다시 불러온다
  useEffect(() => {
    fetchIndicators()
  }, [fetchIndicators])

  const { remaining } = useIndicatorSchedule(fetchIndicators)
  const headerRef = useRef<HTMLElement>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // 마운트 전(SSR)엔 항상 라이트 로고로 렌더링해 하이드레이션 불일치를 피한다
  const logoSrc = mounted && resolvedTheme === "dark" ? DarkLogo : Logo

  useEffect(() => {
    const node = headerRef.current
    if (!node) return

    const updateHeaderHeight = () => {
      document.documentElement.style.setProperty(
        "--header-height",
        `${node.offsetHeight}px`
      )
    }

    updateHeaderHeight()
    const observer = new ResizeObserver(updateHeaderHeight)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <header ref={headerRef} className="sticky top-0 z-30 w-full bg-background">
      {/* 데스크톱 헤더 (기존 그대로) */}
      <div className="hidden w-full md:flex">
        <Link
          href={"/"}
          className="flex min-w-67.5 items-center justify-between pl-5"
        >
          <Image src={logoSrc} alt="개미굴 로고" width="140"></Image>
          <div className="flex items-center gap-2.5">
            <Separator orientation="vertical" />
          </div>
        </Link>
        <Marquee items={indicators} />
        <div className="flex min-w-60 flex-col justify-center gap-0.5 px-5">
          <strong className="flex items-center gap-1 text-[18px] text-point">
            <Badge className="bg-point text-[12px] text-white">TIMER</Badge>
            {remaining}
          </strong>
          <p className="flex items-center gap-1 text-[10px] text-neutral-500 dark:text-neutral-400">
            <Info size="11" />
            지수 데이터는 정시 기준 15분마다 갱신됩니다.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 px-5">
          <ThemeToggle />
          <HeaderAuthAction />
        </div>
      </div>

      {/* 모바일 헤더: 좌측 로고 / 우측 TIMER + 햄버거 메뉴, 같은 높이로 정렬 */}
      <div className="flex w-full items-center justify-between px-4 pt-4 pb-3 md:hidden">
        <Link href={"/"} className="flex items-center">
          <Image src={logoSrc} alt="개미굴 로고" className="h-7 w-auto" />
        </Link>
        <div className="flex items-center gap-3">
          <strong className="flex items-center gap-1 text-[16px] text-point">
            <Badge className="bg-point text-[12px] text-white">TIMER</Badge>
            {remaining}
          </strong>
          <button
            type="button"
            onClick={toggle}
            aria-label="메뉴 열기"
            className="p-1 text-neutral-500 dark:text-neutral-400"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* 모바일: 헤더 아래 지수 데이터 티커 */}
      <div className="w-full md:hidden">
        <Marquee items={indicators} />
      </div>
    </header>
  )
}
