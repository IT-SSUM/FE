import { Bell, BookOpen, PackageCheck, Plus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { Button } from '@/components/common/Button/Button'
import { ItemRow } from '@/components/item/ItemRow/ItemRow'
import { ROUTES, routePath } from '@/routes/paths'
import boxHappyImage from '@/assets/images/mascot/box-happy.png'
import wordmarkLogo from '@/assets/logo/itssum-wordmark.svg'

const organizationHomeMock = {
  organizationName: 'A지역아동센터',
  stats: [
    { label: '필요 물품', value: 3 },
    { label: '진행 거래', value: 2 },
    { label: '수령 완료', value: 8 },
  ],
  activeNeed: {
    id: 'stationery-30',
    title: '학용품 30세트',
    description: '등록 10월 10일 · 이번 주까지 필요',
    status: 'progress' as const,
  },
  recommendedDonations: [
    {
      id: 'towels-30',
      title: '수건 30장',
      donor: '최윤서',
      distance: '1.8km',
      condition: '상태 중',
    },
    {
      id: 'books-12',
      title: '아동 도서 12권',
      donor: '김나눔',
      distance: '2.4km',
      condition: '상태 중',
    },
  ],
}

export function OrganizationHomePage() {
  const navigate = useNavigate()

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

      <main className="flex-1 overflow-y-auto px-5 pb-8 pt-2">
        <section>
          <h1 className="typography-heading-2 text-neutral-900">
            {organizationHomeMock.organizationName}
          </h1>
          <p className="mt-2 typography-body-2 text-neutral-700">
            필요한 물품을 등록하고 가까운 기부를 확인해요.
          </p>
        </section>

        <section className="mt-3 rounded-card bg-primary-200 p-4">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="typography-title-1 text-neutral-900">
                필요한 물품을
                <br />
                빠르게 알려주세요
              </h2>
              <p className="mt-1 typography-label-2 text-neutral-700">
                기부자에게 필요한 물품이 공개돼요.
              </p>
            </div>
            <img
              src={boxHappyImage}
              alt=""
              className="size-[88px] shrink-0 object-contain"
            />
          </div>
          <Button
            className="mt-3 w-full gap-2"
            onClick={() => navigate(ROUTES.organization.needNew)}
          >
            <Plus aria-hidden size={18} strokeWidth={2} />
            필요 물품 등록하기
          </Button>
        </section>

        <section className="mt-3 rounded-card border border-neutral-200 bg-white p-4">
          <dl className="grid grid-cols-3 gap-2 text-center">
            {organizationHomeMock.stats.map((stat) => (
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

        <section className="mt-5">
          <div className="flex items-center justify-between">
            <h2 className="typography-title-2 text-neutral-900">
              진행 중 모집
            </h2>
            <Link
              to={routePath.organizationNeedDetail(organizationHomeMock.activeNeed.id)}
              className="typography-label-2 text-primary-700"
            >
              더보기
            </Link>
          </div>
          <ItemRow
            title={organizationHomeMock.activeNeed.title}
            description={organizationHomeMock.activeNeed.description}
            status={organizationHomeMock.activeNeed.status}
            statusType="badge"
            icon={<BookOpen aria-hidden size={32} strokeWidth={2} />}
            thumbnailClassName="h-[82px] w-[72px] rounded-input !bg-error-bg"
            className="mt-3 h-[126px] gap-4 p-4 shadow-none"
            titleClassName="typography-title-2"
            descriptionClassName="typography-label-2"
            onClick={() =>
              navigate(routePath.organizationNeedDetail(organizationHomeMock.activeNeed.id))
            }
          />
        </section>

        <section className="mt-5">
          <div className="flex items-center justify-between">
            <h2 className="typography-title-2 text-neutral-900">
              추천 기부 물품
            </h2>
            <Link
              to={ROUTES.organization.donationList}
              className="typography-label-2 text-primary-700"
            >
              더보기
            </Link>
          </div>
          <div className="mt-3 space-y-3">
            {organizationHomeMock.recommendedDonations.map((item) => (
              <ItemRow
                key={item.id}
                title={item.title}
                description={
                  <>
                    <p>
                      {item.donor} · {item.distance}
                    </p>
                    <p>{item.condition}</p>
                  </>
                }
                icon={<PackageCheck aria-hidden size={32} strokeWidth={2} />}
                thumbnailClassName="h-[82px] w-[72px] rounded-input !bg-primary-100"
                className="h-[126px] gap-4 p-4 shadow-none"
                titleClassName="typography-title-2"
                descriptionClassName="typography-body-2 line-clamp-none"
                onClick={() => navigate(routePath.organizationDonationDetail(item.id))}
              />
            ))}
          </div>
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
