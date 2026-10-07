"""서버 쪽 요청 횟수 제한(로그인·메일 요청), 세션 토큰 해시 저장, 로그인 응답 시간 맞춤, 로그 이메일 가리기. DB·메일에 연결하지 않는다."""

from pathlib import Path
import sys
from types import SimpleNamespace
import unittest
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import main
from backend.core import rate_limit
from backend.core.database import get_db
from backend.domain.auth.services import auth_service, email_service, password_service, session_service


class FakeClock:
    def __init__(self) -> None:
        self.now = 1000.0

    def __call__(self) -> float:
        return self.now


class SlidingWindowLimiterTests(unittest.TestCase):
    def setUp(self):
        self.clock = FakeClock()
        self.limiter = rate_limit.SlidingWindowLimiter(clock=self.clock)

    def test_allows_up_to_limit_then_blocks(self):
        for _ in range(3):
            self.assertEqual(self.limiter.hit("k", limit=3, window=60), 0)
        self.assertGreater(self.limiter.hit("k", limit=3, window=60), 0)

    def test_retry_after_counts_down_and_frees_after_window(self):
        for _ in range(3):
            self.limiter.hit("k", 3, 60)
        self.assertEqual(self.limiter.retry_after("k", 3, 60), 60)
        self.clock.now += 45
        self.assertEqual(self.limiter.retry_after("k", 3, 60), 15)
        self.clock.now += 15
        self.assertEqual(self.limiter.retry_after("k", 3, 60), 0)
        self.assertEqual(self.limiter.hit("k", 3, 60), 0)

    def test_window_slides_instead_of_resetting_all_at_once(self):
        self.limiter.hit("k", 2, 60)  # t=0
        self.clock.now += 30
        self.limiter.hit("k", 2, 60)  # t=30
        self.assertEqual(self.limiter.retry_after("k", 2, 60), 30)  # 처음 이벤트가 나가면 한 칸이 빈다
        self.clock.now += 30
        self.assertEqual(self.limiter.retry_after("k", 2, 60), 0)

    def test_blocked_hits_are_not_recorded(self):
        # 막힌 요청까지 세면 공격이 이어지는 동안 차단이 끝없이 길어진다
        for _ in range(2):
            self.limiter.hit("k", 2, 60)
        for _ in range(50):
            self.assertGreater(self.limiter.hit("k", 2, 60), 0)
            self.clock.now += 1
        self.clock.now = 1000.0 + 60
        self.assertEqual(self.limiter.retry_after("k", 2, 60), 0)

    def test_keys_are_independent_and_clear_works(self):
        for _ in range(2):
            self.limiter.hit("a", 2, 60)
        self.assertGreater(self.limiter.retry_after("a", 2, 60), 0)
        self.assertEqual(self.limiter.retry_after("b", 2, 60), 0)
        self.limiter.clear("a")
        self.assertEqual(self.limiter.retry_after("a", 2, 60), 0)

    def test_evicts_old_keys_when_full(self):
        limiter = rate_limit.SlidingWindowLimiter(clock=self.clock, max_keys=3)
        for key in ("a", "b", "c", "d", "e"):
            limiter.add(key, 60)
            self.clock.now += 1
        self.assertLessEqual(len(limiter._events), 3)


def _request(headers=None, host="10.0.0.9"):
    return SimpleNamespace(headers=headers or {}, client=SimpleNamespace(host=host))


class ClientIpTests(unittest.TestCase):
    def test_uses_first_forwarded_address(self):
        self.assertEqual(rate_limit.client_ip(_request({"x-forwarded-for": "1.2.3.4, 9.9.9.9"})), "1.2.3.4")

    def test_falls_back_to_real_ip_then_socket(self):
        self.assertEqual(rate_limit.client_ip(_request({"x-real-ip": "5.6.7.8"})), "5.6.7.8")
        self.assertEqual(rate_limit.client_ip(_request()), "10.0.0.9")


