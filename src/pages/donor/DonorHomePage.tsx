import { Bell, BookOpen, Package } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { Button } from '@/components/common/Button/Button'
import { ItemRow } from '@/components/item/ItemRow/ItemRow'
import { ROUTES, routePath } from '@/routes/paths'
import boxHappyImage from '@/assets/images/mascot/box-happy.png'
import { useDonorStore } from '@/features/donor/store'
import { unitOf, statsOf, availableQuantity, titleOf } from '@/features/donor/model'
import { needItems } from './needSearch'
import wordmarkLogo from '@/assets/logo/itssum-wordmark.svg'

export function DonorHomePage() {
  const navigate = useNavigate()
  const { donations, profile } = useDonorStore((state) => state.data)
  const stats = statsOf(donations)
  const active = donations.find((item) => item.status !== 'complete')
  const donorHomeMock = {
    userName: profile.name,
    stats: [{ label: '등록 물품', value: stats.total }, { label: '진행 중', value: stats.active }, { label: '기부 완료', value: stats.complete }],
    activeDonation: { title: active ? titleOf(active) : '진행 중인 나눔이 없어요', description: active ? `예약 ${active.reserved}${unitOf(active.name)} · 남은 ${availableQuantity(active)}${unitOf(active.name)}` : '물품을 등록해 나눔을 시작해 보세요.', status: active?.reserved ? 'reserved' as const : 'trading' as const },
    neededItems: needItems.slice(0, 2).map((item) => ({ ...item, distance: item.location, dueText: `희망 상태 ${item.condition}` })),
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 items-center justify-between bg-surface-canvas px-5">
        <img
          src={wordmarkLogo}
          alt="IT:SSUM"
          className="h-[22.72px] w-[119px]"
        />
        <Link
          to={ROUTES.notifications}
          aria-label="알림"
          className="flex size-10 items-center justify-center rounded-full text-primary-700 transition-colors hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
        >
          <Bell aria-hidden size={24} strokeWidth={2} />
        </Link>
      </header>

      <main className="flex-1 px-5 pb-8 pt-2">
        <p className="mb-3 typography-label-2 text-neutral-700">데모 모드 · 현재 브라우저에만 저장됩니다.</p>
        <section aria-labelledby="donor-home-greeting">
          <h1
            id="donor-home-greeting"
            className="typography-heading-2 text-neutral-900"
          >
            안녕하세요, {donorHomeMock.userName}님!
          </h1>
          <p className="mt-2 typography-body-2 text-neutral-700">
            오늘도 나눔을 이어가 볼까요?
          </p>
        </section>

        <section className="mt-3 rounded-card bg-primary-200 p-4">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="typography-title-1 text-neutral-900">
                작은 나눔이
                <br />큰 기쁨이 돼요
              </h2>
              <p className="mt-1 typography-label-2 text-neutral-700">
                남은 물품을 필요한 기관에 전해요.
              </p>
            </div>
            <img
              src={boxHappyImage}
              alt=""
              className="size-[88px] shrink-0 object-contain"
            />
          </div>
          <Button
            className="mt-3 w-full"
            onClick={() => navigate(ROUTES.donor.donationNew)}
          >
            기부 물품 등록하기
          </Button>
        </section>

        <section className="mt-3" aria-labelledby="donation-summary-title">
          <div className="flex items-start justify-between gap-4">
            <h2
              id="donation-summary-title"
              className="typography-title-3 text-neutral-900"
            >
              등록한 물품 · 남은 수량
            </h2>
            <Link
              to={ROUTES.donor.myItems}
              className="shrink-0 typography-label-2 text-primary-700"
            >
              진행 중 나눔 보기
            </Link>
          </div>

          <div className="mt-3 rounded-card border border-neutral-200 bg-white p-4">
            <dl className="grid grid-cols-3 gap-2 text-center">
              {donorHomeMock.stats.map((stat) => (
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
          </div>
        </section>

        <section className="mt-5" aria-labelledby="active-donation-title">
          <div className="flex items-center justify-between">
            <h2
              id="active-donation-title"
              className="typography-title-2 text-neutral-900"
            >
              진행 중 나눔
            </h2>
            <Link
              to={ROUTES.donor.myItems}
              className="typography-label-2 text-primary-700"
            >
              더보기
            </Link>
          </div>

          <ItemRow
            title={donorHomeMock.activeDonation.title}
            description={donorHomeMock.activeDonation.description}
            status={active ? donorHomeMock.activeDonation.status : undefined}
            statusPlacement="bottom"
            icon={<Package aria-hidden size={32} strokeWidth={2} />}
            thumbnailClassName="h-[82px] w-[72px] rounded-input !bg-error-bg"
            className="mt-3 h-[126px] gap-4 p-4 shadow-none"
            titleClassName="typography-title-2"
            descriptionClassName="typography-label-2"
            onClick={() => navigate(active ? routePath.donorDonationDetail(active.id) : ROUTES.donor.donationNew)}
          />
        </section>

        <section className="mt-5" aria-labelledby="needed-items-title">
          <div className="flex items-center justify-between">
            <h2
              id="needed-items-title"
              className="typography-title-2 text-neutral-900"
            >
              필요 물품 둘러보기
            </h2>
            <Link
              to={ROUTES.donor.needList}
              className="typography-label-2 text-primary-700"
            >
              더보기
            </Link>
          </div>

          <div className="mt-3 space-y-3">
            {donorHomeMock.neededItems.map((item) => (
              <ItemRow
                key={item.id}
                title={item.title}
                description={
                  <>
                    <p>
                      {item.organization} · {item.distance}
                    </p>
                    <p>{item.dueText}</p>
                  </>
                }
                icon={<BookOpen aria-hidden size={32} strokeWidth={2} />}
                thumbnailClassName="h-[82px] w-[72px] rounded-input !bg-error-bg"
                className="h-[126px] gap-4 p-4 shadow-none"
                titleClassName="typography-title-2"
                descriptionClassName="typography-body-2 line-clamp-none"
                onClick={() => navigate(routePath.donorNeedDetail(item.id))}
              />
            ))}
          </div>
        </section>
      </main>

      <BottomNavigation activeItem="home" className="sticky bottom-0 shrink-0" />
    </div>
  )
}
