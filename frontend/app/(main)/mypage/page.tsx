"use client"

import { Footprints, History, Mail, Star, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { AttendanceHeatmap } from "@/components/attendance/AttendanceHeatmap"
import { GradeQuizStepper } from "@/components/auth/GradeQuizStepper"
import { ConfirmDialog, PageTitle, useAuth, WithdrawReasonDialog } from "@/components/common"
import { Badge, Button, Separator, Switch } from "@/components/ui"
import {
  extractErrorMessage,
  getActivityStats,
  getGradeHistory,
  setNewsletterOptIn,
  submitWithdrawalFeedback,
} from "@/lib/api/auth"
import { getGlossaryFavorites } from "@/lib/api/glossary"
import { descriptionForTone, toneForGrade } from "@/lib/glossary"
import type { GradeHistoryItem } from "@/lib/types/AuthType"
import type { ApiGlossaryTerm } from "@/lib/types/GlossaryType"

// 활동 기반 승급 제안(백엔드 promotion_service.PROMOTION_RULES의 애기->청년 기준)과 같은 값 -
// 여기까지 활동 데이터가 쌓이면 시스템이 알아서 챗으로 승급을 제안하니, 그 전까지만 "등급
// 재검사"를 눈에 띄게 보여준다(문서 5번 "활동 데이터가 부족한 사용자를 위한 보조 수단")
const SUFFICIENT_ATTENDANCE_DAYS = 15
const SUFFICIENT_DISTINCT_TERMS = 4

/** 서브 페이지(비축 캘린더/개미 용어 사전)와 같은 카드 톤 - 아이콘+제목 헤더가 있는 섹션 */
function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card px-3 py-4 shadow-sm sm:px-5 sm:pb-5">
      <h2 className="flex items-center gap-1.5 text-sm font-bold">
        <Icon size={16} className="text-point" />
        {title}
      </h2>
      {children}
    </div>
  )
}

