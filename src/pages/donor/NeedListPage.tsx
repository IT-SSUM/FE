import { ChevronLeft, Package, Search } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { ItemRow } from '@/components/item/ItemRow/ItemRow'
import { routePath } from '@/routes/paths'
import { filterNeeds, needFilterOptions } from './needSearch'

const filters = [
  { key: 'category', label: '카테고리' },
  { key: 'location', label: '지역' },
  { key: 'condition', label: '희망 상태' },
] as const

export function NeedListPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const selected = {
    category: searchParams.get('category') ?? '',
    location: searchParams.get('location') ?? '',
    condition: searchParams.get('condition') ?? '',
  }
  const results = filterNeeds({ query, ...selected })
  const hasFilters = Boolean(query || Object.values(selected).some(Boolean))

  const updateFilter = (key: string, value: string) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    }, { replace: true })
  }
  const resetFilters = () => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous)
      for (const key of ['q', 'category', 'location', 'condition']) next.delete(key)
      return next
    }, { replace: true })
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 items-center gap-2 bg-surface-canvas px-5">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-6 shrink-0 items-center justify-center text-primary-700"
        >
          <ChevronLeft aria-hidden size={24} strokeWidth={2} />
        </button>
        <h1 className="typography-title-3 text-neutral-900">
          필요 물품 탐색
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-8 pt-2">
        <label className="relative block" htmlFor="need-search">
          <span className="pointer-events-none absolute left-4 top-1/2 flex size-[18px] -translate-y-1/2 items-center justify-center text-primary-700">
            <Search aria-hidden size={18} strokeWidth={2} />
          </span>
          <input
            id="need-search"
            type="search"
            aria-label="품목 또는 기관명 검색"
            value={query}
            onChange={(event) => updateFilter('q', event.target.value)}
            placeholder="품목 또는 기관명 검색"
            className="h-[54px] w-full rounded-input border border-neutral-500 bg-white px-12 typography-body-1 text-neutral-900 outline-none placeholder:text-neutral-600 focus:border-primary-700"
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <label key={filter.key} className="min-w-0 max-w-full">
              <span className="sr-only">{filter.label}</span>
              <select
                aria-label={filter.label}
                value={selected[filter.key]}
                onChange={(event) => updateFilter(filter.key, event.target.value)}
                className="max-w-full rounded-pill border border-neutral-200 bg-white px-3 py-2 typography-label-1 text-primary-700 focus-visible:outline-primary-700"
              >
                <option value="">{filter.label} 전체</option>
                {selected[filter.key] && !needFilterOptions[filter.key].some((value) => value === selected[filter.key]) ? (
                  <option value={selected[filter.key]}>{selected[filter.key]}</option>
                ) : null}
                {needFilterOptions[filter.key].map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </label>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between typography-label-2">
          <p role="status" className="text-neutral-700">검색 결과 {results.length}개</p>
          {hasFilters ? (
            <button type="button" onClick={resetFilters} className="px-2 py-2 text-primary-700">
              검색·필터 초기화
            </button>
          ) : null}
        </div>

        <section className="mt-4 space-y-4" aria-label="필요 물품 목록">
          {results.length === 0 ? (
            <div className="rounded-card border border-neutral-200 bg-white px-4 py-10 text-center">
              <p className="typography-title-3 text-neutral-900">조건에 맞는 물품이 없어요</p>
              <p className="mt-2 typography-body-2 text-neutral-700">검색어를 바꾸거나 필터를 초기화해 주세요.</p>
            </div>
          ) : null}
          {results.map((item) => (
            <ItemRow
              key={item.id}
              title={item.title}
              description={
                <>
                  <p>
                    {item.organization} · {item.location}
                  </p>
                  <p>
                    {item.category} · 희망 상태 {item.condition}
                  </p>
                </>
              }
              icon={<Package aria-hidden size={28} strokeWidth={2} />}
              thumbnailClassName="h-[68px] w-16 rounded-input !bg-error-bg"
              className="gap-3 p-4 shadow-none"
              titleClassName="typography-title-3"
              descriptionClassName="typography-label-2 line-clamp-none"
              onClick={() => navigate(routePath.donorNeedDetail(item.id))}
            />
          ))}
        </section>
      </main>

      <BottomNavigation activeItem="explore" className="sticky bottom-0 shrink-0" />
    </div>
  )
}
