import { Bell, BookOpen } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { Button } from '@/components/common/Button/Button'
import { ItemRow } from '@/components/item/ItemRow/ItemRow'
import { ROUTES, routePath } from '@/routes/paths'
import boxHappyImage from '@/assets/images/mascot/box-happy.png'
import wordmarkLogo from '@/assets/logo/itssum-wordmark.svg'

const organizationHomeMock = {
  stats: [
    { label: '등록 물품', value: 4 },
    { label: '진행 중', value: 4 },
    { label: '수령 완료', value: 5 },
  ],
  registeredItem: {
    id: 'stationery-30',
    title: '학용품 30세트',
    organization: 'A지역아동센터',
    distance: '2.1km',
    dueText: '이번 주까지 필요',
  },
}

export function OrganizationHomePage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 shrink-0 items-center justify-between px-5">
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
        <section aria-labelledby="organization-home-title">
          <h1
            id="organization-home-title"
            className="text-[22px] font-bold leading-[30px] text-neutral-900"
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

        <section className="mt-7" aria-labelledby="registered-items-title">
          <h2
            id="registered-items-title"
            className="typography-title-2 text-neutral-900"
          >
            등록한 물품
          </h2>
          <ItemRow
            title={organizationHomeMock.registeredItem.title}
            description={
              <>
                <p>
                  {organizationHomeMock.registeredItem.organization} ·{' '}
                  {organizationHomeMock.registeredItem.distance}
                </p>
                <p>{organizationHomeMock.registeredItem.dueText}</p>
              </>
            }
            icon={<BookOpen aria-hidden size={30} strokeWidth={2} />}
            thumbnailClassName="h-[82px] w-[72px] rounded-input !bg-primary-100"
            className="mt-3 h-[120px] gap-4 p-4 shadow-none"
            titleClassName="typography-title-3"
            descriptionClassName="typography-body-2 line-clamp-none"
            onClick={() =>
              navigate(
                routePath.organizationNeedDetail(
                  organizationHomeMock.registeredItem.id,
                ),
              )
            }
          />
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
