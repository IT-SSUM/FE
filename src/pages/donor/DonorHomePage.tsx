import {
  Bell,
  ClipboardList,
  Package,
} from 'lucide-react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { Button } from '@/components/common/Button/Button'
import { ItemRow } from '@/components/item/ItemRow/ItemRow'

import {
  ROUTES,
  routePath,
} from '@/routes/paths'

import boxHappyImage from '@/assets/images/mascot/box-happy.png'
import wordmarkLogo from '@/assets/logo/itssum-wordmark.svg'

import {
  useDonorProfileQuery,
} from '@/hooks/queries/useDonorProfileQuery'

import {
  useMatchesQuery,
} from '@/hooks/queries/useMatchesQuery'

import {
  matchErrorMessage,
} from '@/apis/match'

import {
  matchStatusLabel,
} from '@/features/matches/MatchActions'

const ACTIVE_STATUSES =
  new Set([
    'PENDING',
    'TRADING',
    'RESERVED',
  ])

export function DonorHomePage() {
  const navigate =
    useNavigate()

  const profileQuery =
    useDonorProfileQuery()

  const matchesQuery =
    useMatchesQuery()

  const matches =
    matchesQuery.data ??
    []

  const activeMatches =
    matches.filter(
      (match) =>
        ACTIVE_STATUSES.has(
          match.status,
        ),
    )

  const completedMatches =
    matches.filter(
      (match) =>
        match.status ===
        'COMPLETED',
    )

  const activeMatch =
    activeMatches[0]

  const userName =
    profileQuery.data?.name ??
    '기부자'

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 items-center justify-between bg-surface-canvas px-5">
        <img
          src={wordmarkLogo}
          alt="IT:SSUM"
          className="h-[22.72px] w-[119px]"
        />

        <Link
          to={
            ROUTES.notifications
          }
          aria-label="알림"
          className="flex size-10 items-center justify-center rounded-full text-primary-700 transition-colors hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
        >
          <Bell
            aria-hidden
            size={24}
            strokeWidth={2}
          />
        </Link>
      </header>

      <main className="flex-1 px-5 pb-8 pt-2">
        <section aria-labelledby="donor-home-greeting">
          <h1
            id="donor-home-greeting"
            className="typography-heading-2 text-neutral-900"
          >
            안녕하세요,{' '}
            {userName}님!
          </h1>

          <p className="mt-2 typography-body-2 text-neutral-700">
            오늘도 나눔을
            이어가 볼까요?
          </p>

          {profileQuery.isError ? (
            <p
              role="alert"
              className="mt-2 typography-label-2 text-error"
            >
              프로필 정보를
              불러오지
              못했어요.
            </p>
          ) : null}
        </section>

        <section className="mt-3 rounded-card bg-primary-200 p-4">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="typography-title-1 text-neutral-900">
                작은 나눔이
                <br />
                큰 기쁨이 돼요
              </h2>

              <p className="mt-1 typography-label-2 text-neutral-700">
                남은 물품을
                필요한 기관에
                전해요.
              </p>
            </div>

            <img
              src={
                boxHappyImage
              }
              alt=""
              className="size-[88px] shrink-0 object-contain"
            />
          </div>

          <Button
            className="mt-3 w-full"
            onClick={() =>
              navigate(
                ROUTES.donor
                  .donationNew,
              )
            }
          >
            기부 물품
            등록하기
          </Button>
        </section>

        <section className="mt-3">
          <div className="flex items-start justify-between gap-4">
            <h2 className="typography-title-3 text-neutral-900">
              나눔 연결 현황
            </h2>

            <Link
              to={
                ROUTES.donor
                  .myRequests
              }
              className="shrink-0 typography-label-2 text-primary-700"
            >
              전체 보기
            </Link>
          </div>

          {matchesQuery.isError ? (
            <div
              role="alert"
              className="mt-3 rounded-card border border-neutral-200 bg-white p-4"
            >
              <p className="typography-body-2 text-error">
                {matchErrorMessage(
                  matchesQuery.error,
                )}
              </p>

              <button
                type="button"
                className="mt-2 typography-label-1 text-primary-700 underline"
                onClick={() =>
                  void matchesQuery.refetch()
                }
              >
                다시 시도
              </button>
            </div>
          ) : (
            <div className="mt-3 rounded-card border border-neutral-200 bg-white p-4">
              <dl className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <dt className="typography-heading-2 text-primary-700">
                    {
                      matches.length
                    }
                  </dt>

                  <dd className="mt-1 typography-label-2 text-neutral-700">
                    전체 연결
                  </dd>
                </div>

                <div>
                  <dt className="typography-heading-2 text-primary-700">
                    {
                      activeMatches.length
                    }
                  </dt>

                  <dd className="mt-1 typography-label-2 text-neutral-700">
                    진행 중
                  </dd>
                </div>

                <div>
                  <dt className="typography-heading-2 text-primary-700">
                    {
                      completedMatches.length
                    }
                  </dt>

                  <dd className="mt-1 typography-label-2 text-neutral-700">
                    기부 완료
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </section>

        <section className="mt-5">
          <div className="flex items-center justify-between">
            <h2 className="typography-title-2 text-neutral-900">
              진행 중 나눔
            </h2>

            <Link
              to={
                ROUTES.donor
                  .myRequests
              }
              className="typography-label-2 text-primary-700"
            >
              더보기
            </Link>
          </div>

          {matchesQuery.isPending ? (
            <p
              role="status"
              className="mt-3 rounded-card border border-neutral-200 bg-white p-4 typography-body-2 text-neutral-700"
            >
              진행 중 나눔을
              불러오고 있어요.
            </p>
          ) : activeMatch ? (
            <ItemRow
              title={`${activeMatch.donationItemName} ${activeMatch.quantity}${activeMatch.unit}`}
              description={
                <>
                  <p>
                    {
                      activeMatch.organizationName
                    }
                  </p>

                  <p>
                    {
                      activeMatch.neededItemName
                    }{' '}
                    ·{' '}
                    {matchStatusLabel(
                      activeMatch.status,
                    )}
                  </p>
                </>
              }
              icon={
                <Package
                  aria-hidden
                  size={32}
                  strokeWidth={2}
                />
              }
              thumbnailClassName="h-[82px] w-[72px] rounded-input !bg-error-bg"
              className="mt-3 min-h-[126px] gap-4 p-4 shadow-none"
              titleClassName="typography-title-2"
              descriptionClassName="typography-label-2 line-clamp-none"
              onClick={() =>
                navigate(
                  routePath.donorRequestDetail(
                    String(
                      activeMatch.matchId,
                    ),
                  ),
                )
              }
            />
          ) : (
            <div className="mt-3 rounded-card border border-neutral-200 bg-white p-5 text-center">
              <p className="typography-title-3 text-neutral-900">
                진행 중인
                나눔이 없어요.
              </p>

              <p className="mt-2 typography-body-2 text-neutral-700">
                물품을 등록해
                새로운 나눔을
                시작해 보세요.
              </p>
            </div>
          )}
        </section>

        <section className="mt-5">
          <h2 className="typography-title-2 text-neutral-900">
            필요 물품
            둘러보기
          </h2>

          <div className="mt-3 rounded-card border border-neutral-200 bg-white p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-input bg-primary-100 text-primary-700">
                <ClipboardList
                  aria-hidden
                  size={26}
                />
              </span>

              <div>
                <h3 className="typography-title-3 text-neutral-900">
                  필요 물품
                  목록을 준비하고
                  있어요
                </h3>

                <p className="mt-2 typography-body-2 text-neutral-700">
                  기관에서 보낸
                  실제 요청은
                  제안·요청 화면에서
                  확인할 수 있어요.
                </p>

                <Link
                  to={
                    ROUTES.donor
                      .myRequests
                  }
                  className="mt-3 inline-block typography-label-1 text-primary-700"
                >
                  제안·요청 보기 →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BottomNavigation
        activeItem="home"
        className="sticky bottom-0 shrink-0"
      />
    </div>
  )
}