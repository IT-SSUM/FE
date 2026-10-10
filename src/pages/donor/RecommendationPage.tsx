import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { cn } from '@/utils/cn'

const recommendationMock = [
  {
    id: 'org-1',
    rank: 1,
    name: '구로지역아동센터',
    address: '서울 구로구 가마산로 12',
    need: '필요 물품 도서 30권 · 희망 상태 중 이상',
    reason: '필요한 품목과 상태가 맞고 가까워요.',
  },
  {
    id: 'org-2',
    rank: 2,
    name: '구로종합사회복지관',
    address: '서울 구로구 가마산로 12',
    need: '필요 물품 도서 30권 · 희망 상태 중 이상',
    reason: '도서가 필요하고 전달 가능한 지역이에요.',
  },
  {
    id: 'org-3',
    rank: 3,
    name: '서울꿈나무센터',
    address: '서울 구로구 가마산로 12',
    need: '필요 물품 도서 30권 · 희망 상태 중 이상',
    reason: '기관이 요청한 물품 상태와 맞아요.',
  },
]

export function RecommendationPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 items-center gap-2 bg-surface-canvas px-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="flex size-6 items-center justify-center text-primary-700"
        >
          <ChevronLeft aria-hidden size={24} strokeWidth={2} />
        </button>
        <h1 className="typography-title-3 text-neutral-900">기관 추천</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
        <h2 className="typography-heading-2 text-neutral-900">
          나눔이 필요한 곳을 찾았어요
        </h2>

        <div className="mt-4 flex flex-col gap-4">
          {recommendationMock.map((organization) => (
            <RecommendationCard
              key={organization.id}
              organization={organization}
            />
          ))}
        </div>
      </main>

      <BottomNavigation activeItem="explore" className="shrink-0" />
    </div>
  )
}

type RecommendationCardProps = {
  organization: (typeof recommendationMock)[number]
}

function RecommendationCard({ organization }: RecommendationCardProps) {
  return (
    <article className="rounded-card border border-neutral-200 bg-white p-4">
      <h3 className="typography-title-2 text-neutral-900">
        <span
          className={cn(
            organization.rank === 1 && 'text-primary-700',
            organization.rank === 2 && 'text-primary-600',
            organization.rank === 3 && 'text-primary-500',
          )}
        >
          {organization.rank}순위
        </span>
        <span> · {organization.name}</span>
      </h3>

      <p className="mt-2 typography-label-2 text-neutral-700">
        {organization.address}
      </p>
      <p className="mt-2 typography-body-2 text-neutral-900">
        {organization.need}
      </p>
      <p className="mt-2 typography-body-2 text-neutral-700">
        추천 이유 · {organization.reason}
      </p>

      <div className="mt-2 text-right">
        <button
          type="button"
          className="typography-label-1 text-primary-700"
          aria-label={`${organization.name} 상세보기`}
        >
          기관 상세보기 →
        </button>
      </div>
    </article>
  )
}
