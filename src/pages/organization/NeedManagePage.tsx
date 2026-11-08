import { useState } from 'react'
import { BookOpen, ChevronLeft, Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getOrganizationErrorMessage, type MyNeededItem } from '@/apis/organization'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { Button } from '@/components/common/Button/Button'
import { SegmentedTabs } from '@/components/common/SegmentedTabs/SegmentedTabs'
import {
  useItemCategories,
  useOrganizationNeededItems,
} from '@/hooks/organization/useOrganizationNeededItems'
import { ROUTES, routePath } from '@/routes/paths'
import { cn } from '@/utils/cn'

const statusConfig: Record<
  MyNeededItem['status'],
  { label: string; className: string }
> = {
  RECRUITING: {
    label: '모집중',
    className: 'bg-neutral-100 text-neutral-700',
  },
  FULL: {
    label: '예약마감',
    className: 'bg-primary-100 text-primary-700',
  },
  CLOSED: {
    label: '모집 종료',
    className: 'bg-success-bg text-success',
  },
}

export function NeedManagePage() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const categoryId = selectedCategory === 'all' ? undefined : Number(selectedCategory)
  const categoriesQuery = useItemCategories()
  const needsQuery = useOrganizationNeededItems(categoryId)
  const needs = needsQuery.data?.pages.flatMap((page) => page.items) ?? []
  const errorMessage = needsQuery.error
    ? getOrganizationErrorMessage(needsQuery.error, '필요 물품 목록을 불러오지 못했어요.')
    : ''
  const filterItems = [
    { value: 'all', label: `전체 ${selectedCategory === 'all' ? needs.length : ''}`.trim() },
    ...(categoriesQuery.data ?? []).map((category) => ({
      value: String(category.categoryId),
      label: category.name,
    })),
  ]

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
          value={selectedCategory}
          onChange={setSelectedCategory}
          items={filterItems}
          className="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        />

        <section className="mt-4 space-y-3" aria-label="등록한 필요 물품">
          {needsQuery.isLoading ? (
            <p className="py-12 text-center typography-body-2 text-neutral-700" role="status">필요 물품을 불러오는 중이에요.</p>
          ) : needsQuery.isError ? (
            <div className="py-12 text-center" role="alert">
              <p className="typography-body-2 text-error">{errorMessage}</p>
              <Button variant="secondary" className="mt-4 h-10" onClick={() => void needsQuery.refetch()}>다시 시도</Button>
            </div>
          ) : needs.length === 0 ? (
            <div className="rounded-card bg-neutral-100 px-5 py-12 text-center">
              <Package aria-hidden size={36} className="mx-auto text-neutral-500" />
              <p className="mt-3 typography-body-2 text-neutral-700">등록한 필요 물품이 없어요.</p>
            </div>
          ) : (
            needs.map((need) => (
              <NeedManageCard
                key={need.neededItemId}
                need={need}
                onClick={() => navigate(routePath.organizationNeedDetail(String(need.neededItemId)))}
              />
            ))
          )}
        </section>

        {needsQuery.hasNextPage ? (
          <Button
            variant="secondary"
            className="mt-4 w-full"
            disabled={needsQuery.isFetchingNextPage}
            onClick={() => void needsQuery.fetchNextPage()}
          >
            {needsQuery.isFetchingNextPage ? '불러오는 중...' : '더 보기'}
          </Button>
        ) : null}
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
  need: MyNeededItem
  onClick: () => void
}

function NeedManageCard({ need, onClick }: NeedManageCardProps) {
  const status = statusConfig[need.status]
  const Icon = need.categoryName.includes('도서') ? BookOpen : Package
  const note = need.status === 'RECRUITING'
    ? `추가 ${need.availableQuantity}${need.unit}을 모집할 수 있어요.`
    : need.status === 'FULL'
      ? '예약 취소로 잔여 수량이 생기면 모집이 재개돼요.'
      : '모집이 종료된 물품이에요.'

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[126px] w-full items-center gap-3 rounded-card border border-neutral-200 bg-white p-4 text-left transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
    >
      <span className="flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-input bg-error-bg text-primary-700">
        {need.referenceImageUrl ? (
          <img src={need.referenceImageUrl} alt="" className="size-full object-cover" />
        ) : (
          <Icon aria-hidden size={30} strokeWidth={2} />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block text-base font-semibold leading-6 text-neutral-900">
          {need.itemName} {need.requiredQuantity}{need.unit}
        </strong>
        <span className="mt-1 block text-xs font-normal leading-[18px] text-neutral-700">
          예약 수량 {need.reservedQuantity} · 수령 완료 {need.receivedQuantity}
          <br />
          추가 필요 수량 {need.availableQuantity} (필요 {need.requiredQuantity})
          <br />
          {note}
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
