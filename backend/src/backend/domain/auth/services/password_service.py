# password_service.py
# 비밀번호 해싱·검증, 임시 비밀번호 생성

import secrets
import string

import bcrypt

_TEMP_PASSWORD_LENGTH = 10
# 헷갈리는 문자(0/O, 1/l/I) 제외
_TEMP_PASSWORD_ALPHABET = "".join(c for c in string.ascii_letters + string.digits if c not in "0O1lI")


# 존재하지 않는 아이디로 로그인할 때도 bcrypt 비교를 똑같이 한 번 수행하기 위한 더미 해시.
# 이게 없으면 "없는 아이디"는 비교를 건너뛰어 응답이 훨씬 빨라서, 응답 시간 차이로 가입된 아이디를 알아낼 수 있다
_DUMMY_HASH = bcrypt.hashpw(b"dummy-password-for-timing", bcrypt.gensalt()).decode("utf-8")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


# bcrypt 해시가 받을 수 있는 최대 길이(바이트). 넘으면 bcrypt 5.x가 예외를 던진다
_BCRYPT_MAX_BYTES = 72


def verify_password(password: str, password_hash: str) -> bool:
    encoded = password.encode("utf-8")
    # 가입·변경 때 72바이트 이하만 받으므로 그보다 긴 입력은 절대 일치할 수 없다 - 예외(500) 대신 불일치로 돌려준다
    if len(encoded) > _BCRYPT_MAX_BYTES:
        return False
    return bcrypt.checkpw(encoded, password_hash.encode("utf-8"))


# 아이디가 없을 때 호출 - 결과는 쓰지 않고, 있는 계정과 같은 시간이 걸리게만 한다
def spend_verify_time(password: str) -> None:
    verify_password(password, _DUMMY_HASH)


# 비밀번호 찾기(3-5)에서 발급하는 임시 비밀번호. 영문+숫자를 항상 섞어 넣어 password_service의
# 강도 규칙(schemas/auth.py의 _validate_password_strength)을 항상 통과하도록 보장한다
def generate_temp_password() -> str:
    letters = secrets.choice(string.ascii_uppercase) + secrets.choice(string.ascii_lowercase)
    digits = secrets.choice(string.digits) + secrets.choice(string.digits)
    rest = "".join(secrets.choice(_TEMP_PASSWORD_ALPHABET) for _ in range(_TEMP_PASSWORD_LENGTH - 4))
    chars = list(letters + digits + rest)
    secrets.SystemRandom().shuffle(chars)
    return "".join(chars)
