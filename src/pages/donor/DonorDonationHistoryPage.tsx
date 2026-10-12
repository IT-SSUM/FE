import { CalendarDays, ChevronLeft, PackageCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/common/Badge/Badge'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { ItemRow } from '@/components/item/ItemRow/ItemRow'
import { routePath } from '@/routes/paths'

const historyItems = [
  {
    id: 'water-24',
    title: '미개봉 생수 24개',
    organization: '구로희망복지관',
    completedAt: '2026.10.08 전달 완료',
    quantity: '24개',
  },
  {
    id: 'stationery-30',
    title: '학용품 30세트',
    organization: 'A지역아동센터',
    completedAt: '2026.09.28 전달 완료',
    quantity: '30세트',
  },
]

export function DonorDonationHistoryPage() {
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
        <h1 className="typography-title-3 text-neutral-900">기부 내역</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-8 pt-2">
        <section className="rounded-card border border-neutral-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-input bg-success-bg text-success">
              <CalendarDays aria-hidden size={22} strokeWidth={2} />
            </span>
            <div>
              <p className="typography-label-2 text-neutral-700">
                누적 완료 기부
              </p>
              <p className="typography-title-1 text-neutral-900">5건</p>
            </div>
          </div>
        </section>

        <div className="mt-4">
          <Badge variant="complete">완료된 기부</Badge>
        </div>

        <section className="mt-4 space-y-3" aria-label="기부 완료 목록">
          {historyItems.map((item) => (
            <ItemRow
              key={item.id}
              title={item.title}
              description={
                <>
                  <p>{item.organization}</p>
                  <p>
                    {item.completedAt} · {item.quantity}
                  </p>
                </>
              }
              status="complete"
              statusType="badge"
              icon={<PackageCheck aria-hidden size={30} strokeWidth={2} />}
              thumbnailClassName="h-[76px] w-[68px] rounded-input !bg-success-bg"
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
