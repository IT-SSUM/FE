import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Package,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { Button } from '@/components/common/Button/Button'
import { ROUTES } from '@/routes/paths'
import boxHappyImage from '@/assets/images/mascot/box-happy.png'

const organizationMenus = [
  {
    title: '필요 물품 관리',
    to: ROUTES.organization.needManage,
    icon: <Package aria-hidden size={20} strokeWidth={2} />,
  },
  {
    title: '받은 제안 / 보낸 요청',
    to: `${ROUTES.organization.donationList}?view=requests`,
    icon: <ClipboardList aria-hidden size={20} strokeWidth={2} />,
  },
  {
    title: '거래 현황',
    to: `${ROUTES.chatList}?audience=organization`,
    icon: <CalendarDays aria-hidden size={20} strokeWidth={2} />,
  },
]

const accountMenus = [
  {
    title: '기관 정보 수정',
    icon: <UserRound aria-hidden size={20} strokeWidth={2} />,
  },
  {
    title: '회원 탈퇴',
    icon: <ShieldCheck aria-hidden size={20} strokeWidth={2} />,
  },
]

export function OrganizationMyPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 items-center gap-3 bg-surface-canvas px-5">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-5 shrink-0 items-center justify-center text-primary-700"
        >
          <ChevronLeft aria-hidden size={20} strokeWidth={2} />
        </button>
        <h1 className="typography-title-3 text-neutral-900">마이페이지</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-8 pt-2">
        <section className="flex h-24 items-center gap-3 rounded-card bg-primary-100 px-4 py-3">
          <div className="min-w-0 flex-1">
            <h2 className="truncate whitespace-nowrap typography-title-1 text-neutral-900">
              기관 A · 서울 구로구
            </h2>
            <p className="mt-2 typography-label-2 text-neutral-700">
              기관 · 등록 4 · 진행 3 · 수령 7
            </p>
          </div>
          <img
            src={boxHappyImage}
            alt=""
            className="size-20 shrink-0 object-contain"
          />
        </section>

        <MenuSection title="우리 기관의 물품 지원" items={organizationMenus} />
        <MenuSection title="계정 관리" items={accountMenus} />
      </main>

      <div className="shrink-0 px-5 pb-7 pt-2">
        <Button
          variant="secondary"
          className="w-full border-neutral-400 text-neutral-700 hover:bg-neutral-100"
          style={{ height: 46 }}
          onClick={() => navigate(ROUTES.start)}
        >
          로그아웃
        </Button>
      </div>

      <BottomNavigation
        audience="organization"
        activeItem="my"
        className="sticky bottom-0 shrink-0"
      />
    </div>
  )
}

type MenuItem = {
  title: string
  to?: string
  icon: ReactNode
}

type MenuSectionProps = {
  title: string
  items: MenuItem[]
}

function MenuSection({ title, items }: MenuSectionProps) {
  const navigate = useNavigate()

  return (
    <section className="mt-5">
      <h2 className="typography-label-2 text-neutral-700">{title}</h2>
      <div className="mt-2 overflow-hidden rounded-card border border-neutral-200 bg-white">
        {items.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => item.to && navigate(item.to)}
            className="flex h-[60px] w-full items-center gap-3 bg-white px-4 text-left transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-primary-700"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-input bg-primary-100 text-primary-700">
              {item.icon}
            </span>
            <span className="min-w-0 flex-1 truncate text-base font-semibold leading-6 text-neutral-900">
              {item.title}
            </span>
            <ChevronRight
              aria-hidden
              size={20}
              strokeWidth={2}
              className="shrink-0 text-primary-700"
            />
          </button>
        ))}
      </div>
    </section>
  )
}
