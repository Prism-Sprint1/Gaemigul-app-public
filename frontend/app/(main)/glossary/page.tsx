"use client"

import { Search, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useId, useMemo, useRef, useState } from "react"

import { PageTitle, useAuth } from "@/components/common"
import { GlossaryTermCard } from "@/components/glossary/GlossaryTermCard"
import { GlossaryToneTabs } from "@/components/glossary/GlossaryToneTabs"
import { getGlossaryFavorites, getGlossaryTerms, toggleGlossaryFavorite } from "@/lib/api/glossary"
import { matchesQuery, toneForGrade, type ToneFilter } from "@/lib/glossary"
import type { ApiGlossaryTerm } from "@/lib/types/GlossaryType"

export default function GlossaryPage() {
  const router = useRouter()
  const [terms, setTerms] = useState<ApiGlossaryTerm[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [tone, setTone] = useState<ToneFilter>("all")
  const [query, setQuery] = useState("")
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set())
  const searchId = useId()
  const { status: authStatus, user } = useAuth()
  const trackView = authStatus === "authenticated"

  useEffect(() => {
    if (authStatus !== "authenticated") {
      setFavoriteIds(new Set())
      return
    }
    getGlossaryFavorites()
      .then((favorites) => setFavoriteIds(new Set(favorites.map((term) => term.id))))
      .catch((error) => console.error("[getGlossaryFavorites] 실패", error))
  }, [authStatus])

  const handleToggleFavorite = async (termId: number) => {
    if (authStatus !== "authenticated") {
      router.push("/login")
      return
    }
    // 낙관적 업데이트 - 실패하면 되돌린다
    const wasFavorited = favoriteIds.has(termId)
    setFavoriteIds((prev) => {
      const next = new Set(prev)
      if (wasFavorited) next.delete(termId)
      else next.add(termId)
      return next
    })
    try {
      await toggleGlossaryFavorite(termId)
    } catch (error) {
      console.error("[toggleGlossaryFavorite] 실패", error)
      setFavoriteIds((prev) => {
        const next = new Set(prev)
        if (wasFavorited) next.add(termId)
        else next.delete(termId)
        return next
      })
    }
  }

  // 로그인한 유저는 첫 진입 시 본인 등급에 맞는 톤을 기본값으로 - 그 뒤 직접 바꾸면 더 이상 덮어쓰지 않는다
  const toneDefaultedRef = useRef(false)
  useEffect(() => {
    if (toneDefaultedRef.current || authStatus === "loading") return
    toneDefaultedRef.current = true
    if (authStatus === "authenticated" && user) setTone(toneForGrade(user.grade))
  }, [authStatus, user])

  useEffect(() => {
    let cancelled = false

    getGlossaryTerms()
      .then((data) => {
        if (!cancelled) setTerms(data)
      })
      .catch((error) => {
        console.error("[getGlossaryTerms] 실패", error)
        if (!cancelled) setLoadError(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredTerms = useMemo(
    () => (terms ?? []).filter((term) => matchesQuery(term, query)),
    [terms, query]
  )

  return (
    <div className="flex min-h-svh justify-center bg-background p-3 sm:p-4 lg:p-6">
      <div className="flex w-full flex-col gap-3">
        <PageTitle
          title="개미들을 위한 주식&경제 용어 사전"
          description="난이도에 맞는 톤으로 투자 용어를 익혀보세요."
        />

        <main className="flex h-max min-w-0 flex-1 flex-col gap-4 rounded-xl border bg-card px-3 py-4 shadow-sm sm:pb-5 lg:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1.5">
              <GlossaryToneTabs value={tone} onChange={setTone} />
              <p className="text-[11px] text-muted-foreground">
                버튼을 누르면 용어는 그대로, 설명이 내 눈높이에 맞게 바뀌어요.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <label className="sr-only" htmlFor={searchId}>
                용어 검색
              </label>
              <input
                id={searchId}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setQuery("")
                }}
                placeholder="용어 검색"
                autoComplete="off"
                className="h-9 w-full rounded-lg border bg-background pr-9 pl-9 text-sm outline-offset-2 placeholder:text-muted-foreground focus-visible:outline-point"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="검색어 지우기"
                  className="absolute top-1/2 right-1 flex size-7 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-muted"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>

          {terms === null && !loadError ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              용어 사전을 불러오는 중이에요...
            </p>
          ) : loadError && (terms ?? []).length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              용어 사전을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
            </p>
          ) : filteredTerms.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              &ldquo;{query}&rdquo;에 해당하는 용어가 없어요.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTerms.map((term) => (
                <GlossaryTermCard
                  key={term.id}
                  term={term}
                  tone={tone}
                  onTagClick={setQuery}
                  trackView={trackView}
                  favorited={favoriteIds.has(term.id)}
                  onToggleFavorite={() => handleToggleFavorite(term.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
