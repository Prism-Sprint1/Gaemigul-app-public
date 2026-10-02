"""보안 보강 - 비밀번호 변경·재설정 시 세션 정리, 길이 제한(bcrypt 72바이트 등). DB에 연결하지 않는다."""

from pathlib import Path
import sys
from types import SimpleNamespace
import unittest
from unittest.mock import AsyncMock, MagicMock, patch

from pydantic import ValidationError

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from backend.domain.auth.schemas.auth import (
    PASSWORD_MAX_BYTES,
    USERNAME_MAX_LENGTH,
    WITHDRAWAL_CUSTOM_TEXT_MAX_LENGTH,
    ChangePasswordRequest,
    SignupRequest,
    WithdrawalFeedbackRequest,
)
from backend.domain.auth.services import auth_service, password_service


def _signup(**overrides):
    data = dict(
        email="ant@example.com",
        username="ant",
        nickname="개미",
        password="abc12345",
        password_confirm="abc12345",
        privacy_agreed=True,
    )
    data.update(overrides)
    return SignupRequest(**data)


class PasswordLengthTests(unittest.TestCase):
    def test_accepts_max_bytes(self):
        password = "a1" * (PASSWORD_MAX_BYTES // 2)
        self.assertEqual(_signup(password=password, password_confirm=password).password, password)

    def test_rejects_over_max_bytes(self):
        password = "a1" * (PASSWORD_MAX_BYTES // 2) + "b"
        with self.assertRaises(ValidationError):
            _signup(password=password, password_confirm=password)

    def test_counts_bytes_not_characters(self):
        # 한글은 글자당 3바이트 - 25자(75바이트)는 글자 수로는 짧아도 bcrypt 한도를 넘는다
        password = "가" * 25 + "a1"
        with self.assertRaises(ValidationError):
            _signup(password=password, password_confirm=password)

    def test_change_password_rejects_over_max_bytes(self):
        password = "a1" * (PASSWORD_MAX_BYTES // 2) + "b"
        with self.assertRaises(ValidationError):
            ChangePasswordRequest(current_password="x", new_password=password, new_password_confirm=password)

    def test_verify_over_max_bytes_is_mismatch_not_error(self):
        # 로그인·현재 비밀번호 확인에서 너무 긴 입력은 예외(500)가 아니라 불일치로 처리한다
        password_hash = password_service.hash_password("abc12345")
        self.assertFalse(password_service.verify_password("a" * 1000, password_hash))
        self.assertTrue(password_service.verify_password("abc12345", password_hash))


class UsernameAndFeedbackLengthTests(unittest.TestCase):
    def test_username_trimmed_and_limited(self):
        self.assertEqual(_signup(username="  ant ").username, "ant")
        self.assertEqual(len(_signup(username="u" * USERNAME_MAX_LENGTH).username), USERNAME_MAX_LENGTH)
        with self.assertRaises(ValidationError):
            _signup(username="u" * (USERNAME_MAX_LENGTH + 1))
        with self.assertRaises(ValidationError):
            _signup(username="   ")

    def test_withdrawal_custom_text_limited(self):
        WithdrawalFeedbackRequest(reason="기타", custom_text="가" * WITHDRAWAL_CUSTOM_TEXT_MAX_LENGTH)
        with self.assertRaises(ValidationError):
            WithdrawalFeedbackRequest(reason="기타", custom_text="가" * (WITHDRAWAL_CUSTOM_TEXT_MAX_LENGTH + 1))


class SessionInvalidationTests(unittest.IsolatedAsyncioTestCase):
    async def test_change_password_deletes_all_sessions(self):
        user = SimpleNamespace(id=7, password_hash=password_service.hash_password("abc12345"), must_change_password=True)
        session = SimpleNamespace(commit=AsyncMock())
        data = ChangePasswordRequest(current_password="abc12345", new_password="new12345", new_password_confirm="new12345")
        with patch.object(auth_service.session_service, "delete_all_sessions_for_user", AsyncMock()) as delete_all:
            await auth_service.change_password(session, user, data)
        delete_all.assert_awaited_once_with(session, 7)
        session.commit.assert_awaited_once()
        self.assertTrue(password_service.verify_password("new12345", user.password_hash))

    async def test_wrong_current_password_keeps_sessions(self):
        user = SimpleNamespace(id=7, password_hash=password_service.hash_password("abc12345"), must_change_password=False)
        session = SimpleNamespace(commit=AsyncMock())
        data = ChangePasswordRequest(current_password="wrong123", new_password="new12345", new_password_confirm="new12345")
        with patch.object(auth_service.session_service, "delete_all_sessions_for_user", AsyncMock()) as delete_all:
            with self.assertRaises(auth_service.AuthError):
                await auth_service.change_password(session, user, data)
        delete_all.assert_not_awaited()

    async def test_reset_password_deletes_all_sessions(self):
        user = SimpleNamespace(id=9, email="ant@example.com", password_hash="", must_change_password=False)
        session = SimpleNamespace(commit=AsyncMock())
        with (
            patch.object(auth_service, "_get_by_username", AsyncMock(return_value=user)),
            patch.object(auth_service.session_service, "delete_all_sessions_for_user", AsyncMock()) as delete_all,
            patch.object(auth_service.email_service, "send_email", MagicMock(return_value=True)),
        ):
            await auth_service.reset_password(session, "ant", "ant@example.com")
        delete_all.assert_awaited_once_with(session, 9)
        self.assertTrue(user.must_change_password)

    async def test_reset_password_mismatch_does_nothing(self):
        user = SimpleNamespace(id=9, email="other@example.com", password_hash="old", must_change_password=False)
        session = SimpleNamespace(commit=AsyncMock())
        with (
            patch.object(auth_service, "_get_by_username", AsyncMock(return_value=user)),
            patch.object(auth_service.session_service, "delete_all_sessions_for_user", AsyncMock()) as delete_all,
        ):
            await auth_service.reset_password(session, "ant", "ant@example.com")
        delete_all.assert_not_awaited()
        self.assertEqual(user.password_hash, "old")


if __name__ == "__main__":
    unittest.main()
