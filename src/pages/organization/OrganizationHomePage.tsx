import { Bell, BookOpen, ClipboardList, Package } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { matchErrorMessage } from '@/apis/match'
import { getNeededItemErrorMessage } from '@/apis/neededItem'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { Button } from '@/components/common/Button/Button'
import { ItemRow } from '@/components/item/ItemRow/ItemRow'
import { useMatchesQuery } from '@/hooks/queries/useMatchesQuery'
import { useMyNeededItemsQuery } from '@/hooks/queries/useMyNeededItemsQuery'
import { ROUTES, routePath } from '@/routes/paths'
import boxHappyImage from '@/assets/images/mascot/box-happy.png'
import wordmarkLogo from '@/assets/logo/itssum-wordmark.svg'

const neededItemStatusLabels = {
  RECRUITING: '모집중',
  FULL: '예약마감',
  CLOSED: '모집 종료',
}

export function OrganizationHomePage() {
  const navigate = useNavigate()
  const neededItemsQuery = useMyNeededItemsQuery()
  const matchesQuery = useMatchesQuery()
  const neededItems = neededItemsQuery.data ?? []
  const matches = matchesQuery.data ?? []
  const latestItem = neededItems[0]
  const stats = [
    {
      label: '등록 물품',
      value: neededItemsQuery.isSuccess ? neededItems.length : '–',
    },
    {
      label: '진행 중',
      value: matchesQuery.isSuccess
        ? matches.filter((match) => ['TRADING', 'RESERVED'].includes(match.status)).length
        : '–',
    },
    {
      label: '수령 완료',
      value: matchesQuery.isSuccess
        ? matches.filter((match) => match.status === 'COMPLETED').length
        : '–',
    },
  ]
  const errorMessage = neededItemsQuery.error
    ? getNeededItemErrorMessage(
        neededItemsQuery.error,
        '등록한 필요 물품을 불러오지 못했어요.',
      )
    : matchesQuery.error
      ? matchErrorMessage(matchesQuery.error)
      : ''

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 shrink-0 items-center justify-between px-5">
        <img
          src={wordmarkLogo}
          alt="IT:SSUM"
          className="h-[22.72px] w-[119px]"
        />
        <Link
          to={ROUTES.organization.notifications}
          aria-label="알림"
          className="flex size-10 items-center justify-center rounded-full text-primary-700 transition-colors hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
        >
          <Bell aria-hidden size={24} strokeWidth={2} />
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-8 pt-2">
        <section aria-labelledby="organization-home-title">
          <h1
            id="organization-home-title"
            className="text-xl font-bold leading-7 text-neutral-900"
          >
            우리 기관의 물품 지원 현황
          </h1>
          <p className="mt-2 typography-body-2 text-neutral-600">
            필요한 물품과 진행 상황을 한눈에 확인해요.
          </p>
        </section>

        <section className="mt-3 rounded-card bg-primary-200 p-4">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="typography-title-1 text-neutral-900">
                필요한 물품을
                <br />
                쉽고 빠르게 찾아요
              </h2>
              <p className="mt-1 typography-label-2 text-neutral-700">
                새로운 물품을 확인해 보세요.
              </p>
            </div>
            <img
              src={boxHappyImage}
              alt=""
              className="size-[76px] shrink-0 object-contain"
            />
          </div>
          <Button
            className="mt-3 w-full"
            onClick={() => navigate(ROUTES.organization.needNew)}
          >
            필요 물품 등록하기
          </Button>
        </section>

        <section
          className="mt-[18px] rounded-card border border-neutral-200 bg-white p-4"
          aria-label="물품 지원 통계"
        >
          <dl className="grid grid-cols-3 gap-2 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="typography-heading-2 text-primary-700">
                  {stat.value}
                </dt>
                <dd className="mt-1 typography-label-2 text-neutral-700">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {errorMessage ? (
          <section
            role="alert"
            className="mt-3 rounded-control border border-error/30 bg-error-bg px-4 py-3"
          >
            <p className="typography-body-2 text-error">{errorMessage}</p>
            <Button
              variant="secondary"
              className="mt-3 h-10"
              onClick={() => {
                if (neededItemsQuery.isError) void neededItemsQuery.refetch()
                if (matchesQuery.isError) void matchesQuery.refetch()
              }}
            >
              다시 시도
            </Button>
          </section>
        ) : null}

        <section className="mt-7" aria-labelledby="registered-items-title">
          <h2
            id="registered-items-title"
            className="typography-title-2 text-neutral-900"
          >
            등록한 물품
          </h2>
          {neededItemsQuery.isPending ? (
            <div className="mt-3 rounded-card border border-neutral-200 bg-white px-5 py-10 text-center">
              <p role="status" className="typography-body-2 text-neutral-700">
                등록한 물품을 불러오는 중이에요.
              </p>
            </div>
          ) : neededItemsQuery.isError ? (
            <div className="mt-3 rounded-card border border-neutral-200 bg-white px-5 py-10 text-center">
              <p className="typography-body-2 text-neutral-700">
                등록한 물품을 표시하지 못했어요.
              </p>
            </div>
          ) : latestItem ? (
            <ItemRow
              title={`${latestItem.itemName} ${latestItem.requiredQuantity}${latestItem.unit}`}
              description={
                <>
                  <p>
                    {latestItem.categoryName} · {neededItemStatusLabels[latestItem.status]}
                  </p>
                  <p>
                    예약 {latestItem.reservedQuantity}{latestItem.unit} · 수령 {latestItem.receivedQuantity}{latestItem.unit} · 추가 필요 {latestItem.availableQuantity}{latestItem.unit}
                  </p>
                </>
              }
              imageSrc={latestItem.referenceImageUrl ?? undefined}
              icon={latestItem.categoryName.includes('도서')
                ? <BookOpen aria-hidden size={30} strokeWidth={2} />
                : <Package aria-hidden size={30} strokeWidth={2} />}
              thumbnailClassName="h-[82px] w-[72px] rounded-input !bg-primary-100"
              className="mt-3 min-h-[120px] gap-4 p-4 shadow-none"
              titleClassName="typography-title-3"
              descriptionClassName="typography-body-2 line-clamp-none"
              onClick={() => navigate(routePath.organizationNeedDetail(String(latestItem.neededItemId)))}
            />
          ) : (
            <div className="mt-3 rounded-card border border-neutral-200 bg-white px-5 py-8 text-center">
              <ClipboardList aria-hidden size={36} className="mx-auto text-neutral-500" />
              <p className="mt-3 typography-body-2 text-neutral-700">
                아직 등록한 필요 물품이 없어요.
              </p>
              <Button
                variant="secondary"
                className="mt-4 h-10"
                onClick={() => navigate(ROUTES.organization.needNew)}
              >
                필요 물품 등록하기
              </Button>
            </div>
          )}
        </section>
      </main>

      <BottomNavigation
        audience="organization"
        activeItem="home"
        className="sticky bottom-0 shrink-0"
      />
    </div>
  )
}
