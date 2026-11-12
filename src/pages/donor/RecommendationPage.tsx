import {
  useEffect,
  useRef,
  type ReactNode,
} from 'react'

import {
  ChevronLeft,
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
  matchErrorMessage,
} from '@/apis/match'

import {
  getRecommendationErrorMessage,
} from '@/apis/recommendation'

import {
  BottomNavigation,
} from '@/components/common/BottomNavigation/BottomNavigation'

import {
  Button,
} from '@/components/common/Button/Button'

import {
  getDonationItemFailure,
  parseDonationItemId,
} from '@/features/donor/donationItemApiState'

import {
  useOrganizationDetail,
} from '@/hooks/organization/useOrganizationDetail'

import {
  useCreateMatchMutation,
} from '@/hooks/mutations/useCreateMatchMutation'

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

import type {
  ItemConditionCode,
} from '@/types/item'

type RecommendationLocationState = {
  recalculate?: boolean
}

export function RecommendationPage() {
  const {
    donationId = '',
    organizationId:
      organizationIdParam,
  } =
    useParams()

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

  const createMatchMutation =
    useCreateMatchMutation()

  const recommendations =
    recommendationsQuery.data ??
    []

  const selectedRecommendation =
    organizationId ===
    null
      ? undefined
      : recommendations.find(
          (
            recommendation,
          ) =>
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
                replace:
                  true,

                state:
                  null,
              },
            )
          },
        },
      )
    }

  useEffect(() => {
    if (
      !shouldRecalculate ||
      donationItemId ===
        null ||
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
              replace:
                true,

              state:
                null,
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
    donationItemId ===
    null
  ) {
    return (
      <RecommendationLayout
        title="기관 추천"
        onBack={() =>
          navigate(
            ROUTES.donor
              .myItems,
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
            ROUTES.donor
              .myItems,
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
            ROUTES.donor
              .myItems,
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
            ROUTES.donor
              .myItems,
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
    organizationId !==
    null
  ) {
    if (
      loadingRecommendations
    ) {
      return (
        <RecommendationLayout
          title="기관 상세"
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
          title="기관 상세"
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
          title="기관 상세"
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

    const proposedQuantity =
      Math.min(
        donation.availableQuantity,
        selectedRecommendation.remainingQuantity,
      )

    const canPropose =
      Number.isSafeInteger(
        proposedQuantity,
      ) &&
      proposedQuantity >
        0

    const createProposal =
      () => {
        if (
          !canPropose ||
          createMatchMutation.isPending
        ) {
          return
        }

        createMatchMutation.mutate(
          {
            donationItemId,
            neededItemId:
              selectedRecommendation.neededItemId,

            quantity:
              proposedQuantity,

            message:
              '',
          },
          {
            onSuccess: (
              result,
            ) => {
              navigate(
                routePath.donorRequestDetail(
                  String(
                    result.matchId,
                  ),
                ),
              )
            },
          },
        )
      }

    const organizationAddress =
      organization
        ? [
            organization.address,
            organization.addressDetail,
          ]
            .filter(
              Boolean,
            )
            .join(' ')
        : selectedRecommendation.organizationAddress

    return (
      <RecommendationLayout
        title="기관 상세"
        onBack={() =>
          navigate(
            routePath.donorRecommendation(
              donationId,
            ),
          )
        }
        footer={
          <footer className="shrink-0 bg-surface-canvas px-5 pb-5 pt-3">
            {createMatchMutation.isError ? (
              <p
                role="alert"
                className="mb-2 typography-label-2 text-error"
              >
                {matchErrorMessage(
                  createMatchMutation.error,
                )}
              </p>
            ) : null}

            <Button
              className="w-full"
              disabled={
                !canPropose ||
                createMatchMutation.isPending
              }
              onClick={
                createProposal
              }
            >
              {createMatchMutation.isPending
                ? '제안 중...'
                : '제안하기'}
            </Button>
          </footer>
        }
      >
        <section>
          <h2 className="typography-heading-2 text-neutral-900">
            {
              selectedRecommendation.organizationName
            }
          </h2>

          <p className="mt-2 typography-body-2 text-neutral-700">
            {organization?.introduction ||
              '기관 상세 정보를 확인해 주세요.'}
          </p>
        </section>

        <section className="rounded-card border border-neutral-200 bg-white p-4">
          <dl className="space-y-2">
            <InfoRow
              label="주소"
              value={
                organizationAddress ||
                '-'
              }
            />

            <InfoRow
              label="전화번호"
              value={
                organization?.phone ||
                '-'
              }
            />

            <InfoRow
              label="필요 물품"
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
              value={recommendationConditionLabel(
                selectedRecommendation.desiredCondition,
              )}
            />
          </dl>
        </section>

        {organizationQuery.isPending ? (
          <p
            role="status"
            className="typography-body-2 text-neutral-700"
          >
            기관 상세 정보를 불러오고 있어요.
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

        <section>
          <h3 className="typography-title-2 text-neutral-900">
            기관의 요청
          </h3>

          <p className="mt-3 typography-body-1 text-neutral-800">
            {
              selectedRecommendation.itemName
            }{' '}
            {
              selectedRecommendation.remainingQuantity
            }
            {
              selectedRecommendation.unit
            }
            이 필요해요. 희망 상태는{' '}
            {recommendationConditionLabel(
              selectedRecommendation.desiredCondition,
            )}
            입니다.
          </p>
        </section>

        <section>
          <h3 className="typography-title-2 text-neutral-900">
            추천 이유
          </h3>

          <p className="mt-3 whitespace-pre-wrap typography-body-2 text-neutral-700">
            {selectedRecommendation.reason ||
              '등록한 물품과 기관의 필요 조건이 잘 맞아 추천됐어요.'}
          </p>
        </section>
      </RecommendationLayout>
    )
  }

  const showRecommendationCards =
    !loadingRecommendations &&
    !isRecommendationError &&
    recommendations.length >
      0

  return (
    <RecommendationLayout
      title="기관 추천"
      onBack={() =>
        navigate(
          ROUTES.donor
            .myItems,
        )
      }
      footer={
        <BottomNavigation
          activeItem="explore"
          className="shrink-0"
        />
      }
    >
      {!showRecommendationCards ? (
        <>
          <section className="rounded-card bg-primary-100 p-4">
            <p className="typography-label-2 text-neutral-700">
              등록한 기부 물품
            </p>

            <h2 className="mt-1 typography-title-2 text-neutral-900">
              {
                donation.itemName
              }{' '}
              {
                donation.availableQuantity
              }
              {
                donation.unit
              }
            </h2>

            <p className="mt-2 typography-body-2 text-neutral-700">
              추천 가능한 기관을 수량과 거리 기준으로 찾아드려요.
            </p>
          </section>

          <div className="flex items-center justify-between gap-3">
            <h2 className="typography-title-2 text-neutral-900">
              추천 기관
            </h2>

            <Button
              variant="secondary"
              className="h-10 shrink-0 gap-1.5"
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
        </>
      ) : null}

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
        />
      ) : null}

      {showRecommendationCards ? (
        <section className="space-y-4">
          {recommendations.map(
            (
              recommendation,
            ) => (
              <article
                key={`${recommendation.organizationId}-${recommendation.neededItemId}`}
                className="rounded-card border border-neutral-200 bg-white p-4"
              >
                <h2 className="typography-title-2 text-neutral-900">
                  <span className="text-primary-700">
                    {
                      recommendation.rank
                    }
                    순위
                  </span>{' '}
                  ·{' '}
                  {
                    recommendation.organizationName
                  }
                </h2>

                <p className="mt-2 typography-label-2 text-neutral-700">
                  {
                    recommendation.organizationAddress
                  }
                </p>

                <p className="mt-2 typography-body-2 text-neutral-900">
                  필요 물품{' '}
                  {
                    recommendation.itemName
                  }{' '}
                  {
                    recommendation.remainingQuantity
                  }
                  {
                    recommendation.unit
                  }{' '}
                  · 희망 상태{' '}
                  {recommendationConditionLabel(
                    recommendation.desiredCondition,
                  )}
                </p>

                <p className="mt-2 typography-body-2 text-neutral-700">
                  추천 이유 ·{' '}
                  {recommendation.reason ||
                    '등록한 물품과 기관의 필요 조건이 잘 맞아요.'}
                </p>

                <div className="mt-2 text-right">
                  <Link
                    to={routePath.donorRecommendedOrganization(
                      String(
                        donationItemId,
                      ),
                      String(
                        recommendation.organizationId,
                      ),
                    )}
                    className="inline-block typography-label-1 text-primary-700"
                  >
                    기관 상세보기 →
                  </Link>
                </div>
              </article>
            ),
          )}
        </section>
      ) : null}
    </RecommendationLayout>
  )
}

function RecommendationLayout({
  title,
  onBack,
  children,
  footer,
}: {
  title: string
  onBack: () => void
  children:
    ReactNode
  footer?:
    ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 shrink-0 items-center gap-2 px-5">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={
            onBack
          }
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

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-6 pt-2">
        {children}
      </main>

      {footer}
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
          {
            description
          }
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
    <div className="grid grid-cols-[88px_1fr] gap-3">
      <dt className="typography-body-2 text-neutral-700">
        {label}
      </dt>

      <dd className="break-words typography-body-2 text-neutral-900">
        {value}
      </dd>
    </div>
  )
}

function recommendationConditionLabel(
  condition:
    ItemConditionCode,
) {
  switch (
    condition
  ) {
    case 'HIGH':
      return '상'

    case 'MID':
      return '중 이상'

    case 'LOW':
      return '하 이상'
  }
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