class RouterRateLimitTests(unittest.TestCase):
    def setUp(self):
        rate_limit.reset_for_tests()
        db = SimpleNamespace(add=MagicMock(), commit=AsyncMock(), execute=AsyncMock())

        async def _db():
            yield db

        main.app.dependency_overrides[get_db] = _db
        self.client = TestClient(main.app)

    def tearDown(self):
        main.app.dependency_overrides.clear()
        rate_limit.reset_for_tests()

    def _login(self, username="ant", password="wrong123", ip="1.1.1.1"):
        return self.client.post(
            "/auth/login", json={"username": username, "password": password}, headers={"x-forwarded-for": ip}
        )

    def test_login_blocks_after_too_many_failures_for_one_account(self):
        fail = AsyncMock(side_effect=auth_service.AuthError("아이디 또는 비밀번호가 올바르지 않습니다."))
        with patch.object(auth_service, "login", fail):
            for _ in range(rate_limit.LOGIN_MAX_FAILURES_PER_ACCOUNT):
                self.assertEqual(self._login().status_code, 401)
            blocked = self._login()
        self.assertEqual(blocked.status_code, 429)
        self.assertIn("Retry-After", blocked.headers)
        self.assertIn("초 뒤에", blocked.json()["detail"])
        # 막힌 뒤에는 비밀번호 확인 자체를 하지 않는다
        self.assertEqual(fail.await_count, rate_limit.LOGIN_MAX_FAILURES_PER_ACCOUNT)

    def test_login_limit_is_per_account_even_when_ip_changes(self):
        fail = AsyncMock(side_effect=auth_service.AuthError("x"))
        with patch.object(auth_service, "login", fail):
            for index in range(rate_limit.LOGIN_MAX_FAILURES_PER_ACCOUNT):
                self._login(ip=f"2.2.2.{index}")
            self.assertEqual(self._login(ip="3.3.3.3").status_code, 429)
            # 다른 아이디는 영향이 없다
            self.assertEqual(self._login(username="other", ip="3.3.3.3").status_code, 401)

    def test_login_success_clears_failures(self):
        user = SimpleNamespace(
            id=1, email="a@b.com", username="ant", nickname="개미", grade="새내기 개미", must_change_password=False,
            newsletter_opt_in=False, created_at=__import__("datetime").datetime(2026, 10, 1), nickname_changed_at=None,
        )
        fail = AsyncMock(side_effect=auth_service.AuthError("x"))
        with patch.object(auth_service, "login", fail):
            for _ in range(rate_limit.LOGIN_MAX_FAILURES_PER_ACCOUNT - 1):
                self._login()
        with (
            patch.object(auth_service, "login", AsyncMock(return_value=user)),
            patch.object(session_service, "create_session", AsyncMock(return_value="tok")),
        ):
            self.assertEqual(self._login().status_code, 200)
        # 성공했으니 그 아이디의 실패 기록은 지워졌고, 다시 10번까지 실패를 허용한다
        with patch.object(auth_service, "login", fail):
            for _ in range(rate_limit.LOGIN_MAX_FAILURES_PER_ACCOUNT):
                self.assertEqual(self._login().status_code, 401)

    def test_find_id_limits_same_email(self):
        with patch.object(auth_service, "find_id", AsyncMock()):
            for _ in range(rate_limit.MAIL_MAX_PER_TARGET):
                self.assertEqual(self.client.post("/auth/find-id", json={"email": "a@b.com"}).status_code, 200)
            blocked = self.client.post("/auth/find-id", json={"email": "a@b.com"})
            self.assertEqual(blocked.status_code, 429)
            self.assertIn("Retry-After", blocked.headers)
            # 다른 이메일은 통과
            self.assertEqual(self.client.post("/auth/find-id", json={"email": "c@d.com"}).status_code, 200)

    def test_reset_password_limits_same_account_and_global_total(self):
        with patch.object(auth_service, "reset_password", AsyncMock()):
            for _ in range(rate_limit.MAIL_MAX_PER_TARGET):
                body = {"username": "ant", "email": f"x{_}@b.com"}
                self.assertEqual(self.client.post("/auth/reset-password", json=body).status_code, 200)
            # 이메일을 바꿔도 같은 아이디면 막힌다(남의 계정에 임시 비밀번호를 반복 발급하는 걸 방지)
            self.assertEqual(
                self.client.post("/auth/reset-password", json={"username": "ant", "email": "new@b.com"}).status_code, 429
            )

    def test_global_mail_cap_cannot_be_bypassed_by_changing_ip_or_email(self):
        with patch.object(auth_service, "find_id", AsyncMock()), patch.object(rate_limit, "MAIL_GLOBAL_MAX", 3):
            codes = [
                self.client.post(
                    "/auth/find-id", json={"email": f"u{index}@b.com"}, headers={"x-forwarded-for": f"7.7.7.{index}"}
                ).status_code
                for index in range(5)
            ]
        self.assertEqual(codes, [200, 200, 200, 429, 429])

    def test_same_response_whether_or_not_account_exists(self):
        # 계정이 있든 없든 입력값으로만 세므로 상태 코드가 같다
        with patch.object(auth_service, "find_id", AsyncMock()):
            first = self.client.post("/auth/find-id", json={"email": "exists@b.com"})
            second = self.client.post("/auth/find-id", json={"email": "nobody@b.com"})
        self.assertEqual((first.status_code, first.json()), (second.status_code, second.json()))

    def test_can_be_disabled(self):
        fail = AsyncMock(side_effect=auth_service.AuthError("x"))
        with patch.object(auth_service, "login", fail), patch.object(rate_limit, "_enabled", lambda: False):
            codes = {self._login().status_code for _ in range(rate_limit.LOGIN_MAX_FAILURES_PER_ACCOUNT + 5)}
        self.assertEqual(codes, {401})


