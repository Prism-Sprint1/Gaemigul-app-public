import type { LucideIcon } from "lucide-react"

export type SidebarNavItem = {
  href: string
  label: string
  icon: LucideIcon
  /** 값이 없으면(undefined) 뱃지 자체를 렌더링하지 않는다 */
  badge?: string
  badgeClassName: string
  activeBadgeClassName: string
}