export default function MyPage() {
  const router = useRouter()
  const { status, user, logout, withdraw, refresh, setUser } = useAuth()

  const [retaking, setRetaking] = useState(false)
  const [activityStats, setActivityStats] = useState<{ attendance_days: number; distinct_terms_viewed: number } | null>(null)
  const [gradeHistory, setGradeHistory] = useState<GradeHistoryItem[] | null>(null)
  const [favoriteTerms, setFavoriteTerms] = useState<ApiGlossaryTerm[] | null>(null)
  // 탈퇴 버튼 -> 사유 선택 -> 최종 확인, 2단계로 진행한다
  const [withdrawStep, setWithdrawStep] = useState<"reason" | "confirm" | null>(null)
  const [withdrawReason, setWithdrawReason] = useState<{ reason: string; customText?: string } | null>(null)
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawError, setWithdrawError] = useState<string | null>(null)
  const [newsletterConfirmOpen, setNewsletterConfirmOpen] = useState(false)
  const [newsletterUpdating, setNewsletterUpdating] = useState(false)
  // 로그아웃/탈퇴로 직접 나가는 중엔 "/"로 보내고, 이 플래그가 없을 때만(직접 URL 접근 등)
  // 아래 가드가 "/login"으로 보낸다 - 둘 다 같은 status 변화에 반응해서 경합하는 걸 막는다
  const isLoggingOutRef = useRef(false)

  useEffect(() => {
    if (status === "unauthenticated" && !isLoggingOutRef.current) router.replace("/login")
  }, [status, router])

  useEffect(() => {
    if (status !== "authenticated") return
    getActivityStats()
      .then(setActivityStats)
      .catch((loadError) => console.error("[getActivityStats] 실패", loadError))
    getGradeHistory()
      .then(setGradeHistory)
      .catch((loadError) => console.error("[getGradeHistory] 실패", loadError))
    getGlossaryFavorites()
      .then(setFavoriteTerms)
      .catch((loadError) => console.error("[getGlossaryFavorites] 실패", loadError))
  }, [status])

  const handleRetakeComplete = async () => {
    await refresh()
    const [stats, history] = await Promise.all([getActivityStats(), getGradeHistory()])
    setActivityStats(stats)
    setGradeHistory(history)
    setRetaking(false)
  }

  const handleLogout = async () => {
    isLoggingOutRef.current = true
    await logout()
    router.push("/")
  }

  const handleWithdraw = async () => {
    setWithdrawError(null)
    setWithdrawing(true)
    try {
      // 사유 저장은 최선 노력(best-effort)만 한다 - 여기서 실패해도 탈퇴 자체는 막지 않는다
      if (withdrawReason) {
        try {
          await submitWithdrawalFeedback(withdrawReason.reason, withdrawReason.customText)
        } catch (feedbackError) {
          console.error("[submitWithdrawalFeedback] 실패", feedbackError)
        }
      }
      isLoggingOutRef.current = true
      await withdraw()
      router.push("/")
    } catch (submitError) {
      isLoggingOutRef.current = false
      setWithdrawError(extractErrorMessage(submitError, "탈퇴에 실패했습니다."))
    } finally {
      setWithdrawing(false)
    }
  }

  const applyNewsletterOptIn = async (optIn: boolean) => {
    setNewsletterUpdating(true)
    try {
      const updated = await setNewsletterOptIn(optIn)
      setUser(updated)
    } catch (toggleError) {
      console.error("[setNewsletterOptIn] 실패", toggleError)
    } finally {
      setNewsletterUpdating(false)
    }
  }

  const handleNewsletterToggle = (checked: boolean) => {
    if (checked) {
      applyNewsletterOptIn(true)
    } else {
      setNewsletterConfirmOpen(true)
    }
  }

  if (status === "loading" || status === "unauthenticated" || !user) return null

  const hasEnoughActivity =
    !!activityStats &&
    (activityStats.attendance_days >= SUFFICIENT_ATTENDANCE_DAYS ||
      activityStats.distinct_terms_viewed >= SUFFICIENT_DISTINCT_TERMS)

  return (
    <div className="flex min-h-svh justify-center bg-background p-3 sm:p-4 lg:p-6">
      <div className="flex w-full flex-col gap-3">
        <PageTitle title="마이페이지" description="내 정보와 굴 파기 기록을 확인합니다." />

        <SectionCard icon={User} title="내 정보">
          {retaking ? (
            <div className="flex flex-col gap-3">
              <GradeQuizStepper completeLabel="확인" onComplete={handleRetakeComplete} />
              <button
                type="button"
                onClick={() => setRetaking(false)}
                className="w-fit text-xs text-muted-foreground hover:text-foreground hover:underline"
              >
                취소하고 돌아가기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold">{user.nickname}</span>
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                    <span className="text-xs text-muted-foreground">가입일 {user.created_at}</span>
                  </div>
                  <Badge className="bg-point3 text-point2">{user.grade}</Badge>
                </div>

                {hasEnoughActivity ? (
                  // 활동 데이터가 이미 쌓인 사용자에게는 재검사 버튼 대신 진행 상황만 조용히 보여준다 -
                  // 승급은 이제 활동 데이터를 보고 챗(불개미 대장)이 먼저 제안한다
                  <div className="flex flex-col gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-700">
                    <span>
                      활동 데이터로 등급을 평가하고 있어요 (출석 {activityStats?.attendance_days}일 · 용어{" "}
                      {activityStats?.distinct_terms_viewed}개)
                    </span>
                    <button
                      type="button"
                      onClick={() => setRetaking(true)}
                      className="w-fit text-left text-emerald-700 underline-offset-2 hover:underline"
                    >
                      퀴즈로 다시 진단받기
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRetaking(true)}
                    className="text-left text-sm text-point hover:underline"
                  >
                    등급 재검사 하기
                  </button>
                )}

                <Separator />

                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      <Mail size={14} className="text-point" />
                      개미레터 수신
                    </span>
                    <span className="text-xs text-muted-foreground">
                      매주 월요일, 이번주 비축 캘린더 일정을 요약해 보내드려요.
                    </span>
                  </div>
                  <Switch
                    checked={user.newsletter_opt_in}
                    onCheckedChange={handleNewsletterToggle}
                    disabled={newsletterUpdating}
                  />
                </div>

                <Button
                  variant="secondary"
                  className="h-10 w-full justify-start"
                  onClick={() => router.push("/change-password")}
                >
                  비밀번호 변경
                </Button>

                <Button variant="secondary" className="h-10 w-full" onClick={handleLogout}>
                  로그아웃
                </Button>

                <button
                  type="button"
                  onClick={() => setWithdrawStep("reason")}
                  className="text-left text-xs text-muted-foreground hover:text-destructive hover:underline"
                >
                  회원 탈퇴
                </button>
              </div>

              <div className="flex flex-col gap-2 lg:border-l lg:pl-6">
                <h3 className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                  <History size={14} />
                  등급 변경 이력
                </h3>
                {gradeHistory === null ? (
                  <p className="text-xs text-muted-foreground">불러오는 중...</p>
                ) : gradeHistory.length === 0 ? (
                  <p className="text-xs text-muted-foreground">아직 변경 이력이 없어요.</p>
                ) : (
                  <ul className="flex flex-col gap-1.5">
                    {gradeHistory.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-xs"
                      >
                        <span className="text-muted-foreground">{item.date}</span>
                        <span className="font-medium">{item.grade}</span>
                        <span className="text-muted-foreground">{item.source}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard icon={Star} title="즐겨찾는 용어">
          {favoriteTerms === null ? (
            <p className="text-xs text-muted-foreground">불러오는 중...</p>
          ) : favoriteTerms.length === 0 ? (
            <div className="flex flex-col items-start gap-2">
              <p className="text-xs text-muted-foreground">
                아직 즐겨찾은 용어가 없어요. 용어 사전에서 별을 눌러 저장해보세요!
              </p>
              <Link href="/glossary">
                <Button variant="secondary" className="h-10">
                  개미 용어 사전으로 가기
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {favoriteTerms.map((term) => (
                <div
                  key={term.id}
                  className="flex flex-col gap-0.5 rounded-lg border border-border px-3 py-2"
                >
                  <Badge variant="outline" className="w-fit text-xs">
                    {term.term}
                  </Badge>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {descriptionForTone(term, toneForGrade(user?.grade ?? "청년 개미"))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard icon={Footprints} title="굴 파기 기록">
          <p className="-mt-2 text-xs text-muted-foreground">
            시황 타임라인의 각 시간대(하루 8번)에 방문하면 그날 칸이 진해져요. 지금 이 시간대에 딱
            맞춰 들어가야만 기록돼요!
          </p>
          <AttendanceHeatmap />
        </SectionCard>
      </div>

      <WithdrawReasonDialog
        open={withdrawStep === "reason"}
        onCancel={() => setWithdrawStep(null)}
        onNext={(reason, customText) => {
          setWithdrawReason({ reason, customText })
          setWithdrawStep("confirm")
        }}
      />

      <ConfirmDialog
        open={newsletterConfirmOpen}
        title="정말 뉴스레터를 받지 않으시겠어요?"
        description="개미레터를 끄면 매주 월요일 비축 캘린더 요약을 더 이상 보내드리지 않아요. 마이페이지에서 언제든 다시 켤 수 있어요."
        confirmLabel="네, 끌게요"
        cancelLabel="아니오"
        confirming={newsletterUpdating}
        onCancel={() => setNewsletterConfirmOpen(false)}
        onConfirm={async () => {
          await applyNewsletterOptIn(false)
          setNewsletterConfirmOpen(false)
        }}
      />

      <ConfirmDialog
        open={withdrawStep === "confirm"}
        title="정말 개미굴을 나가시겠어요?"
        description={
          withdrawError ??
          "떠나시면 지금까지 쌓은 굴 파기 기록, 용어 열람 기록이 모두 함께 사라져요. 이 작업은 되돌릴 수 없어요."
        }
        confirmLabel="네, 탈퇴할게요"
        cancelLabel="아니오"
        confirming={withdrawing}
        onCancel={() => {
          setWithdrawStep(null)
          setWithdrawError(null)
        }}
        onConfirm={handleWithdraw}
      />
    </div>
  )
}
