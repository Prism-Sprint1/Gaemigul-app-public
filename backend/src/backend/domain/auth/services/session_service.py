# session_service.py
# 로그인 세션 발급·조회·폐기 + 쿠키 발급/삭제.
#
# 세션은 서명 쿠키가 아니라 auth_session 테이블에 실제로 저장한다(쿠키엔 랜덤 토큰만 담김) -
# 로그아웃/강제 만료 시 그 행만 지우면 바로 무효화된다. 쿠키 속성(secure/samesite)은
# core/config.py에서 환경별로 분기한다(로컬은 secure=false/samesite=lax, 배포는 나중에 논의).
#
# DB에는 토큰 그대로가 아니라 SHA-256 해시만 저장한다 - DB가 유출돼도 저장된 값으로는 로그인 쿠키를 만들 수 없다.
# (토큰이 32바이트 난수라 비밀번호처럼 느린 해시(bcrypt)까지는 필요 없다.)

import base64
import hashlib
import secrets
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from fastapi import Response
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.config import get_settings
from backend.domain.auth.models.auth import AuthSession, AuthUser

_KST = ZoneInfo("Asia/Seoul")


def _now_kst() -> datetime:
    return datetime.now(_KST).replace(tzinfo=None)


# 쿠키에 담긴 원본 토큰 -> DB 키. SHA-256을 URL-safe base64(43자)로 쓴다. auth_session.id가 Text라 길이 문제는 없다
def hash_token(token: str) -> str:
    digest = hashlib.sha256(token.encode("utf-8")).digest()
    return base64.urlsafe_b64encode(digest).decode("ascii").rstrip("=")


async def create_session(session: AsyncSession, user: AuthUser) -> str:
    settings = get_settings()
    token = secrets.token_urlsafe(32)
    session.add(
        AuthSession(
            id=hash_token(token),
            user_id=user.id,
            expires_at=_now_kst() + timedelta(days=settings.session_ttl_days),
        )
    )
    return token


# 세션 토큰으로 로그인한 유저를 찾는다. 없거나 만료됐으면 None
async def get_user_by_session_token(session: AsyncSession, token: str) -> AuthUser | None:
    auth_session = await session.get(AuthSession, hash_token(token))
    if auth_session is None or auth_session.expires_at < _now_kst():
        return None
    return await session.get(AuthUser, auth_session.user_id)


async def delete_session(session: AsyncSession, token: str) -> None:
    await session.execute(delete(AuthSession).where(AuthSession.id == hash_token(token)))


# 한 유저의 모든 세션을 지운다(비밀번호 변경 시 다른 기기 로그인을 정리하는 용도)
async def delete_all_sessions_for_user(session: AsyncSession, user_id: int) -> None:
    await session.execute(delete(AuthSession).where(AuthSession.user_id == user_id))


def set_session_cookie(response: Response, token: str) -> None:
    settings = get_settings()
    response.set_cookie(
        key=settings.session_cookie_name,
        value=token,
        max_age=settings.session_ttl_days * 24 * 60 * 60,
        httponly=True,
        secure=settings.session_cookie_secure,
        samesite=settings.session_cookie_samesite,
        path="/",
    )


def clear_session_cookie(response: Response) -> None:
    settings = get_settings()
    response.delete_cookie(
        key=settings.session_cookie_name,
        httponly=True,
        secure=settings.session_cookie_secure,
        samesite=settings.session_cookie_samesite,
        path="/",
    )
