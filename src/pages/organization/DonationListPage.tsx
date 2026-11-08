import { useDeferredValue } from 'react'
import { ChevronLeft, Package, Search } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { Button } from '@/components/common/Button/Button'
import { FilterSelect } from '@/components/common/FilterSelect/FilterSelect'
import { ItemRow } from '@/components/item/ItemRow/ItemRow'
import { getDonationItemFailure } from '@/features/donor/donationItemApiState'
import { useInfiniteDonationItemsQuery } from '@/hooks/queries/useDonationItemsQuery'
import { useItemCategoriesQuery } from '@/hooks/queries/useItemCategoriesQuery'
import { useItemConditionsQuery } from '@/hooks/queries/useItemConditionsQuery'
import { routePath } from '@/routes/paths'

const serviceRegion = { id: 1, name: '경기도 부천시' }

const conditionShortLabels: Record<string, string> = {
  HIGH: '상',
  MID: '중',
  LOW: '하',
}

export function DonationListPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const deferredQuery = useDeferredValue(query.trim())
  const selected = {
    category: searchParams.get('category') ?? '',
    location: searchParams.get('location') ?? '',
    condition: searchParams.get('condition') ?? '',
  }
  const categoriesQuery = useItemCategoriesQuery()
  const conditionsQuery = useItemConditionsQuery()
  const category = categoriesQuery.data?.find((item) => item.name === selected.category)
  const condition = conditionsQuery.data?.find((item) => item.description === selected.condition)
  const itemsQuery = useInfiniteDonationItemsQuery({
    keyword: deferredQuery || undefined,
    categoryId: category?.categoryId,
    regionId: selected.location ? serviceRegion.id : undefined,
    condition: condition?.code,
  })
  const items = itemsQuery.data?.pages.flatMap((page) => page.items) ?? []

  const updateFilter = (key: string, value: string) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    }, { replace: true })
  }

  const listError = itemsQuery.error
    ? getDonationItemFailure(itemsQuery.error).message
    : ''
  const metadataError = categoriesQuery.isError || conditionsQuery.isError

  return (
    <div data-filter-boundary className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 shrink-0 items-center gap-2 px-5">
        <button type="button" aria-label="뒤로가기" onClick={() => navigate(-1)} className="flex size-6 shrink-0 items-center justify-center text-primary-700">
          <ChevronLeft aria-hidden size={24} strokeWidth={2} />
        </button>
        <h1 className="typography-title-3 text-neutral-900">기부 물품 탐색</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-8 pt-2">
        <label className="relative block" htmlFor="donation-search">
          <span className="pointer-events-none absolute left-4 top-1/2 flex size-[18px] -translate-y-1/2 items-center justify-center text-primary-700">
            <Search aria-hidden size={18} strokeWidth={2} />
          </span>
          <input
            id="donation-search"
            type="search"
            aria-label="물품 또는 기부자명 검색"
            value={query}
            onChange={(event) => updateFilter('q', event.target.value)}
            placeholder="물품 또는 기부자명 검색"
            className="h-[54px] w-full rounded-input border border-neutral-500 bg-white px-12 typography-body-1 text-neutral-900 outline-none placeholder:text-neutral-600 focus:border-primary-700"
          />
        </label>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterSelect
            label="카테고리"
            value={selected.category}
            options={(categoriesQuery.data ?? []).map((item) => item.name)}
            onChange={(value) => updateFilter('category', value)}
          />
          <FilterSelect
            label="지역"
            value={selected.location}
            options={[serviceRegion.name]}
            onChange={(value) => updateFilter('location', value)}
          />
          <FilterSelect
            label="물품 상태"
            value={selected.condition}
            options={(conditionsQuery.data ?? []).map((item) => item.description)}
            onChange={(value) => updateFilter('condition', value)}
          />
        </div>

        {metadataError ? (
          <div role="alert" className="mt-3 rounded-control border border-error/30 bg-error-bg px-4 py-3">
            <p className="typography-body-2 text-error">필터 목록을 불러오지 못했어요.</p>
            <button type="button" className="mt-2 typography-label-1 text-primary-700 underline" onClick={() => { if (categoriesQuery.isError) void categoriesQuery.refetch(); if (conditionsQuery.isError) void conditionsQuery.refetch() }}>다시 시도</button>
          </div>
        ) : null}

        <section className="mt-3 space-y-3" aria-label="기부 물품 목록">
          {itemsQuery.isPending ? (
            <p role="status" className="py-12 text-center typography-body-2 text-neutral-700">기부 물품을 불러오는 중이에요.</p>
          ) : itemsQuery.isError ? (
            <div role="alert" className="rounded-card border border-neutral-200 bg-white px-4 py-10 text-center">
              <p className="typography-body-2 text-error">{listError}</p>
              <Button variant="secondary" className="mt-4 h-10" onClick={() => void itemsQuery.refetch()}>다시 시도</Button>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-card border border-neutral-200 bg-white px-4 py-10 text-center">
              <p className="typography-title-3 text-neutral-900">조건에 맞는 물품이 없어요</p>
              <p className="mt-2 typography-body-2 text-neutral-700">검색어 또는 필터를 변경해 주세요.</p>
            </div>
          ) : (
            items.map((item) => (
              <ItemRow
                key={item.donationItemId}
                title={`${item.itemName} ${item.availableQuantity}${item.unit}`}
                description={<><p>{item.donorName} · {item.regionName}</p><p>상태 {conditionShortLabels[item.conditionGrade] ?? item.conditionGrade} · 신청 가능 수량 {item.availableQuantity}{item.unit}</p></>}
                imageSrc={item.imageUrl ?? undefined}
                icon={<Package aria-hidden size={28} strokeWidth={2} />}
                thumbnailClassName="h-[58px] w-14 rounded-input !bg-error-bg"
                className="min-h-[89px] gap-3 p-3.5 shadow-none"
                titleClassName="typography-title-3"
                descriptionClassName="typography-label-2 line-clamp-none"
                onClick={() => navigate(routePath.organizationDonationDetail(String(item.donationItemId)))}
              />
            ))
          )}
        </section>

        {itemsQuery.hasNextPage ? (
          <Button variant="secondary" className="mt-4 w-full" disabled={itemsQuery.isFetchingNextPage} onClick={() => void itemsQuery.fetchNextPage()}>
            {itemsQuery.isFetchingNextPage ? '불러오는 중...' : '더 보기'}
          </Button>
        ) : null}
      </main>

      <BottomNavigation audience="organization" activeItem="explore" className="sticky bottom-0 shrink-0" />
    </div>
  )
}
