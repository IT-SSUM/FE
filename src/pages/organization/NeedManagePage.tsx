import { useState } from 'react'
import { BookOpen, ChevronLeft, Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { Button } from '@/components/common/Button/Button'
import { SegmentedTabs } from '@/components/common/SegmentedTabs/SegmentedTabs'
import { ROUTES, routePath } from '@/routes/paths'
import { cn } from '@/utils/cn'
import {
  additionalQuantity,
  organizationNeeds,
  type OrganizationNeed,
  type OrganizationNeedStatus,
} from './organizationNeeds'

const filters = ['전체', '생활', '도서', '의류'] as const

const statusConfig: Record<
  OrganizationNeedStatus,
  { label: string; className: string }
> = {
  recruiting: {
    label: '모집중',
    className: 'bg-neutral-100 text-neutral-700',
  },
  reserved: {
    label: '예약마감',
    className: 'bg-primary-100 text-primary-700',
  },
  complete: {
    label: '모집 종료',
    className: 'bg-success-bg text-success',
  },
}

export function NeedManagePage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<(typeof filters)[number]>('전체')
  const filteredNeeds = organizationNeeds.filter(
    (need) => filter === '전체' || need.category === filter,
  )

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 shrink-0 items-center gap-2 px-5">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-6 items-center justify-center text-primary-700"
        >
          <ChevronLeft aria-hidden size={24} strokeWidth={2} />
        </button>
        <h1 className="typography-title-3 text-neutral-900">필요 물품 관리</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
        <SegmentedTabs
          ariaLabel="필요 물품 카테고리"
          value={filter}
          onChange={(value) =>
            setFilter(value as (typeof filters)[number])
          }
          items={filters.map((value) => ({
            value,
            label: value === '전체' ? `전체 ${organizationNeeds.length}` : value,
          }))}
        />

        <section className="mt-4 space-y-3" aria-label="등록한 필요 물품">
          {filteredNeeds.map((need) => (
            <NeedManageCard
              key={need.id}
              need={need}
              onClick={() => navigate(routePath.organizationNeedDetail(need.id))}
            />
          ))}
        </section>
      </main>

      <div className="flex shrink-0 justify-end px-5 pb-5">
        <Button
          className="h-11 rounded-pill px-5"
          style={{ height: 44 }}
          onClick={() => navigate(ROUTES.organization.needNew)}
        >
          등록하기
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

type NeedManageCardProps = {
  need: OrganizationNeed
  onClick: () => void
}

function NeedManageCard({ need, onClick }: NeedManageCardProps) {
  const status = statusConfig[need.status]
  const Icon = need.category === '도서' ? BookOpen : Package

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[126px] w-full items-center gap-3 rounded-card border border-neutral-200 bg-white p-4 text-left transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
    >
      <span className="flex size-[72px] shrink-0 items-center justify-center rounded-input bg-error-bg text-primary-700">
        <Icon aria-hidden size={30} strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block text-base font-semibold leading-6 text-neutral-900">
          {need.title}
        </strong>
        <span className="mt-1 block text-xs font-normal leading-[18px] text-neutral-700">
          예약 수량 {need.reservedQuantity} · 수령 완료 {need.receivedQuantity}
          <br />
          추가 필요 수량 {additionalQuantity(need)} (필요 {need.requiredQuantity})
          <br />
          {need.note}
        </span>
        <span
          className={cn(
            'mt-2 inline-flex h-6 items-center rounded-pill px-3 text-xs font-medium',
            status.className,
          )}
        >
          {status.label}
        </span>
      </span>
    </button>
  )
}
