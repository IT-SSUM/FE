import { ChevronLeft, Package, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { ItemRow } from '@/components/item/ItemRow/ItemRow'
import { routePath } from '@/routes/paths'

const donationItems = [
  {
    id: 'towels-30',
    title: '수건 30장',
    donor: '최윤서',
    location: '서울 구로구',
    category: '생활용품',
    condition: '상태 중',
  },
  {
    id: 'books-12',
    title: '아동 도서 12권',
    donor: '김나눔',
    location: '서울 관악구',
    category: '도서·문구',
    condition: '상태 중',
  },
  {
    id: 'water-24',
    title: '미개봉 생수 24개',
    donor: '박기부',
    location: '서울 영등포구',
    category: '미사용 소모품',
    condition: '상태 상',
  },
]

const filters = ['카테고리', '지역', '물품 상태']

export function DonationListPage() {
  const navigate = useNavigate()

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
            placeholder="품목 또는 기부자명 검색"
            className="h-[54px] w-full rounded-input border border-neutral-500 bg-white px-12 typography-body-1 text-neutral-900 outline-none placeholder:text-neutral-600 focus:border-primary-700"
          />
        </label>

        <div className="mt-4 flex gap-2 overflow-x-auto">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className="shrink-0 rounded-pill border border-neutral-200 bg-white px-3 py-1 typography-label-1 text-neutral-700"
            >
              {filter}
            </button>
          ))}
        </div>

        <section className="mt-4 space-y-4" aria-label="기부 물품 목록">
          {donationItems.map((item) => (
            <ItemRow
              key={item.id}
              title={item.title}
              description={
                <>
                  <p>
                    {item.donor} · {item.location}
                  </p>
                  <p>
                    {item.category} · {item.condition}
                  </p>
                </>
              }
              icon={<Package aria-hidden size={28} strokeWidth={2} />}
              thumbnailClassName="h-[68px] w-16 rounded-input !bg-primary-100"
              className="gap-3 p-4 shadow-none"
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
