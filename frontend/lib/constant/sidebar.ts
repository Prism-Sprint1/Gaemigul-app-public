import { BookOpen, Calendar, Lollipop, Timeline, Home } from "lucide-react"

import type { SidebarNavItem } from "@/lib/types/SidebarType"

const date = new Date()

const month = date.getMonth() + 1

export const sidebarNavItems: SidebarNavItem[] = [
  {
    href: "/",
    label: "한눈에 보는 개미굴",
    icon: Home,
    badgeClassName: "bg-white/20 text-point",
    activeBadgeClassName: "bg-white/20 text-white",
  },
  {
    href: "/timeline",
    label: "실시간 시황&브리핑",
    icon: Timeline,
    badge: "LIVE",
    badgeClassName: "bg-white/20 text-point",
    activeBadgeClassName: "bg-white/20 text-white",
  },
  {
    href: "/calendar",
    label: "이벤트 일정 캘린더",
    icon: Calendar,
    badge: `${month}월`,
    badgeClassName: "bg-white/20 text-black/80",
    activeBadgeClassName: "bg-white/20 text-white",
  },
  {
    href: "/heatmap",
    label: "주가 섹터별 히트맵",
    icon: Lollipop,
    badge: "HOT",
    badgeClassName: "bg-point3 text-point2",
    activeBadgeClassName: "bg-point3 text-point2",
  },
  {
    href: "/glossary",
    label: "주식&경제 용어",
    icon: BookOpen,
    badge: "NEW",
    badgeClassName: "bg-white/20 text-black/80",
    activeBadgeClassName: "bg-white/20 text-white",
  },
]
