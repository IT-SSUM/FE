import { ChevronLeft, MessageCircle, Package } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button/Button'
import { routePath } from '@/routes/paths'

const donationDetailMap = {
  'towels-30': {
    title: '수건 30장',
    donor: '최윤서',
    category: '생활용품',
    quantity: '30장',
    condition: '중',
    location: '서울 구로구',
    availablePeriod: '2026.10.12 - 2026.10.18',
    description:
      '세탁 완료한 수건 30장입니다. 기관 요청 수량에 맞춰 일부 수량 신청이 가능해요.',
  },
  'books-12': {
    title: '아동 도서 12권',
    donor: '김나눔',
    category: '도서·문구',
    quantity: '12권',
    condition: '중',
    location: '서울 관악구',
    availablePeriod: '2026.10.14 - 2026.10.21',
    description: '초등학생이 읽기 좋은 동화책과 학습 도서입니다.',
  },
  'water-24': {
    title: '미개봉 생수 24개',
    donor: '박기부',
    category: '미사용 소모품',
    quantity: '24개',
    condition: '상',
    location: '서울 영등포구',
    availablePeriod: '2026.10.13 - 2026.10.16',
    description: '미개봉 상태의 생수입니다. 빠른 수령이 가능해요.',
  },
} as const

export function DonationDetailPage() {
  const navigate = useNavigate()
  const { donationId } = useParams()
  const donation =
    donationDetailMap[donationId as keyof typeof donationDetailMap] ??
    donationDetailMap['towels-30']

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
        <h1 className="typography-title-3 text-neutral-900">기부 물품 상세</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
        <h2 className="typography-heading-2 text-neutral-900">
          {donation.title}
        </h2>
        <p className="mt-2 typography-body-2 text-neutral-700">
          {donation.donor} · {donation.location}
        </p>

        <div className="mt-4 flex h-[216px] items-center justify-center rounded-card bg-primary-100 text-primary-700">
          <Package aria-hidden size={88} strokeWidth={2} />
        </div>

        <section className="mt-4 rounded-card border border-neutral-200 bg-white p-4">
          <dl className="space-y-2 typography-body-2">
            <InfoRow label="카테고리" value={donation.category} />
            <InfoRow label="기부 수량" value={donation.quantity} />
            <InfoRow label="물품 상태" value={donation.condition} />
            <InfoRow label="가능 기간" value={donation.availablePeriod} />
          </dl>
        </section>

        <section className="mt-5">
          <h3 className="typography-title-2 text-neutral-900">상세 설명</h3>
          <p className="mt-3 typography-body-1 text-neutral-900">
            {donation.description}
          </p>
        </section>
      </main>

      <footer className="grid shrink-0 grid-cols-2 gap-2 border-t border-neutral-200 bg-surface-canvas px-5 py-4">
        <Button
          variant="secondary"
          onClick={() => navigate(routePath.organizationRecommendation('stationery-30'))}
        >
          추천 비교
        </Button>
        <Button
          className="gap-2"
          onClick={() => navigate(routePath.chatRoom('mock-need-chat'))}
        >
          <MessageCircle aria-hidden size={18} strokeWidth={2} />
          신청하기
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
