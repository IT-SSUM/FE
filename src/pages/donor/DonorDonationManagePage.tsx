import { ChevronLeft, Package, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/common/Badge/Badge'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { Button } from '@/components/common/Button/Button'
import { ItemRow } from '@/components/item/ItemRow/ItemRow'
import { ROUTES, routePath } from '@/routes/paths'

const donationItems = [
  {
    id: 'towels-30',
    title: '수건 30장',
    meta: '생활용품 · 서울 구로구',
    quantity: '전체 30장 · 예약 10장 · 남은 20장',
    status: 'progress' as const,
  },
  {
    id: 'books-12',
    title: '아동 도서 12권',
    meta: '도서·문구 · 서울 구로구',
    quantity: '전체 12권 · 추천 대기',
    status: 'waiting' as const,
  },
  {
    id: 'water-24',
    title: '미개봉 생수 24개',
    meta: '미사용 소모품 · 서울 구로구',
    quantity: '전체 24개 · 기부 완료',
    status: 'complete' as const,
  },
]

export function DonorDonationManagePage() {
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
        <h1 className="typography-title-3 text-neutral-900">
          등록한 물품 관리
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-8 pt-2">
        <section className="rounded-card bg-primary-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="typography-label-2 text-neutral-700">
                현재 등록한 기부 물품
              </p>
              <h2 className="mt-1 typography-heading-2 text-primary-700">
                4개
              </h2>
            </div>
            <Button
              className="h-10 gap-1 rounded-input px-3 typography-label-1"
              onClick={() => navigate(ROUTES.donor.donationNew)}
            >
              <Plus aria-hidden size={18} strokeWidth={2} />
              등록
            </Button>
          </div>
        </section>

        <div className="mt-4 flex gap-2">
          <Badge variant="progress">진행 중 2</Badge>
          <Badge variant="waiting">대기 1</Badge>
          <Badge variant="complete">완료 1</Badge>
        </div>

        <section className="mt-4 space-y-3" aria-label="등록한 물품 목록">
          {donationItems.map((item) => (
            <ItemRow
              key={item.id}
              title={item.title}
              description={
                <>
                  <p>{item.meta}</p>
                  <p>{item.quantity}</p>
                </>
              }
              status={item.status}
              statusType="badge"
              icon={<Package aria-hidden size={30} strokeWidth={2} />}
              thumbnailClassName="h-[76px] w-[68px] rounded-input !bg-primary-100"
              className="gap-3 p-4 shadow-none"
              descriptionClassName="typography-label-2 line-clamp-none"
              onClick={() => navigate(routePath.donorDonationDetail(item.id))}
            />
          ))}
        </section>
      </main>

      <BottomNavigation activeItem="my" className="sticky bottom-0 shrink-0" />
    </div>
  )
}
