import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Package,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

import {
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  getUserErrorMessage,
} from '@/apis/users'

import boxHappyImage from '@/assets/images/mascot/box-happy.png'

import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { Button } from '@/components/common/Button/Button'
import { Dialog } from '@/components/common/Dialog/Dialog'
import { Toast } from '@/components/common/Toast/Toast'

import {
  useLogout,
} from '@/hooks/auth/useLogout'

import {
  useWithdrawAccount,
} from '@/hooks/auth/useWithdrawAccount'

import {
  useDonorDonationItemsQuery,
} from '@/hooks/queries/useDonorDonationItemsQuery'

import {
  useDonorProfileQuery,
} from '@/hooks/queries/useDonorProfileQuery'

import {
  useMatchesQuery,
} from '@/hooks/queries/useMatchesQuery'

import {
  ROUTES,
} from '@/routes/paths'

const donationMenus:
  MenuItem[] = [
    {
      title:
        '등록한 물품 관리',

      to:
        ROUTES.donor
          .myItems,

      icon: (
        <Package
          aria-hidden
          size={22}
          strokeWidth={2}
        />
      ),
    },

    {
      title:
        '보낸 제안 / 받은 요청',

      to:
        ROUTES.donor
          .myRequests,

      icon: (
        <ClipboardList
          aria-hidden
          size={22}
          strokeWidth={2}
        />
      ),
    },

    {
      title:
        '기관별 거래 내역',

      to:
        ROUTES.donor
          .myHistory,

      icon: (
        <CalendarDays
          aria-hidden
          size={22}
          strokeWidth={2}
        />
      ),
    },
  ]

const accountMenus:
  MenuItem[] = [
    {
      title:
        '회원정보 수정',

      to:
        ROUTES.donor
          .myProfile,

      icon: (
        <UserRound
          aria-hidden
          size={22}
          strokeWidth={2}
        />
      ),
    },

    {
      title:
        '회원 탈퇴',

      action:
        'withdraw',

      icon: (
        <ShieldCheck
          aria-hidden
          size={22}
          strokeWidth={2}
        />
      ),
    },
  ]

const ACTIVE_STATUSES =
  new Set([
    'PENDING',
    'TRADING',
    'RESERVED',
  ])

