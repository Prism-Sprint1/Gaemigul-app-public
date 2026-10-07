"use client"

import { LogIn } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { AuthCard } from "@/components/auth/AuthCard"
import { AuthTextField } from "@/components/auth/AuthTextField"
import { useAuth } from "@/components/common"
import { Button } from "@/components/ui"
import { useAttemptLimit } from "@/hooks/use-attempt-limit"
import { extractErrorMessage } from "@/lib/api/auth"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  // 연속 5번 실패하면 30초 동안 로그인 버튼을 잠근다(화면용 제한 - 훅 설명 참고)
  const limit = useAttemptLimit("login", { maxFailures: 5, lockSeconds: 30 })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (limit.locked) return
    setError(null)
    setSubmitting(true)
    try {
      const user = await login({ username, password })
      limit.reset()
      router.push(user.must_change_password ? "/change-password" : "/")
    } catch (submitError) {
      limit.registerFailure()
      setError(extractErrorMessage(submitError, "로그인에 실패했습니다."))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="로그인"
      description="아이디와 비밀번호를 입력해주세요."
      icon={LogIn}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <AuthTextField
          label="아이디"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          placeholder="아이디를 입력해주세요."
          required
        />
        <AuthTextField
          label="비밀번호"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          placeholder="비밀번호를 입력해주세요."
          required
        />

        {error && <p className="text-sm text-red-500">{error}</p>}
        {limit.locked && (
          <p role="status" className="text-sm text-red-500">
            로그인에 여러 번 실패했어요. {limit.remainingSeconds}초 뒤에 다시
            시도해 주세요.
          </p>
        )}

        <Button
          type="submit"
          disabled={submitting || limit.locked}
          className="mt-2 h-10 w-full"
        >
          {submitting
            ? "로그인 중..."
            : limit.locked
              ? `${limit.remainingSeconds}초 뒤 다시 시도`
              : "로그인"}
        </Button>

        <div className="flex justify-center gap-3 text-xs text-muted-foreground">
          <Link
            href="/find-id"
            className="hover:text-foreground hover:underline"
          >
            아이디 찾기
          </Link>
          <span>·</span>
          <Link
            href="/find-password"
            className="hover:text-foreground hover:underline"
          >
            비밀번호 찾기
          </Link>
          <span>·</span>
          <Link
            href="/signup"
            className="hover:text-foreground hover:underline"
          >
            회원가입
          </Link>
        </div>
      </form>
    </AuthCard>
  )
}
