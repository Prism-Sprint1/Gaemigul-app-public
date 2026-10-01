import { BookOpen, Calendar, Lollipop, Timeline, Home } from "lucide-react"

import type { SidebarNavItem } from "@/lib/types/SidebarType"

export const sidebarNavItems: SidebarNavItem[] = [
  {
    href: "/",
    label: "한눈에 보는 개미굴",
    icon: Home,
  },
  {
    href: "/timeline",
    label: "실시간 시황&브리핑",
    icon: Timeline,
  },
  {
    href: "/calendar",
    label: "이벤트 일정 캘린더",
    icon: Calendar,
  },
  {
    href: "/heatmap",
    label: "주가 섹터별 히트맵",
    icon: Lollipop,
  },
  {
    href: "/glossary",
    label: "주식&경제 용어",
    icon: BookOpen,
  },
]
