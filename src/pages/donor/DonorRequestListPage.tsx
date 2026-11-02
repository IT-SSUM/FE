import { ChevronLeft, ClipboardList } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { ItemRow } from '@/components/item/ItemRow/ItemRow'
import { routePath } from '@/routes/paths'

import { useDonorStore } from '@/features/donor/store'
import { titleOf } from '@/features/donor/model'

const requestItems = [
  {
    id: 'req-towels-a', donationId: 'towels-30', direction: 'received',
    title: '구로희망복지관 요청',
    item: '수건 30장 중 10장 신청',
    meta: '기관 요청 · 오늘 14:20',
    status: 'request' as const,
  },
  {
    id: 'offer-books-b', donationId: 'books-12', direction: 'sent',
    title: 'A지역아동센터 제안',
    item: '아동 도서 12권 기부 제안',
    meta: '보낸 제안 · 어제 18:10',
    status: 'trading' as const,
  },
  {
    id: 'req-water-c', donationId: 'water-24', direction: 'received',
    title: '구로푸드뱅크 요청',
    item: '미개봉 생수 24개 신청',
    meta: '매칭 확정 · 10월 8일',
    status: 'complete' as const,
  },
]

export function DonorRequestListPage() {
  const navigate = useNavigate()
  const donations = useDonorStore((state) => state.data.donations)
  const [params, setParams] = useSearchParams()
  const filter = params.get('filter') ?? '전체'
  const current = requestItems.filter((item) => donations.some((row) => row.id === item.donationId)).map((item) => ({ ...item, item: titleOf(donations.find((row) => row.id === item.donationId)!) }))
  const filtered = current.filter((item) => filter === '전체' || (filter === '받은 요청' && item.direction === 'received') || (filter === '보낸 제안' && item.direction === 'sent') || (filter === '확정' && item.status === 'complete'))

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
          보낸 제안 / 받은 요청
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-8 pt-2">
        <p className="mb-3 typography-label-2 text-neutral-700">요청·제안 샘플입니다. 실제 전송과 매칭은 거래 연동 후 제공됩니다.</p>
        <section className="grid grid-cols-2 gap-3">
          <SummaryCard label="받은 요청" value={`${current.filter((item) => item.direction === 'received').length}건`} />
          <SummaryCard label="보낸 제안" value={`${current.filter((item) => item.direction === 'sent').length}건`} />
        </section>

        <div className="mt-4 flex gap-2 overflow-x-auto">
          {['전체', '받은 요청', '보낸 제안', '확정'].map((value) => (
            <button
              key={value}
              aria-pressed={filter === value}
              onClick={() => setParams({ filter: value }, { replace: true })}
              type="button"
              className={`shrink-0 rounded-pill border border-neutral-200 px-3 py-2 typography-label-1 ${filter === value ? 'bg-primary-100 text-primary-700' : 'bg-white text-neutral-700'}`}
            >
              {value}
            </button>
          ))}
        </div>

        <section className="mt-4 space-y-3" aria-label="요청 및 제안 목록">
          {filtered.length === 0 ? <p role="status">해당하는 요청이나 제안이 없어요.</p> : null}
          {filtered.map((item) => (
            <ItemRow
              key={item.id}
              title={item.title}
              description={
                <>
                  <p>{item.item}</p>
                  <p>{item.meta}</p>
                </>
              }
              status={item.status}
              statusType="transaction"
              statusPlacement="bottom"
              icon={<ClipboardList aria-hidden size={30} strokeWidth={2} />}
              thumbnailClassName="h-[76px] w-[68px] rounded-input !bg-primary-100"
              className="gap-3 p-4 shadow-none"
              descriptionClassName="typography-label-2 line-clamp-none"
              onClick={() => navigate(routePath.donorRequestDetail(item.id))}
            />
          ))}
        </section>
      </main>

      <BottomNavigation activeItem="my" className="sticky bottom-0 shrink-0" />
    </div>
  )
}

type SummaryCardProps = {
  label: string
  value: string
}

function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <div className="rounded-card border border-neutral-200 bg-white p-4">
      <p className="typography-label-2 text-neutral-700">{label}</p>
      <p className="mt-1 typography-title-1 text-primary-700">{value}</p>
    </div>
  )
}
