"use client"

import { HelpCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { AuthCard } from "@/components/auth/AuthCard"
import { AuthTextField } from "@/components/auth/AuthTextField"
import { Button } from "@/components/ui"
import { useAttemptLimit } from "@/hooks/use-attempt-limit"
import { extractErrorMessage, findId } from "@/lib/api/auth"

export default function FindIdPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  // 메일이 나가는 요청이라 한 번 보내면 60초 동안 다시 보낼 수 없다(새로고침해도 유지, 화면용 제한 - 훅 설명 참고)
  const limit = useAttemptLimit("find-id", { lockSeconds: 60 })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (limit.locked) return
    setError(null)
    setMessage(null)
    setSubmitting(true)
    try {
      const result = await findId(email)
      setMessage(result)
      // 메일 요청이 접수된 뒤에만 잠근다 - 형식 오류·네트워크 오류처럼 메일이 안 나간 실패는 바로 다시 시도할 수 있다
      limit.lock()
    } catch (submitError) {
      setError(extractErrorMessage(submitError, "요청에 실패했습니다."))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="아이디 찾기"
      description="가입하신 이메일을 입력해주세요."
      icon={HelpCircle}
    >
      {message ? (
        <div className="flex flex-col gap-4">
          <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </p>
          <Link href="/login">
            <Button className="h-10 w-full">로그인으로 돌아가기</Button>
          </Link>
        </div>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <AuthTextField
            label="이메일"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="이메일을 입력해주세요."
            required
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            disabled={submitting || limit.locked}
            className="mt-2 h-10 w-full"
          >
            {submitting
              ? "전송 중..."
              : limit.locked
                ? `${limit.remainingSeconds}초 뒤 다시 요청`
                : "아이디 전송"}
          </Button>

          {/* 로그인 화면의 하단 링크(아이디 찾기·비밀번호 찾기·회원가입)와 같은 스타일 */}
          <div className="flex justify-center text-xs text-muted-foreground">
            <Link
              href="/login"
              className="hover:text-foreground hover:underline"
            >
              로그인 하러 가기
            </Link>
          </div>
        </form>
      )}
    </AuthCard>
  )
}
