"use client"

import { useCallback, useSyncExternalStore } from "react"

/**
 * 폼 연속 시도 제한(화면용).
 * 로그인 실패를 여러 번 반복하거나, 아이디·비밀번호 찾기 메일 요청을 연타하는 걸 화면에서 잠시 막는다.
 *
 * 이건 서버 보안 장치가 아니다 - 브라우저 저장소 기반이라 API를 직접 호출하면 우회된다.
 * 일반 사용자의 연타·새로고침 반복을 막아 불필요한 요청과 메일 발송을 줄이는 용도이고,
 * 실제 방어는 서버 쪽 요청 횟수 제한이 해야 한다.
 *
 * 잠금 시각은 sessionStorage에 두어 새로고침해도 유지된다(탭을 닫으면 사라진다).
 */

type StoredState = { until: number; failures: number }

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

// 남은 시간을 갱신하려고 0.5초마다 구독자에게 알린다. 잠겨 있지 않을 때는 스냅샷 값이 그대로라 다시 그려지지 않는다
const CLOCK_INTERVAL_MS = 500

function subscribe(listener: () => void) {
  listeners.add(listener)
  const timer = window.setInterval(listener, CLOCK_INTERVAL_MS)
  return () => {
    listeners.delete(listener)
    window.clearInterval(timer)
  }
}

function storageKey(key: string) {
  return `gaemigul:attempt-limit:${key}`
}

function readState(key: string): StoredState {
  try {
    const raw = window.sessionStorage.getItem(storageKey(key))
    if (!raw) return { until: 0, failures: 0 }
    const parsed = JSON.parse(raw) as Partial<StoredState>
    return {
      until: Number.isFinite(parsed.until) ? Number(parsed.until) : 0,
      failures: Number.isFinite(parsed.failures) ? Number(parsed.failures) : 0,
    }
  } catch {
    // 저장소를 못 쓰는 환경(프라이빗 모드 등)에서는 제한 없이 동작한다
    return { until: 0, failures: 0 }
  }
}

function writeState(key: string, state: StoredState) {
  try {
    window.sessionStorage.setItem(storageKey(key), JSON.stringify(state))
  } catch {
    // 저장 실패해도 화면 동작에는 영향이 없다
  }
  emit()
}

type AttemptLimitOptions = {
  /** 연속 실패가 이 횟수에 닿으면 잠근다 (실패 횟수를 세지 않고 lockFor만 쓸 거면 생략) */
  maxFailures?: number
  /** 잠그는 시간(초) */
  lockSeconds: number
}

export function useAttemptLimit(
  key: string,
  { maxFailures = Infinity, lockSeconds }: AttemptLimitOptions
) {
  // "잠금 해제 시각:현재 시각 칸" 문자열로 구독한다 - 값이 같으면 다시 그리지 않는다.
  // 현재 시각은 렌더 중에 직접 읽지 않고 구독 함수 안에서 읽는다(렌더는 같은 입력에 같은 결과여야 해서).
  // 잠겨 있지 않으면 시각 칸을 0으로 고정해, 시간이 흘러도 값이 안 바뀌어 다시 그리지 않는다.
  const snapshot = useSyncExternalStore(
    subscribe,
    () => {
      const { until } = readState(key)
      const now = Date.now()
      return `${until}:${until > now ? Math.floor(now / CLOCK_INTERVAL_MS) : 0}`
    },
    () => "0:0"
  )
  const [until, slot] = snapshot.split(":").map(Number)
  const nowMs = slot * CLOCK_INTERVAL_MS
  const locked = slot > 0 && nowMs < until
  const remainingSeconds = locked ? Math.ceil((until - nowMs) / 1000) : 0

  /** 실패 1회를 기록한다. maxFailures에 닿으면 lockSeconds 동안 잠그고 실패 횟수는 0으로 되돌린다 */
  const registerFailure = useCallback(() => {
    const state = readState(key)
    const failures = state.failures + 1
    if (failures >= maxFailures) {
      writeState(key, { until: Date.now() + lockSeconds * 1000, failures: 0 })
    } else {
      writeState(key, { until: state.until, failures })
    }
  }, [key, maxFailures, lockSeconds])

  /** 성공하면 실패 횟수와 잠금을 모두 지운다 */
  const reset = useCallback(() => {
    writeState(key, { until: 0, failures: 0 })
  }, [key])

  /** 결과와 상관없이 지금부터 lockSeconds 동안 잠근다(메일 발송 요청처럼 연타를 막고 싶을 때) */
  const lock = useCallback(() => {
    writeState(key, { until: Date.now() + lockSeconds * 1000, failures: 0 })
  }, [key, lockSeconds])

  return {
    locked,
    remainingSeconds,
    registerFailure,
    reset,
    lock,
  }
}
