# rate_limit.py
# 서버 쪽 요청 횟수 제한 - 로그인 무작위 대입, 아이디·비밀번호 찾기 메일 폭탄을 막는다.
#
# 새 라이브러리 없이 메모리에서 센다(슬라이딩 윈도우). 배포가 "git pull + 서비스 재시작"이라 의존성을 새로 설치하지
# 않으므로 표준 라이브러리만 쓴다. 이 서비스는 스케줄러(APScheduler)가 앱 프로세스 안에서 돌아 워커를 1개로 두는 구조라
# 프로세스 메모리 카운터로 충분하다. 워커를 여러 개로 늘리면 제한이 워커 수만큼 느슨해지므로 그때는 공용 저장소(DB·Redis)가 필요하다.
#
# 제한 기준 3가지를 함께 쓴다
#   - 계정/메일 주소 기준: 같은 아이디·이메일로 몰리는 시도를 막는다 (IP를 바꿔도 소용없다)
#   - IP 기준: 한 곳에서 여러 계정을 돌려 가며 시도하는 걸 막는다
#   - 전체 기준: 메일 발송 총량 상한 - 발송 한도(SMTP)를 지킨다. 헤더를 속여도 우회할 수 없다
# 프런트(Vercel)를 거쳐 오는 요청의 IP는 X-Forwarded-For 첫 값을 쓴다. 백엔드 주소로 직접 요청하는 사람은 이 헤더를 속여
# IP 기준 제한을 피할 수 있으므로, IP 기준은 보조 수단이고 계정·전체 기준이 핵심이다.
# RATE_LIMIT_ENABLED=false로 끌 수 있다(비상용).

import threading
import time
from collections import deque
from collections.abc import Callable

from fastapi import HTTPException, Request, status

from backend.core.config import get_settings

# 로그인 - 같은 아이디로 이 횟수만큼 실패하면 잠시 막는다 (성공하면 그 아이디의 실패 기록은 지운다)
LOGIN_WINDOW_SECONDS = 15 * 60
LOGIN_MAX_FAILURES_PER_ACCOUNT = 10
LOGIN_MAX_FAILURES_PER_IP = 30

# 메일이 나가는 요청(아이디 찾기·비밀번호 찾기) - 계정이 있든 없든 똑같이 센다(응답으로 계정 존재 여부가 드러나지 않게)
MAIL_WINDOW_SECONDS = 10 * 60
MAIL_MAX_PER_TARGET = 3
MAIL_MAX_PER_IP = 10
MAIL_GLOBAL_WINDOW_SECONDS = 60 * 60
MAIL_GLOBAL_MAX = 60

# 추적하는 키가 이 개수를 넘으면 오래된 키부터 정리한다 (아이디를 계속 바꿔 메모리를 채우는 공격 방지)
_MAX_TRACKED_KEYS = 20_000


class SlidingWindowLimiter:
    """키별로 최근 이벤트 시각을 기록해, 창(window) 안의 횟수를 센다. 스레드에 안전하다."""

    def __init__(self, clock: Callable[[], float] = time.monotonic, max_keys: int = _MAX_TRACKED_KEYS) -> None:
        self._clock = clock
        self._max_keys = max_keys
        self._lock = threading.Lock()
        # 키 -> (이벤트 시각들, 이 키에서 쓰는 창 길이)
        self._events: dict[str, tuple[deque[float], float]] = {}

    def _prune(self, events: deque[float], now: float, window: float) -> None:
        while events and events[0] <= now - window:
            events.popleft()

    def _evict_if_full(self, now: float) -> None:
        if len(self._events) < self._max_keys:
            return
        for key in [k for k, (events, window) in self._events.items() if not events or events[-1] <= now - window]:
            del self._events[key]
        # 그래도 가득 차 있으면(전부 최근 이벤트) 가장 오래된 키부터 지운다
        while len(self._events) >= self._max_keys:
            oldest = min(self._events, key=lambda k: self._events[k][0][-1] if self._events[k][0] else 0.0)
            del self._events[oldest]

    def retry_after(self, key: str, limit: int, window: float) -> int:
        """이 키가 limit회에 닿아 있으면 다시 시도할 수 있기까지 남은 초(올림), 아니면 0. 기록은 바꾸지 않는다."""
        with self._lock:
            entry = self._events.get(key)
            if entry is None:
                return 0
            events, _ = entry
            now = self._clock()
            self._prune(events, now, window)
            if len(events) < limit:
                return 0
            # limit번째로 최근 이벤트가 창 밖으로 나가야 한 칸이 빈다
            wait = events[len(events) - limit] + window - now
            return max(1, int(wait) + (0 if wait == int(wait) else 1))

    def add(self, key: str, window: float) -> None:
        """이벤트 1건을 기록한다."""
        with self._lock:
            now = self._clock()
            entry = self._events.get(key)
            if entry is None:
                self._evict_if_full(now)
                self._events[key] = (deque([now]), window)
                return
            events, _ = entry
            self._prune(events, now, window)
            events.append(now)
            self._events[key] = (events, window)

    def clear(self, key: str) -> None:
        with self._lock:
            self._events.pop(key, None)

    def hit(self, key: str, limit: int, window: float) -> int:
        """요청 1건을 센다. 이미 한도에 닿아 있으면 기록하지 않고 남은 대기 시간(초)을, 허용되면 기록하고 0을 돌려준다.
        막힌 요청까지 기록하면 공격이 이어지는 동안 차단이 끝없이 길어지므로, 허용된 요청만 센다."""
        wait = self.retry_after(key, limit, window)
        if wait == 0:
            self.add(key, window)
        return wait


