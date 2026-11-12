import { ChevronLeft, PackageCheck } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button/Button'
import { getDonationItemFailure } from '@/features/donor/donationItemApiState'
import { useDonationItemsQuery } from '@/hooks/queries/useDonationItemsQuery'
import { useNeededItemQuery } from '@/hooks/queries/useNeededItemQuery'
import { routePath } from '@/routes/paths'
import type { ItemConditionCode } from '@/types/item'
import { cn } from '@/utils/cn'

const conditionRank: Record<ItemConditionCode, number> = {
  LOW: 1,
  MID: 2,
  HIGH: 3,
}

export function RecommendationPage() {
  const navigate = useNavigate()
  const { needId: needIdParam } = useParams()
  const needId = parsePositiveId(needIdParam)
  const neededItemQuery = useNeededItemQuery(needId)
  const neededItem = neededItemQuery.data
  const donationItemsQuery = useDonationItemsQuery(
    {
      categoryId: neededItem?.categoryId,
      size: 20,
    },
    neededItem !== undefined,
  )
  const recommendations = (donationItemsQuery.data?.items ?? [])
    .filter(
      (item) =>
        !neededItem ||
        conditionRank[item.conditionGrade] >= conditionRank[neededItem.desiredCondition],
    )
    .slice(0, 3)
  const isPending = neededItemQuery.isPending || donationItemsQuery.isPending
  const isError = neededItemQuery.isError || donationItemsQuery.isError
  const errorMessage = neededItemQuery.isError
    ? '필요 물품 정보를 불러오지 못했어요.'
    : donationItemsQuery.error
      ? getDonationItemFailure(donationItemsQuery.error).message
      : ''

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
        <h1 className="typography-title-3 text-neutral-900">기부 물품 추천</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-8 pt-2">
        <section className="rounded-card bg-primary-100 p-4">
          <p className="typography-label-2 text-neutral-700">조건에 맞는 물품</p>
          <h2 className="mt-1 typography-title-3 text-neutral-900">
            {neededItem
              ? `${neededItem.itemName} · ${neededItem.availableQuantity}${neededItem.unit} 필요`
              : '기부 물품을 찾고 있어요'}
          </h2>
        </section>

        {needId === null ? (
          <RecommendationState message="올바른 필요 물품 번호가 필요해요." />
        ) : isError ? (
          <RecommendationState
            message={errorMessage}
            actionText="다시 시도"
            onAction={() => {
              if (neededItemQuery.isError) void neededItemQuery.refetch()
              if (donationItemsQuery.isError) void donationItemsQuery.refetch()
            }}
          />
        ) : isPending ? (
          <RecommendationState message="조건에 맞는 기부 물품을 찾고 있어요." />
        ) : recommendations.length === 0 ? (
          <RecommendationState
            message="현재 조건에 맞는 기부 물품이 없어요."
            description="기부 물품 탐색에서 다른 물품도 확인해 보세요."
            actionText="기부 물품 탐색하기"
            onAction={() => navigate('/organization/donations')}
          />
        ) : (
          <section className="mt-4 space-y-3" aria-label="추천 기부 물품 목록">
            {recommendations.map((item, index) => (
              <article
                key={item.donationItemId}
                className="rounded-card border border-neutral-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-input bg-primary-100 text-primary-700">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <PackageCheck aria-hidden size={26} strokeWidth={2} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2
                      className={cn(
                        'typography-title-3',
                        index === 0 ? 'text-primary-700' : 'text-neutral-900',
                      )}
                    >
                      {index + 1}순위 · {item.itemName} {item.availableQuantity}{item.unit}
                    </h2>
                    <p className="mt-1 typography-body-2 text-neutral-700">
                      {item.donorName} · {item.regionName}
                    </p>
                    <p className="mt-1 typography-label-2 text-neutral-600">
                      신청 가능 수량 {item.availableQuantity}{item.unit}
                    </p>
                  </div>
                </div>
                <p className="mt-3 typography-body-2 text-neutral-900">
                  추천 이유 · 품목과 희망 물품 상태가 일치해요.
                </p>
                <Button
                  className="mt-4 w-full"
                  onClick={() =>
                    navigate(
                      routePath.organizationDonationDetail(
                        String(item.donationItemId),
                      ) + `?needId=${neededItem?.neededItemId ?? ''}`,
                    )
                  }
                >
                  기부 물품 확인하기
                </Button>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  )
}

function RecommendationState({
  message,
  description,
  actionText,
  onAction,
}: {
  message: string
  description?: string
  actionText?: string
  onAction?: () => void
}) {
  return (
    <section className="mt-4 rounded-card border border-neutral-200 bg-white px-5 py-12 text-center">
      <p className="typography-title-3 text-neutral-900">{message}</p>
      {description ? (
        <p className="mt-2 typography-body-2 text-neutral-700">{description}</p>
      ) : null}
      {actionText && onAction ? (
        <Button variant="secondary" className="mt-4" onClick={onAction}>
          {actionText}
        </Button>
      ) : null}
    </section>
  )
}

function parsePositiveId(value: string | undefined) {
  if (!value || !/^[1-9]\d*$/.test(value)) return null
  const id = Number(value)
  return Number.isSafeInteger(id) ? id : null
}
