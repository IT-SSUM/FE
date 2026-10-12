import { ChevronLeft, PackageCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button/Button'
import { routePath } from '@/routes/paths'
import { cn } from '@/utils/cn'

const recommendationMock = [
  {
    id: 'towels-30',
    rank: 1,
    title: '수건 30장',
    donor: '최윤서',
    location: '서울 구로구 · 1.8km',
    quantity: '30장',
    reason: '필요 수량과 위치가 가장 잘 맞아요.',
  },
  {
    id: 'books-12',
    rank: 2,
    title: '아동 도서 12권',
    donor: '김나눔',
    location: '서울 관악구 · 2.4km',
    quantity: '12권',
    reason: '물품 상태가 좋고 기관 활동과 적합해요.',
  },
  {
    id: 'water-24',
    rank: 3,
    title: '미개봉 생수 24개',
    donor: '박기부',
    location: '서울 영등포구 · 3.1km',
    quantity: '24개',
    reason: '수령 가능 기간이 가까워 빠른 거래가 가능해요.',
  },
]

export function RecommendationPage() {
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
        <h1 className="typography-title-3 text-neutral-900">기부자 추천</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-8 pt-2">
        <section className="rounded-card bg-primary-100 p-4">
          <p className="typography-label-2 text-neutral-700">AI 추천 결과</p>
          <h2 className="mt-1 typography-title-1 text-neutral-900">
            학용품 30세트에 맞는 기부 물품
          </h2>
        </section>

        <section className="mt-4 space-y-3" aria-label="추천 기부 물품 목록">
          {recommendationMock.map((item) => (
            <article
              key={item.id}
              className="rounded-card border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-input bg-primary-100 text-primary-700">
                  <PackageCheck aria-hidden size={26} strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2
                    className={cn(
                      'typography-title-3',
                      item.rank === 1 ? 'text-primary-700' : 'text-neutral-900',
                    )}
                  >
                    {item.rank}순위 · {item.title}
                  </h2>
                  <p className="mt-1 typography-body-2 text-neutral-700">
                    {item.donor} · {item.location}
                  </p>
                  <p className="mt-1 typography-label-2 text-neutral-600">
                    수량 {item.quantity}
                  </p>
                </div>
              </div>
              <p className="mt-3 typography-body-2 text-neutral-900">
                추천 이유 · {item.reason}
              </p>
              <Button
                className="mt-4 w-full"
                onClick={() => navigate(routePath.organizationDonationDetail(item.id))}
              >
                기부 물품 확인하기
              </Button>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
