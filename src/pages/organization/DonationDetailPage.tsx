import { ChevronLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button/Button'
import { routePath } from '@/routes/paths'

const donationDetailMap = {
  'water-20': {
    title: '생수 20개를 받을 수 있어요',
    donor: '기부자 A',
    itemName: '생수',
    quantity: '20개',
    condition: '상',
    location: '경기도 부천시',
    description:
      '신청 가능 수량은 20개예요. 수량·일정·전달 방법은 채팅에서 협의해요. 채팅 시작은 예약·기부 확정이 아니에요.',
    donorIntro: '이웃에게 필요한 물품을 전하고 있어요.',
  },
  'books-10': {
    title: '도서 10권을 받을 수 있어요',
    donor: '기부자 B',
    itemName: '도서',
    quantity: '10권',
    condition: '중',
    location: '경기도 부천시',
    description:
      '신청 가능 수량은 10권이에요. 수량·일정·전달 방법은 채팅에서 협의해요. 채팅 시작은 예약·기부 확정이 아니에요.',
    donorIntro: '좋은 책을 이웃과 함께 나누고 있어요.',
  },
  'clothes-5': {
    title: '의류 5벌을 받을 수 있어요',
    donor: '기부자 C',
    itemName: '의류',
    quantity: '5벌',
    condition: '하',
    location: '경기도 부천시',
    description:
      '신청 가능 수량은 5벌이에요. 수량·일정·전달 방법은 채팅에서 협의해요. 채팅 시작은 예약·기부 확정이 아니에요.',
    donorIntro: '사용할 수 있는 물품을 필요한 곳에 전하고 있어요.',
  },
} as const

export function DonationDetailPage() {
  const navigate = useNavigate()
  const { donationId } = useParams()
  const donation =
    donationDetailMap[donationId as keyof typeof donationDetailMap] ??
    donationDetailMap['water-20']

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 shrink-0 items-center gap-2 px-5">
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
        <h2 className="typography-heading-3 text-neutral-900">
          {donation.title}
        </h2>
        <p className="mt-2 typography-body-2 font-medium text-neutral-700">
          {donation.donor} · {donation.location}
        </p>

        <div
          className="mt-4 h-[188px] rounded-card bg-error-bg"
          role="img"
          aria-label={`${donation.itemName} 사진 영역`}
        />

        <section className="mt-4 rounded-card border border-neutral-200 bg-white p-4">
          <dl className="space-y-2 typography-label-1">
            <InfoRow label="물품 품목" value={donation.itemName} />
            <InfoRow label="신청 가능 수량" value={donation.quantity} />
            <InfoRow label="물품 상태" value={donation.condition} />
            <InfoRow label="물품 위치" value={donation.location} />
          </dl>
        </section>

        <p className="mt-5 typography-body-1 font-medium text-neutral-900">
          {donation.description}
        </p>

        <section className="mt-6">
          <h3 className="typography-title-2 text-neutral-900">기부자 소개</h3>
          <p className="mt-5 typography-body-1 font-medium text-neutral-900">
            {donation.donorIntro}
          </p>
        </section>
      </main>

      <footer className="shrink-0 bg-surface-canvas px-5 pb-3 pt-2">
        <Button
          className="h-[46px] w-full"
          onClick={() =>
            navigate(
              routePath.organizationDonationRequest(
                donationId ?? 'water-20',
              ),
            )
          }
        >
          요청하기
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
    <div className="grid grid-cols-[100px_1fr] gap-2">
      <dt className="whitespace-nowrap text-neutral-700">{label}</dt>
      <dd className="font-medium text-neutral-900">{value}</dd>
    </div>
  )
}
