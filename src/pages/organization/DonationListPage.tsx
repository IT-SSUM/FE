import { ChevronLeft, Package, Search } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { FilterSelect } from '@/components/common/FilterSelect/FilterSelect'
import { ItemRow } from '@/components/item/ItemRow/ItemRow'
import { routePath } from '@/routes/paths'

const donationItems = [
  {
    id: 'water-20',
    title: '생수 20개',
    donor: '기부자 A',
    location: '경기도 부천시',
    category: '식품',
    condition: '미사용',
    availableQuantity: '20개',
  },
  {
    id: 'books-10',
    title: '도서 10권',
    donor: '기부자 B',
    location: '경기도 부천시',
    category: '도서',
    condition: '상태 중',
    availableQuantity: '10권',
  },
  {
    id: 'clothes-5',
    title: '의류 5벌',
    donor: '기부자 C',
    location: '경기도 부천시',
    category: '의류',
    condition: '상태 하',
    availableQuantity: '5벌',
  },
]

const filters = [
  {
    key: 'category',
    label: '카테고리',
    options: ['식품', '도서', '의류'],
  },
  {
    key: 'location',
    label: '지역',
    options: ['경기도 부천시'],
  },
  {
    key: 'condition',
    label: '물품 상태',
    options: ['미사용', '상태 중', '상태 하'],
  },
] as const

export function DonationListPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const selected = {
    category: searchParams.get('category') ?? '',
    location: searchParams.get('location') ?? '',
    condition: searchParams.get('condition') ?? '',
  }
  const normalizedQuery = query.trim().toLocaleLowerCase('ko-KR')
  const filteredItems = donationItems.filter((item) => {
    const matchesQuery =
      !normalizedQuery ||
      [item.title, item.donor].some((value) =>
        value.toLocaleLowerCase('ko-KR').includes(normalizedQuery),
      )

    return (
      matchesQuery &&
      (!selected.category || item.category === selected.category) &&
      (!selected.location || item.location === selected.location) &&
      (!selected.condition || item.condition === selected.condition)
    )
  })

  const updateFilter = (key: string, value: string) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )
  }

  return (
    <div
      data-filter-boundary
      className="flex min-h-dvh flex-col bg-surface-canvas"
    >
      <header className="flex h-14 shrink-0 items-center gap-2 px-5">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-6 shrink-0 items-center justify-center text-primary-700"
        >
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

        <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5">
          {filters.map((filter) => (
            <FilterSelect
              key={filter.key}
              label={filter.label}
              value={selected[filter.key]}
              options={filter.options}
              onChange={(value) => updateFilter(filter.key, value)}
            />
          ))}
        </div>

        <section className="mt-3 space-y-3" aria-label="기부 물품 목록">
          {filteredItems.length === 0 ? (
            <div className="rounded-card border border-neutral-200 bg-white px-4 py-10 text-center">
              <p className="typography-title-3 text-neutral-900">
                조건에 맞는 물품이 없어요
              </p>
              <p className="mt-2 typography-body-2 text-neutral-700">
                검색어 또는 필터를 변경해 주세요.
              </p>
            </div>
          ) : null}
          {filteredItems.map((item) => (
            <ItemRow
              key={item.id}
              title={item.title}
              description={
                <>
                  <p>
                    {item.donor} · {item.location}
                  </p>
                  <p>
                    {item.condition} · 신청 가능 수량 {item.availableQuantity}
                  </p>
                </>
              }
              icon={<Package aria-hidden size={28} strokeWidth={2} />}
              thumbnailClassName="h-[58px] w-14 rounded-input !bg-error-bg"
              className="h-[89px] gap-3 p-3.5 shadow-none"
              titleClassName="typography-title-3"
              descriptionClassName="typography-label-2 line-clamp-none"
              onClick={() => navigate(routePath.organizationDonationDetail(item.id))}
            />
          ))}
        </section>
      </main>

      <BottomNavigation
        audience="organization"
        activeItem="explore"
        className="sticky bottom-0 shrink-0"
      />
    </div>
  )
}
