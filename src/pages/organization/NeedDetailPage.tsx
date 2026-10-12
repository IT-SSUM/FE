import { BookOpen, ChevronLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/common/Badge/Badge'
import { Button } from '@/components/common/Button/Button'
import { routePath } from '@/routes/paths'

const needDetailMap = {
  'stationery-30': {
    title: '학용품 30세트',
    status: 'progress' as const,
    category: '도서·문구',
    quantity: '30세트',
    condition: '중 이상',
    location: '서울 구로구 ○○로 12',
    deadline: '2026.10.18',
    description: '이번 주 아동 학습 활동에 사용할 학용품 세트가 필요해요.',
  },
} as const

export function NeedDetailPage() {
  const navigate = useNavigate()
  const { needId } = useParams()
  const need =
    needDetailMap[needId as keyof typeof needDetailMap] ??
    needDetailMap['stationery-30']

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
        <h1 className="typography-title-3 text-neutral-900">필요 물품 상세</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="typography-heading-2 text-neutral-900">
              {need.title}
            </h2>
            <p className="mt-2 typography-body-2 text-neutral-700">
              {need.category} · {need.location}
            </p>
          </div>
          <Badge variant={need.status} className="shrink-0" />
        </div>

        <div className="mt-4 flex h-[216px] items-center justify-center rounded-card bg-error-bg text-primary-700">
          <BookOpen aria-hidden size={88} strokeWidth={2} />
        </div>

        <section className="mt-4 rounded-card border border-neutral-200 bg-white p-4">
          <dl className="space-y-2 typography-body-2">
            <InfoRow label="필요 수량" value={need.quantity} />
            <InfoRow label="희망 상태" value={need.condition} />
            <InfoRow label="마감일" value={need.deadline} />
          </dl>
        </section>

        <section className="mt-5">
          <h3 className="typography-title-2 text-neutral-900">필요 사유</h3>
          <p className="mt-3 typography-body-1 text-neutral-900">
            {need.description}
          </p>
        </section>
      </main>

      <footer className="shrink-0 border-t border-neutral-200 bg-surface-canvas px-5 py-4">
        <Button
          className="w-full"
          onClick={() => navigate(routePath.organizationRecommendation(needId ?? 'stationery-30'))}
        >
          추천 기부자 보기
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
