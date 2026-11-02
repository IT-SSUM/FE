import { ChevronLeft, MessageCircle } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button/Button'
import { TransactionStatus } from '@/components/common/TransactionStatus/TransactionStatus'
import { ROUTES, routePath } from '@/routes/paths'

import { useDonorStore } from '@/features/donor/store'
import { unitOf, availableQuantity, titleOf } from '@/features/donor/model'
import { DonorPage, EmptyState } from '@/features/donor/DonorPage'

const requestDetailMap = {
  'req-towels-a': { donationId: 'towels-30',
    title: '구로희망복지관 요청',
    status: 'request' as const,
    itemName: '수건 30장',
    requestQuantity: '10장',
    remainQuantity: '20장',
    organization: '구로희망복지관',
    location: '서울 구로구',
    reason:
      '생활 지원 물품으로 수건이 부족해 신청했어요. 상태가 좋은 물품이라면 바로 전달받아 사용할 수 있어요.',
  },
  'offer-books-b': { donationId: 'books-12',
    title: 'A지역아동센터 제안',
    status: 'trading' as const,
    itemName: '아동 도서 12권',
    requestQuantity: '12권',
    remainQuantity: '추천 대기',
    organization: 'A지역아동센터',
    location: '서울 관악구',
    reason:
      '아이들의 독서 활동에 적합한 기관으로 판단되어 기부 제안을 보냈어요.',
  },
  'req-water-c': { donationId: 'water-24',
    title: '구로푸드뱅크 요청',
    status: 'complete' as const,
    itemName: '미개봉 생수 24개',
    requestQuantity: '24개',
    remainQuantity: '0개',
    organization: '구로푸드뱅크',
    location: '서울 구로구',
    reason: '요청 수량 전체가 전달 완료되어 거래 기록으로 보관돼요.',
  },
} as const

export function DonorRequestDetailPage() {
  const navigate = useNavigate()
  const { requestId } = useParams()
  const request = requestId && Object.hasOwn(requestDetailMap, requestId) ? requestDetailMap[requestId as keyof typeof requestDetailMap] : undefined
  const item = useDonorStore((state) => state.data.donations.find((row) => row.id === request?.donationId))
  if (!request || !item) return <DonorPage title="요청 상세" back={ROUTES.donor.myRequests}><EmptyState title="요청 정보를 찾을 수 없어요" to={ROUTES.donor.myRequests} label="요청 목록 보기" /></DonorPage>

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
        <h1 className="typography-title-3 text-neutral-900">요청 상세</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="typography-heading-2 text-neutral-900">
              {request.title}
            </h2>
            <p className="mt-2 typography-body-2 text-neutral-700">
              {request.organization} · {request.location}
            </p>
          </div>
          <TransactionStatus variant={request.status} className="shrink-0" />
        </div>

        <section className="mt-5 rounded-card border border-neutral-200 bg-white p-4">
          <dl className="space-y-2 typography-body-2">
            <InfoRow label="연결 물품" value={titleOf(item)} />
            <InfoRow label="신청 수량" value={request.requestQuantity} />
            <InfoRow label="남은 수량" value={`${availableQuantity(item)}${unitOf(item.name)}`} />
          </dl>
        </section>

        <section className="mt-5">
          <h3 className="typography-title-2 text-neutral-900">요청 내용</h3>
          <p className="mt-3 typography-body-1 text-neutral-900">
            {request.reason}
          </p>
        </section>
      </main>

      <footer className="grid shrink-0 grid-cols-2 gap-2 border-t border-neutral-200 bg-surface-canvas px-5 py-4">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          닫기
        </Button>
        <Button
          className="gap-2"
          onClick={() => navigate(routePath.chatRoom('mock-need-chat'))}
        >
          <MessageCircle aria-hidden size={18} strokeWidth={2} />
          채팅 미리보기
        </Button>
      </footer>
    </div>
  )
}

type InfoRowProps = {
  label: string
  value: string
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-2">
      <dt className="text-neutral-700">{label}</dt>
      <dd className="text-neutral-900">{value}</dd>
    </div>
  )
}