export function DonorMyPage() {
  const navigate =
    useNavigate()

  const profileQuery =
    useDonorProfileQuery()

  const donationItemsQuery =
    useDonorDonationItemsQuery()

  const matchesQuery =
    useMatchesQuery()

  const [
    logoutOpen,
    setLogoutOpen,
  ] =
    useState(false)

  const [
    withdrawOpen,
    setWithdrawOpen,
  ] =
    useState(false)

  const [
    withdrawError,
    setWithdrawError,
  ] =
    useState<
      string | null
    >(null)

  const {
    logout,
    isLoggingOut,
  } =
    useLogout()

  const {
    mutateAsync:
      withdrawAccount,

    isPending:
      isWithdrawing,
  } =
    useWithdrawAccount()

  useEffect(() => {
    if (
      !withdrawError
    ) {
      return
    }

    const timer =
      window.setTimeout(
        () =>
          setWithdrawError(
            null,
          ),

        4000,
      )

    return () =>
      window.clearTimeout(
        timer,
      )
  }, [
    withdrawError,
  ])

  const matches =
    matchesQuery.data ??
    []

  const donationItems =
    donationItemsQuery.data ??
    []

  const activeCount =
    matches.filter(
      (match) =>
        ACTIVE_STATUSES.has(
          match.status,
        ),
    ).length

  const completeCount =
    matches.filter(
      (match) =>
        match.status ===
        'COMPLETED',
    ).length

  const profileName =
    profileQuery.data
      ?.name ??
    '기부자'

  const regionName =
    profileQuery.data
      ?.regionName ??
    '지역 정보 없음'

  const handleWithdraw =
    async () => {
      if (
        isWithdrawing
      ) {
        return
      }

      setWithdrawError(
        null,
      )

      try {
        await withdrawAccount()
      } catch (
        error
      ) {
        setWithdrawOpen(
          false,
        )

        setWithdrawError(
          getUserErrorMessage(
            error,

            '회원 탈퇴를 처리하지 못했어요. 잠시 후 다시 시도해 주세요.',
          ),
        )
      }
    }

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 items-center gap-3 bg-surface-canvas px-5">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() =>
            navigate(-1)
          }
          className="flex size-5 shrink-0 items-center justify-center text-primary-700"
        >
          <ChevronLeft
            aria-hidden
            size={20}
            strokeWidth={2}
          />
        </button>

        <h1 className="typography-title-3 text-neutral-900">
          마이페이지
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-8 pt-2">
        <section className="flex min-h-24 items-center gap-3 rounded-card bg-primary-100 px-4 py-3">
          <div className="min-w-0 flex-1">
            <h2 className="truncate whitespace-nowrap typography-title-2 text-neutral-900">
              {
                profileName
              }
              님 ·{' '}
              {
                regionName
              }
            </h2>

            <p className="mt-2 typography-label-2 text-neutral-700">
              기부자 · 등록{' '}
              {donationItemsQuery.isPending
                ? '—'
                : donationItems.length}{' '}
              · 진행{' '}
              {matchesQuery.isPending
                ? '—'
                : activeCount}{' '}
              · 완료{' '}
              {matchesQuery.isPending
                ? '—'
                : completeCount}
            </p>
          </div>

          <img
            src={
              boxHappyImage
            }
            alt=""
            className="size-20 shrink-0 object-contain"
          />
        </section>

        {profileQuery.isError ? (
          <p
            role="alert"
            className="mt-3 typography-label-2 text-error"
          >
            회원정보를
            불러오지 못했어요.
          </p>
        ) : null}

        <MenuSection
          title="나의 기부"
          items={
            donationMenus
          }
        />

        <MenuSection
          title="계정 관리"
          items={
            accountMenus
          }
          onAction={(
            action,
          ) => {
            if (
              action ===
              'withdraw'
            ) {
              setWithdrawOpen(
                true,
              )
            }
          }}
        />
      </main>

      <div className="shrink-0 px-5 pb-9 pt-2">
        <Button
          variant="secondary"
          className="w-full border-neutral-400 text-neutral-700 hover:bg-neutral-100"
          onClick={() =>
            setLogoutOpen(
              true,
            )
          }
        >
          로그아웃
        </Button>
      </div>

      <BottomNavigation
        activeItem="my"
        className="sticky bottom-0 shrink-0"
      />

      <Dialog
        open={
          withdrawOpen
        }
        title="회원 탈퇴를 진행할까요?"
        description="탈퇴하면 모든 기기에서 로그아웃되며 계정 정보가 삭제됩니다."
        confirmText={
          isWithdrawing
            ? '탈퇴 처리 중...'
            : '탈퇴하기'
        }
        cancelText="취소"
        confirmVariant="danger"
        confirmDisabled={
          isWithdrawing
        }
        cancelDisabled={
          isWithdrawing
        }
        className="text-center"
        onConfirm={() =>
          void handleWithdraw()
        }
        onCancel={() => {
          if (
            !isWithdrawing
          ) {
            setWithdrawOpen(
              false,
            )
          }
        }}
      />

      <Dialog
        open={
          logoutOpen
        }
        title="로그아웃할까요?"
        description="다음에 이용할 때 다시 로그인해 주세요."
        confirmText={
          isLoggingOut
            ? '로그아웃 중...'
            : '로그아웃'
        }
        cancelText="취소"
        className="text-center"
        onConfirm={() =>
          void logout()
        }
        onCancel={() => {
          if (
            !isLoggingOut
          ) {
            setLogoutOpen(
              false,
            )
          }
        }}
      />

      {withdrawError ? (
        <div className="pointer-events-none fixed left-1/2 top-4 z-300 w-full max-w-[393px] -translate-x-1/2 px-5">
          <Toast
            variant="error"
            title="회원 탈퇴를 진행할 수 없어요"
            description={
              withdrawError
            }
            className="shadow-[0_12px_32px_rgb(18_61_49/18%)]"
          />
        </div>
      ) : null}
    </div>
  )
}

type MenuItem = {
  title: string

  to?: string

  action?:
    'withdraw'

  icon:
    ReactNode
}

type MenuSectionProps = {
  title: string

  items:
    MenuItem[]

  onAction?: (
    action:
      'withdraw',
  ) => void
}

function MenuSection({
  title,
  items,
  onAction,
}: MenuSectionProps) {
  const navigate =
    useNavigate()

  return (
    <section className="mt-5">
      <h2 className="typography-label-2 text-neutral-700">
        {title}
      </h2>

      <div className="mt-2 overflow-hidden rounded-card border border-neutral-200 bg-white">
        {items.map(
          (item) => (
            <button
              key={
                item.title
              }
              type="button"
              onClick={() => {
                if (
                  item.to
                ) {
                  navigate(
                    item.to,
                  )
                } else if (
                  item.action
                ) {
                  onAction?.(
                    item.action,
                  )
                }
              }}
              className="flex h-[60px] w-full items-center gap-3 bg-white px-4 text-left transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-primary-700"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-input bg-primary-100 text-primary-700">
                {
                  item.icon
                }
              </span>

              <span className="min-w-0 flex-1 truncate typography-title-3 text-neutral-900">
                {
                  item.title
                }
              </span>

              <ChevronRight
                aria-hidden
                size={20}
                strokeWidth={2}
                className="shrink-0 text-primary-700"
              />
            </button>
          ),
        )}
      </div>
    </section>
  )
}