_limiter = SlidingWindowLimiter()


def reset_for_tests() -> None:
    """테스트에서 카운터를 비운다."""
    global _limiter
    _limiter = SlidingWindowLimiter()


def _enabled() -> bool:
    return get_settings().rate_limit_enabled


def client_ip(request: Request) -> str:
    """요청 보낸 곳의 IP. Vercel 프록시를 거치면 X-Forwarded-For 첫 값이 실제 접속자다(직접 요청이면 속일 수 있음)."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        first = forwarded.split(",")[0].strip()
        if first:
            return first
    real_ip = request.headers.get("x-real-ip", "").strip()
    if real_ip:
        return real_ip
    return request.client.host if request.client else "unknown"


def _too_many(retry_after: int) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail=f"요청이 너무 많아요. {retry_after}초 뒤에 다시 시도해 주세요.",
        headers={"Retry-After": str(retry_after)},
    )


def _normalize(value: str) -> str:
    return value.strip().lower()


# ---- 로그인 ----

def enforce_login_allowed(username: str, ip: str) -> None:
    """로그인 시도 전에 호출 - 이 아이디나 이 IP에서 실패가 너무 많으면 429. 기록은 바꾸지 않는다."""
    if not _enabled():
        return
    wait = max(
        _limiter.retry_after(f"login:user:{_normalize(username)}", LOGIN_MAX_FAILURES_PER_ACCOUNT, LOGIN_WINDOW_SECONDS),
        _limiter.retry_after(f"login:ip:{ip}", LOGIN_MAX_FAILURES_PER_IP, LOGIN_WINDOW_SECONDS),
    )
    if wait:
        raise _too_many(wait)


def record_login_failure(username: str, ip: str) -> None:
    if not _enabled():
        return
    _limiter.add(f"login:user:{_normalize(username)}", LOGIN_WINDOW_SECONDS)
    _limiter.add(f"login:ip:{ip}", LOGIN_WINDOW_SECONDS)


def record_login_success(username: str) -> None:
    """로그인에 성공하면 그 아이디의 실패 기록을 지운다(IP 기록은 둔다)."""
    if not _enabled():
        return
    _limiter.clear(f"login:user:{_normalize(username)}")


# ---- 메일이 나가는 요청(아이디 찾기·비밀번호 찾기) ----

def enforce_mail_request(targets: list[str], ip: str) -> None:
    """메일 요청 1건을 센다 - 대상(이메일·아이디)별, IP별, 전체 한도 중 하나라도 넘으면 429.
    계정이 실제로 있는지와 상관없이 입력값으로만 세므로 응답 차이로 계정 존재 여부를 알 수 없다."""
    if not _enabled():
        return
    waits = [
        _limiter.hit(f"mail:target:{_normalize(target)}", MAIL_MAX_PER_TARGET, MAIL_WINDOW_SECONDS) for target in targets
    ]
    waits.append(_limiter.hit(f"mail:ip:{ip}", MAIL_MAX_PER_IP, MAIL_WINDOW_SECONDS))
    waits.append(_limiter.hit("mail:global", MAIL_GLOBAL_MAX, MAIL_GLOBAL_WINDOW_SECONDS))
    wait = max(waits)
    if wait:
        raise _too_many(wait)
