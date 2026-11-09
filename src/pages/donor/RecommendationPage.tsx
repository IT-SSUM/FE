import {
  useEffect,
  useRef,
} from 'react'

import {
  ChevronLeft,
  MapPin,
  RefreshCw,
} from 'lucide-react'

import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  getOrganizationErrorMessage,
} from '@/apis/organization'

import {
  getRecommendationErrorMessage,
} from '@/apis/recommendation'

import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'

import { Button } from '@/components/common/Button/Button'

import {
  conditionLabel,
  getDonationItemFailure,
  parseDonationItemId,
} from '@/features/donor/donationItemApiState'

import {
  useOrganizationDetail,
} from '@/hooks/organization/useOrganizationDetail'

import {
  useRecalculateDonationRecommendationsMutation,
} from '@/hooks/mutations/useRecalculateDonationRecommendationsMutation'

import {
  useDonationItemQuery,
} from '@/hooks/queries/useDonationItemQuery'

import {
  useDonationRecommendationsQuery,
} from '@/hooks/queries/useDonationRecommendationsQuery'

import {
  ROUTES,
  routePath,
} from '@/routes/paths'

type RecommendationLocationState = {
  recalculate?: boolean
}

export function RecommendationPage() {
  const {
    donationId = '',
    organizationId:
      organizationIdParam,
  } = useParams()

  const navigate =
    useNavigate()

  const location =
    useLocation()

  const donationItemId =
    parseDonationItemId(
      donationId,
    )

  const organizationId =
    parsePositiveId(
      organizationIdParam,
    )

  const locationState =
    location.state as
      | RecommendationLocationState
      | null

  const shouldRecalculate =
    Boolean(
      locationState?.recalculate,
    )

  const recalculationStarted =
    useRef(false)

  const donationQuery =
    useDonationItemQuery(
      donationItemId,
    )

  const recommendationsQuery =
    useDonationRecommendationsQuery(
      donationItemId,
      !shouldRecalculate,
    )

  const recalculateMutation =
    useRecalculateDonationRecommendationsMutation()

  const recommendations =
    recommendationsQuery.data ??
    []

  const selectedRecommendation =
    organizationId === null
      ? undefined
      : recommendations.find(
          (recommendation) =>
            recommendation.organizationId ===
            organizationId,
        )

  const organizationQuery =
    useOrganizationDetail(
      selectedRecommendation
        ? organizationId
        : null,
    )

  const runRecalculation =
    () => {
      if (
        donationItemId ===
          null ||
        recalculateMutation.isPending
      ) {
        return
      }

      recalculateMutation.mutate(
        donationItemId,
        {
          onSuccess: () => {
            navigate(
              routePath.donorRecommendation(
                String(
                  donationItemId,
                ),
              ),
              {
                replace: true,
                state: null,
              },
            )
          },
        },
      )
    }

  useEffect(() => {
    if (
      !shouldRecalculate ||
      donationItemId === null ||
      recalculationStarted.current
    ) {
      return
    }

    recalculationStarted.current =
      true

    recalculateMutation.mutate(
      donationItemId,
      {
        onSuccess: () => {
          navigate(
            routePath.donorRecommendation(
              String(
                donationItemId,
              ),
            ),
            {
              replace: true,
              state: null,
            },
          )
        },
      },
    )
  }, [
    donationItemId,
    navigate,
    recalculateMutation,
    shouldRecalculate,
  ])

  if (
    donationItemId === null
  ) {
    return (
      <RecommendationLayout
        title="기관 추천"
        onBack={() =>
          navigate(
            ROUTES.donor.myItems,
          )
        }
      >
        <StateCard
          title="올바른 기부 물품 번호가 필요해요."
        />
      </RecommendationLayout>
    )
  }

  if (
    donationQuery.isPending
  ) {
    return (
      <RecommendationLayout
        title="기관 추천"
        onBack={() =>
          navigate(
            ROUTES.donor.myItems,
          )
        }
      >
        <StateCard
          title="기부 물품 정보를 불러오고 있어요."
        />
      </RecommendationLayout>
    )
  }

  if (
    donationQuery.isError
  ) {
    return (
      <RecommendationLayout
        title="기관 추천"
        onBack={() =>
          navigate(
            ROUTES.donor.myItems,
          )
        }
      >
        <StateCard
          title={
            getDonationItemFailure(
              donationQuery.error,
            ).message
          }
          action="다시 시도"
          onAction={() =>
            void donationQuery.refetch()
          }
        />
      </RecommendationLayout>
    )
  }

  const donation =
    donationQuery.data

  if (!donation) {
    return (
      <RecommendationLayout
        title="기관 추천"
        onBack={() =>
          navigate(
            ROUTES.donor.myItems,
          )
        }
      >
        <StateCard
          title="기부 물품 정보를 찾을 수 없어요."
        />
      </RecommendationLayout>
    )
  }

  const loadingRecommendations =
    shouldRecalculate
      ? recalculateMutation.isPending
      : recommendationsQuery.isPending

  const recommendationError =
    shouldRecalculate
      ? recalculateMutation.error
      : recommendationsQuery.error

  const isRecommendationError =
    shouldRecalculate
      ? recalculateMutation.isError
      : recommendationsQuery.isError

  if (
    organizationId !== null
  ) {
    if (
      loadingRecommendations
    ) {
      return (
        <RecommendationLayout
          title="추천 기관 상세"
          onBack={() =>
            navigate(
              routePath.donorRecommendation(
                donationId,
              ),
            )
          }
        >
          <StateCard
            title="추천 기관 정보를 불러오고 있어요."
          />
        </RecommendationLayout>
      )
    }

    if (
      isRecommendationError
    ) {
      return (
        <RecommendationLayout
          title="추천 기관 상세"
          onBack={() =>
            navigate(
              routePath.donorRecommendation(
                donationId,
              ),
            )
          }
        >
          <StateCard
            title={
              getRecommendationErrorMessage(
                recommendationError,
              )
            }
            action="다시 시도"
            onAction={() =>
              void recommendationsQuery.refetch()
            }
          />
        </RecommendationLayout>
      )
    }

    if (
      !selectedRecommendation
    ) {
      return (
        <RecommendationLayout
          title="추천 기관 상세"
          onBack={() =>
            navigate(
              routePath.donorRecommendation(
                donationId,
              ),
            )
          }
        >
          <StateCard
            title="추천 목록에 없는 기관이에요."
            action="추천 목록 보기"
            onAction={() =>
              navigate(
                routePath.donorRecommendation(
                  donationId,
                ),
              )
            }
          />
        </RecommendationLayout>
      )
    }

    const organization =
      organizationQuery.data

    return (
      <RecommendationLayout
        title="추천 기관 상세"
        onBack={() =>
          navigate(
            routePath.donorRecommendation(
              donationId,
            ),
          )
        }
      >
        <section className="rounded-card bg-primary-100 p-4">
          <p className="typography-label-2 text-primary-700">
            {
              selectedRecommendation.rank
            }
            순위 추천
          </p>

          <h2 className="mt-1 typography-heading-2 text-neutral-900">
            {
              selectedRecommendation.organizationName
            }
          </h2>

          <p className="mt-2 flex items-center gap-1 typography-body-2 text-neutral-700">
            <MapPin
              aria-hidden
              size={16}
            />

            {
              selectedRecommendation.organizationAddress
            }
          </p>
        </section>

        <section className="rounded-card border border-neutral-200 bg-white p-4">
          <h3 className="typography-title-3 text-neutral-900">
            필요 물품
          </h3>

          <dl className="mt-3 space-y-2">
            <InfoRow
              label="품목"
              value={
                selectedRecommendation.itemName
              }
            />

            <InfoRow
              label="필요 수량"
              value={`${selectedRecommendation.remainingQuantity}${selectedRecommendation.unit}`}
            />

            <InfoRow
              label="희망 상태"
              value={
                conditionLabel[
                  selectedRecommendation.desiredCondition
                ] ??
                selectedRecommendation.desiredCondition
              }
            />

            <InfoRow
              label="추천 점수"
              value={`${selectedRecommendation.score}점`}
            />

            <InfoRow
              label="거리"
              value={`${selectedRecommendation.distanceKm}km`}
            />
          </dl>
        </section>

        {organizationQuery.isPending ? (
          <p
            role="status"
            className="typography-body-2 text-neutral-700"
          >
            기관 상세 정보를
            불러오고 있어요.
          </p>
        ) : null}

        {organizationQuery.isError ? (
          <section
            role="alert"
            className="rounded-card border border-error/30 bg-error-bg p-4"
          >
            <p className="typography-body-2 text-error">
              {getOrganizationErrorMessage(
                organizationQuery.error,
                '기관 상세 정보를 불러오지 못했어요.',
              )}
            </p>

            <button
              type="button"
              className="mt-2 typography-label-1 text-primary-700 underline"
              onClick={() =>
                void organizationQuery.refetch()
              }
            >
              다시 시도
            </button>
          </section>
        ) : null}

        {organization ? (
          <section className="rounded-card border border-neutral-200 bg-white p-4">
            <h3 className="typography-title-3 text-neutral-900">
              기관 정보
            </h3>

            <dl className="mt-3 space-y-2">
              <InfoRow
                label="기관명"
                value={
                  organization.name
                }
              />

              <InfoRow
                label="연락처"
                value={
                  organization.phone
                }
              />

              <InfoRow
                label="주소"
                value={[
                  organization.address,
                  organization.addressDetail,
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
            </dl>

            <h3 className="mt-5 typography-title-3 text-neutral-900">
              기관 소개
            </h3>

            <p className="mt-2 whitespace-pre-wrap typography-body-2 text-neutral-700">
              {organization.introduction ||
                '등록된 기관 소개가 없어요.'}
            </p>
          </section>
        ) : null}

        {selectedRecommendation.reason ? (
          <section className="rounded-card border border-neutral-200 bg-white p-4">
            <h3 className="typography-title-3 text-neutral-900">
              추천 이유
            </h3>

            <p className="mt-2 typography-body-2 text-neutral-700">
              {
                selectedRecommendation.reason
              }
            </p>
          </section>
        ) : null}
      </RecommendationLayout>
    )
  }

  return (
    <RecommendationLayout
      title="기관 추천"
      onBack={() =>
        navigate(
          ROUTES.donor.myItems,
        )
      }
    >
      <section className="rounded-card bg-primary-100 p-4">
        <p className="typography-label-2 text-neutral-700">
          등록한 기부 물품
        </p>

        <h2 className="mt-1 typography-title-2 text-neutral-900">
          {donation.itemName}{' '}
          {
            donation.availableQuantity
          }
          {donation.unit}
        </h2>

        <p className="mt-2 typography-body-2 text-neutral-700">
          추천 가능한 기관을
          수량과 거리 기준으로
          찾아드려요.
        </p>
      </section>

      <div className="flex items-center justify-between gap-3">
        <h2 className="typography-title-2 text-neutral-900">
          추천 기관
        </h2>

        <Button
          variant="secondary"
          className="h-10 shrink-0"
          disabled={
            recalculateMutation.isPending
          }
          onClick={
            runRecalculation
          }
        >
          <RefreshCw
            aria-hidden
            size={16}
          />

          {recalculateMutation.isPending
            ? '계산 중'
            : '다시 계산'}
        </Button>
      </div>

      {loadingRecommendations ? (
        <StateCard
          title="추천 기관을 계산하고 있어요."
        />
      ) : null}

      {isRecommendationError ? (
        <StateCard
          title={
            getRecommendationErrorMessage(
              recommendationError,
            )
          }
          action="다시 시도"
          onAction={
            shouldRecalculate
              ? runRecalculation
              : () =>
                  void recommendationsQuery.refetch()
          }
        />
      ) : null}

      {!loadingRecommendations &&
      !isRecommendationError &&
      recommendations.length ===
        0 ? (
        <StateCard
          title="현재 추천 가능한 기관이 없어요."
          description="모집 중인 필요 물품이나 거래 상태가 변경되면 다시 계산해 보세요."
          action="추천 다시 계산"
          onAction={
            runRecalculation
          }
        />
      ) : null}

      {!loadingRecommendations &&
      !isRecommendationError &&
      recommendations.length >
        0 ? (
        <section className="space-y-3">
          {recommendations.map(
            (
              recommendation,
            ) => (
              <article
                key={`${recommendation.organizationId}-${recommendation.neededItemId}`}
                className="rounded-card border border-neutral-200 bg-white p-4"
              >
                <p className="typography-label-1 text-primary-700">
                  {
                    recommendation.rank
                  }
                  순위
                </p>

                <h3 className="mt-1 typography-title-2 text-neutral-900">
                  {
                    recommendation.organizationName
                  }
                </h3>

                <p className="mt-2 typography-body-2 text-neutral-700">
                  {
                    recommendation.organizationAddress
                  }
                </p>

                <div className="mt-4 rounded-control bg-neutral-100 p-3">
                  <p className="typography-label-1 text-neutral-900">
                    {
                      recommendation.itemName
                    }{' '}
                    {
                      recommendation.remainingQuantity
                    }
                    {
                      recommendation.unit
                    }{' '}
                    필요
                  </p>

                  <p className="mt-1 typography-label-2 text-neutral-700">
                    희망 상태{' '}
                    {conditionLabel[
                      recommendation
                        .desiredCondition
                    ] ??
                      recommendation.desiredCondition}
                  </p>
                </div>

                <div className="mt-3 flex gap-4 typography-label-2 text-neutral-700">
                  <span>
                    추천 점수{' '}
                    {
                      recommendation.score
                    }
                    점
                  </span>

                  <span>
                    거리{' '}
                    {
                      recommendation.distanceKm
                    }
                    km
                  </span>
                </div>

                {recommendation.reason ? (
                  <p className="mt-3 typography-body-2 text-neutral-700">
                    추천 이유 ·{' '}
                    {
                      recommendation.reason
                    }
                  </p>
                ) : null}

                <div className="mt-4 text-right">
                  <Link
                    to={routePath.donorRecommendedOrganization(
                      String(
                        donationItemId,
                      ),
                      String(
                        recommendation.organizationId,
                      ),
                    )}
                    className="inline-block py-2 typography-label-1 text-primary-700"
                  >
                    기관 상세보기 →
                  </Link>
                </div>
              </article>
            ),
          )}
        </section>
      ) : null}

      <BottomNavigation
        activeItem="explore"
      />
    </RecommendationLayout>
  )
}

function RecommendationLayout({
  title,
  onBack,
  children,
}: {
  title: string
  onBack: () => void
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 shrink-0 items-center gap-2 px-5">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={onBack}
          className="flex size-8 items-center justify-center text-primary-700"
        >
          <ChevronLeft
            aria-hidden
            size={24}
          />
        </button>

        <h1 className="typography-title-3 text-neutral-900">
          {title}
        </h1>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-5 pb-6 pt-2">
        {children}
      </main>
    </div>
  )
}

function StateCard({
  title,
  description,
  action,
  onAction,
}: {
  title: string
  description?: string
  action?: string
  onAction?: () => void
}) {
  return (
    <section className="rounded-card border border-neutral-200 bg-white px-5 py-10 text-center">
      <p className="typography-title-3 text-neutral-900">
        {title}
      </p>

      {description ? (
        <p className="mt-2 typography-body-2 text-neutral-700">
          {description}
        </p>
      ) : null}

      {action &&
      onAction ? (
        <Button
          variant="secondary"
          className="mt-4"
          onClick={
            onAction
          }
        >
          {action}
        </Button>
      ) : null}
    </section>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="grid grid-cols-[84px_1fr] gap-3">
      <dt className="text-neutral-700">
        {label}
      </dt>

      <dd className="break-words text-neutral-900">
        {value}
      </dd>
    </div>
  )
}

function parsePositiveId(
  value:
    | string
    | undefined,
) {
  if (
    !value ||
    !/^[1-9]\d*$/.test(
      value,
    )
  ) {
    return null
  }

  const id =
    Number(value)

  return Number.isSafeInteger(
    id,
  )
    ? id
    : null
}