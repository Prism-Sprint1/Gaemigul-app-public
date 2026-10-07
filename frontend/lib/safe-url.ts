/**
 * 서버가 내려준 주소(외부 뉴스 링크, 이미지 등)를 화면의 href/src에 넣기 전에 확인한다.
 * 외부 RSS·API에서 온 값에 `javascript:` 같은 주소가 섞여 있으면 링크를 눌렀을 때 스크립트가 실행될 수 있어서,
 * http/https만 통과시키고 그 외(또는 형식이 잘못된 값)는 null로 돌려준다.
 */
export function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:" ? value : null
  } catch {
    return null
  }
}
