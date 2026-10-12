import { useState } from 'react'
import { ChevronLeft, Package } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/common/Badge/Badge'
import { Button } from '@/components/common/Button/Button'
import { Dialog } from '@/components/common/Dialog/Dialog'
import { routePath } from '@/routes/paths'

const donationDetailMap = {
  'towels-30': {
    title: '수건 30장',
    status: 'progress' as const,
    category: '생활용품',
    quantity: '30장',
    remainQuantity: '20장',
    condition: '중',
    location: '서울 구로구',
    period: '2026.10.12 - 2026.10.18',
    description:
      '세탁 완료한 수건 30장입니다. 기관 A와 10장 예약되어 있고 남은 20장은 추가 매칭이 가능해요.',
  },
  'books-12': {
    title: '아동 도서 12권',
    status: 'waiting' as const,
    category: '도서·문구',
    quantity: '12권',
    remainQuantity: '12권',
    condition: '중',
    location: '서울 구로구',
    period: '2026.10.14 - 2026.10.21',
    description: '초등학생이 읽기 좋은 동화책과 학습 도서입니다.',
  },
  'water-24': {
    title: '미개봉 생수 24개',
    status: 'complete' as const,
    category: '미사용 소모품',
    quantity: '24개',
    remainQuantity: '0개',
    condition: '상',
    location: '서울 구로구',
    period: '2026.10.01 - 2026.10.08',
    description: '미개봉 생수 24개를 구로푸드뱅크에 전달 완료했어요.',
  },
  'stationery-30': {
    title: '학용품 30세트',
    status: 'complete' as const,
    category: '도서·문구',
    quantity: '30세트',
    remainQuantity: '0세트',
    condition: '상',
    location: '서울 구로구',
    period: '2026.09.20 - 2026.09.28',
    description: '새 학용품 세트를 A지역아동센터에 전달 완료했어요.',
  },
} as const

export function DonationDetailPage() {
  const navigate = useNavigate()
  const { donationId } = useParams()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const donation =
    donationDetailMap[donationId as keyof typeof donationDetailMap] ??
    donationDetailMap['towels-30']
  const isEditable = donation.status !== 'complete'

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
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="typography-heading-2 text-neutral-900">
              {donation.title}
            </h2>
            <p className="mt-2 typography-body-2 text-neutral-700">
              {donation.category} · {donation.location}
            </p>
          </div>
          <Badge variant={donation.status} className="shrink-0" />
        </div>

        <div className="mt-4 flex h-[216px] items-center justify-center rounded-card bg-primary-100 text-primary-700">
          <Package aria-hidden size={88} strokeWidth={2} />
        </div>

        <section className="mt-4 rounded-card border border-neutral-200 bg-white p-4">
          <dl className="space-y-2 typography-body-2">
            <InfoRow label="전체 수량" value={donation.quantity} />
            <InfoRow label="남은 수량" value={donation.remainQuantity} />
            <InfoRow label="물품 상태" value={donation.condition} />
            <InfoRow label="수령 기간" value={donation.period} />
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
          disabled={!isEditable}
          onClick={() => setDeleteOpen(true)}
        >
          삭제
        </Button>
        <Button
          disabled={!isEditable}
          onClick={() =>
            navigate(routePath.donorDonationEdit(donationId ?? 'towels-30'))
          }
        >
          수정
        </Button>
      </footer>

      <Dialog
        open={deleteOpen}
        title="물품을 삭제할까요?"
        description="삭제한 물품은 목록에서 사라지고 다시 추천 대상에 포함되지 않아요."
        confirmText="삭제하기"
        cancelText="취소"
        onConfirm={() => {
          setDeleteOpen(false)
          navigate(-1)
        }}
        onCancel={() => setDeleteOpen(false)}
      />
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
