import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Package,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { Button } from '@/components/common/Button/Button'
import { Dialog } from '@/components/common/Dialog/Dialog'
import { ROUTES } from '@/routes/paths'
import boxHappyImage from '@/assets/images/mascot/box-happy.png'
import { useLogout } from '@/hooks/auth/useLogout'
import { useOrganizationProfile } from '@/hooks/organization/useOrganizationProfile'

const organizationMenus = [
  {
    title: '필요 물품 관리',
    to: ROUTES.organization.needManage,
    icon: <Package aria-hidden size={20} strokeWidth={2} />,
  },
  {
    title: '받은 제안 / 보낸 요청',
    to: ROUTES.organization.offerList,
    icon: <ClipboardList aria-hidden size={20} strokeWidth={2} />,
  },
  {
    title: '거래 현황',
    to: ROUTES.organization.tradeStatus,
    icon: <CalendarDays aria-hidden size={20} strokeWidth={2} />,
  },
]

const accountMenus = [
  {
    title: '기관 정보 수정',
    to: ROUTES.organization.myProfile,
    icon: <UserRound aria-hidden size={20} strokeWidth={2} />,
  },
  {
    title: '회원 탈퇴',
    action: 'withdraw' as const,
    icon: <ShieldCheck aria-hidden size={20} strokeWidth={2} />,
  },
]

function formatOrganizationRegion(address: string) {
  const parts = address.replace(/^\[\d+]\s*/, '').trim().split(/\s+/)
  const districtIndex = parts.findIndex((part) => /(?:구|군)$/.test(part))
  if (districtIndex >= 0) return parts.slice(0, districtIndex + 1).join(' ')

  const cityIndex = parts.findIndex((part, index) => index > 0 && /시$/.test(part))
  if (cityIndex >= 0) return parts.slice(0, cityIndex + 1).join(' ')
  return parts.slice(0, 2).join(' ')
}

export function OrganizationMyPage() {
  const navigate = useNavigate()
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const { logout, isLoggingOut } = useLogout()
  const { data: profile, isLoading, isError, refetch } = useOrganizationProfile()

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
        <section className="flex min-h-[112px] items-center gap-3 rounded-card bg-primary-100 px-4 py-4">
          <div className="min-w-0 flex-1">
            {isError ? (
              <div role="alert">
                <h2 className="typography-title-3 text-error">기관 정보를 불러오지 못했어요.</h2>
                <button type="button" className="mt-2 typography-label-2 text-primary-700 underline underline-offset-2" onClick={() => void refetch()}>다시 시도</button>
              </div>
            ) : (
              <>
                <h2 className="break-keep text-[17px] font-bold leading-6 text-neutral-900">
                  {isLoading
                    ? '기관 정보를 불러오는 중...'
                    : `${profile?.name} · ${formatOrganizationRegion(profile?.address ?? '')}`}
                </h2>
                <p className="mt-1.5 typography-label-2 text-neutral-700">
                  {isLoading
                    ? '잠시만 기다려 주세요.'
                    : `기관 · ${profile?.verificationStatus === 'VERIFIED' ? '사업자 확인 완료' : '사업자 확인 필요'}`}
                </p>
              </>
            )}
          </div>
          <img
            src={boxHappyImage}
            alt=""
            className="size-16 shrink-0 object-contain"
          />
        </section>

        <MenuSection title="우리 기관의 물품 지원" items={organizationMenus} />
        <MenuSection
          title="계정 관리"
          items={accountMenus}
          onAction={(action) => {
            if (action === 'withdraw') setWithdrawOpen(true)
          }}
        />
      </main>

      <div className="shrink-0 px-5 pb-7 pt-2">
        <Button
          variant="secondary"
          className="w-full border-neutral-400 text-neutral-700 hover:bg-neutral-100"
          style={{ height: 46 }}
          onClick={() => setLogoutOpen(true)}
        >
          로그아웃
        </Button>
      </div>

      <BottomNavigation
        audience="organization"
        activeItem="my"
        className="sticky bottom-0 shrink-0"
      />

      <Dialog
        open={withdrawOpen}
        title="회원 탈퇴를 진행할까요?"
        description="다음에 다시 만나요."
        confirmText="탈퇴하기"
        cancelText="취소"
        confirmVariant="danger"
        className="text-center"
        onConfirm={() => navigate(ROUTES.start)}
        onCancel={() => setWithdrawOpen(false)}
      />
      <Dialog
        open={logoutOpen}
        title="로그아웃할까요?"
        description="다음에 이용할 때 다시 로그인해 주세요."
        confirmText={isLoggingOut ? '로그아웃 중...' : '로그아웃'}
        cancelText="취소"
        className="text-center"
        onConfirm={() => void logout()}
        onCancel={() => {
          if (!isLoggingOut) setLogoutOpen(false)
        }}
      />
    </div>
  )
}

type MenuItem = {
  title: string
  to?: string
  action?: 'withdraw'
  icon: ReactNode
}

type MenuSectionProps = {
  title: string
  items: MenuItem[]
  onAction?: (action: 'withdraw') => void
}

function MenuSection({ title, items, onAction }: MenuSectionProps) {
  const navigate = useNavigate()

  return (
    <section className="mt-5">
      <h2 className="typography-label-2 text-neutral-700">{title}</h2>
      <div className="mt-2 overflow-hidden rounded-card border border-neutral-200 bg-white">
        {items.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => {
              if (item.to) navigate(item.to)
              else if (item.action) onAction?.(item.action)
            }}
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
