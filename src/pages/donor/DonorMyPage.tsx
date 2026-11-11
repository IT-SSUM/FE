import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Package,
  UserRound,
  UserX,
} from 'lucide-react'

import {
  useState,
  type ReactNode,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { Button } from '@/components/common/Button/Button'
import { Dialog } from '@/components/common/Dialog/Dialog'

import { ROUTES } from '@/routes/paths'

import { useDonorProfileQuery } from '@/hooks/queries/useDonorProfileQuery'
import { useDonorDonationItemsQuery } from '@/hooks/queries/useDonorDonationItemsQuery'
import { useMatchesQuery } from '@/hooks/queries/useMatchesQuery'
import { useLogout } from '@/hooks/auth/useLogout'

import boxHappyImage from '@/assets/images/mascot/box-happy.png'

const ACTIVE_STATUSES = new Set([
  'PENDING',
  'TRADING',
  'RESERVED',
])

export function DonorMyPage() {
  const navigate = useNavigate()

  const profileQuery = useDonorProfileQuery()
  const donationItemsQuery = useDonorDonationItemsQuery()
  const matchesQuery = useMatchesQuery()

  const [logoutOpen, setLogoutOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)

  const {
    logout,
    isLoggingOut,
  } = useLogout()

  const matches =
    matchesQuery.data ?? []

  const donationItems =
    donationItemsQuery.data ?? []

  const activeCount =
    matches.filter((match) =>
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
    profileQuery.data?.name ??
    '기부자'

  const regionName =
    profileQuery.data?.regionName ??
    '지역 정보 없음'

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 shrink-0 items-center gap-3 bg-surface-canvas px-5">
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

      <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-2">
        <section className="flex min-h-24 items-center gap-6 rounded-card bg-primary-100 px-4 py-3">
          <div className="min-w-0 flex-1">
            <h2 className="truncate typography-title-1 text-neutral-900">
              {profileName}님 · {regionName}
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
            src={boxHappyImage}
            alt=""
            className="size-20 shrink-0 object-contain"
          />
        </section>

        {profileQuery.isError ? (
          <p
            role="alert"
            className="typography-label-2 text-error"
          >
            회원정보를 불러오지 못했어요.
          </p>
        ) : null}

        <MenuSection
          title="나의 기부"
          items={[
            {
              title: '등록한 물품 관리',
              icon: (
                <Package
                  aria-hidden
                  size={22}
                />
              ),
              onClick: () =>
                navigate(
                  ROUTES.donor.myItems,
                ),
            },

            {
              title: '보낸 제안 / 받은 요청',
              icon: (
                <ClipboardList
                  aria-hidden
                  size={22}
                />
              ),
              onClick: () =>
                navigate(
                  ROUTES.donor.myRequests,
                ),
            },

            {
              title: '기관별 거래 내역',
              icon: (
                <CalendarDays
                  aria-hidden
                  size={22}
                />
              ),
              onClick: () =>
                navigate(
                  ROUTES.donor.myHistory,
                ),
            },
          ]}
        />

        <MenuSection
          title="계정 관리"
          items={[
            {
              title: '회원정보 수정',
              icon: (
                <UserRound
                  aria-hidden
                  size={22}
                />
              ),
              onClick: () =>
                navigate(
                  ROUTES.donor.myProfile,
                ),
            },

            {
              title: '회원 탈퇴',
              icon: (
                <UserX
                  aria-hidden
                  size={22}
                />
              ),
              onClick: () =>
                setWithdrawOpen(true),
            },
          ]}
        />
      </main>

      <div className="shrink-0 px-5 pb-3 pt-2">
        <Button
          variant="secondary"
          className="w-full border-neutral-300 text-neutral-700"
          onClick={() =>
            setLogoutOpen(true)
          }
        >
          로그아웃
        </Button>
      </div>

      <BottomNavigation
        activeItem="my"
        className="shrink-0"
      />

      <Dialog
        open={logoutOpen}
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
          if (!isLoggingOut) {
            setLogoutOpen(false)
          }
        }}
      />

      <Dialog
        open={withdrawOpen}
        title="회원 탈퇴"
        description="회원 탈퇴 기능은 서버 API 연동 후 제공될 예정이에요."
        confirmText="확인"
        cancelText="닫기"
        onConfirm={() =>
          setWithdrawOpen(false)
        }
        onCancel={() =>
          setWithdrawOpen(false)
        }
      />
    </div>
  )
}

type MenuItem = {
  title: string
  icon: ReactNode
  onClick: () => void
}

function MenuSection({
  title,
  items,
}: {
  title: string
  items: MenuItem[]
}) {
  return (
    <section className="mt-5">
      <h2 className="typography-label-2 text-neutral-700">
        {title}
      </h2>

      <div className="mt-2 overflow-hidden rounded-card border border-neutral-200 bg-white">
        {items.map(
          (item) => (
            <button
              key={item.title}
              type="button"
              onClick={item.onClick}
              className="flex h-[60px] w-full items-center gap-3 border-b border-neutral-200 bg-white p-4 text-left last:border-b-0 hover:bg-neutral-100"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-input bg-primary-100 text-primary-700">
                {item.icon}
              </span>

              <span className="min-w-0 flex-1 truncate typography-title-3 text-neutral-900">
                {item.title}
              </span>

              <ChevronRight
                aria-hidden
                size={20}
                className="shrink-0 text-primary-700"
              />
            </button>
          ),
        )}
      </div>
    </section>
  )
}