class SessionTokenHashTests(unittest.IsolatedAsyncioTestCase):
    def test_hash_is_deterministic_url_safe_and_not_the_token(self):
        token = "abcDEF123_-token"
        hashed = session_service.hash_token(token)
        self.assertEqual(hashed, session_service.hash_token(token))
        self.assertNotEqual(hashed, token)
        self.assertEqual(len(hashed), 43)
        self.assertRegex(hashed, r"^[A-Za-z0-9_-]+$")
        self.assertNotEqual(hashed, session_service.hash_token(token + "x"))

    async def test_create_session_stores_hash_and_returns_raw_token(self):
        session = SimpleNamespace(add=MagicMock())
        token = await session_service.create_session(session, SimpleNamespace(id=5))
        stored = session.add.call_args.args[0]
        self.assertEqual(stored.id, session_service.hash_token(token))
        self.assertNotEqual(stored.id, token)
        self.assertEqual(stored.user_id, 5)

    async def test_lookup_and_delete_use_the_hash(self):
        token = "raw-token-value"
        auth_session = SimpleNamespace(expires_at=__import__("datetime").datetime(2999, 1, 1), user_id=9)
        user = SimpleNamespace(id=9)
        lookups = []

        async def fake_get(model, key):
            lookups.append(key)
            return auth_session if len(lookups) == 1 else user

        session = SimpleNamespace(get=fake_get, execute=AsyncMock())
        self.assertIs(await session_service.get_user_by_session_token(session, token), user)
        self.assertEqual(lookups[0], session_service.hash_token(token))
        # 원본 토큰으로는 조회되지 않는다(DB에 원본이 저장돼 있지 않으므로)
        self.assertNotEqual(lookups[0], token)
        await session_service.delete_session(session, token)
        compiled = str(session.execute.await_args.args[0].compile(compile_kwargs={"literal_binds": True}))
        self.assertIn(session_service.hash_token(token), compiled)
        self.assertNotIn(token, compiled)


class LoginTimingTests(unittest.IsolatedAsyncioTestCase):
    async def test_missing_user_still_spends_bcrypt_time(self):
        data = SimpleNamespace(username="nobody", password="abc12345")
        with (
            patch.object(auth_service, "_get_by_username", AsyncMock(return_value=None)),
            patch.object(password_service, "spend_verify_time", MagicMock()) as spend,
        ):
            with self.assertRaises(auth_service.AuthError):
                await auth_service.login(SimpleNamespace(), data)
        spend.assert_called_once_with("abc12345")

    def test_dummy_verify_never_matches_and_does_not_raise(self):
        password_service.spend_verify_time("abc12345")
        password_service.spend_verify_time("가" * 100)
        self.assertFalse(password_service.verify_password("dummy-password-for-timing-x", password_service._DUMMY_HASH))


class MaskEmailTests(unittest.TestCase):
    def test_masks_local_part(self):
        self.assertEqual(email_service.mask_email("ant@example.com"), "a***@example.com")
        self.assertEqual(email_service.mask_email("x@example.com"), "x***@example.com")
        self.assertEqual(email_service.mask_email("not-an-email"), "***")


if __name__ == "__main__":
    unittest.main()
