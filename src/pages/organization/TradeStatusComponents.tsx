import { BookOpen, Package } from 'lucide-react'
import type { CSSProperties } from 'react'
import { SegmentedTabs } from '@/components/common/SegmentedTabs/SegmentedTabs'
import {
  tradeStatusLabels,
  type OrganizationTrade,
  type OrganizationTradeStatus,
} from './organizationTrades'

export function TradeStatusTabs({
  status,
  onChange,
}: {
  status: OrganizationTradeStatus
  onChange: (status: OrganizationTradeStatus) => void
}) {
  return (
    <SegmentedTabs
      ariaLabel="거래 상태"
      value={status}
      onChange={(value) => onChange(value as OrganizationTradeStatus)}
      items={(Object.keys(tradeStatusLabels) as OrganizationTradeStatus[]).map(
        (value) => ({ value, label: tradeStatusLabels[value] }),
      )}
    />
  )
}

export function OrganizationTradeCard({
  trade,
  onClick,
}: {
  trade: OrganizationTrade
  onClick?: () => void
}) {
  const Icon = trade.category === 'book' ? BookOpen : Package
  const iconBackgroundColor =
    trade.status === 'progress'
      ? '#FDEDEA'
      : trade.status === 'complete'
        ? '#EEF2EF'
        : '#E1ECF9'
  const badgeStyle: CSSProperties =
    trade.badge === '거래중'
      ? { backgroundColor: '#E7F7EF', color: '#1F7A60' }
      : trade.badge === '예약중'
        ? { backgroundColor: '#FFF3D6', color: '#8A570F' }
        : trade.badge === '전달 완료'
          ? { backgroundColor: '#DCEBFA', color: '#1F5F9D' }
          : { backgroundColor: '#E2E8E4', color: '#344139' }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[104px] w-full items-center gap-3 rounded-card border border-neutral-200 bg-white p-4 text-left transition-colors hover:bg-neutral-100"
    >
      <span
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-input text-primary-700"
        style={{ width: 64, height: 72, backgroundColor: iconBackgroundColor }}
      >
        <Icon aria-hidden size={26} strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block truncate text-sm font-semibold leading-[22px] text-neutral-900">
          {trade.donorName} 님 · {trade.itemName}
        </strong>
        <span className="mt-1 block text-xs font-normal leading-[18px] text-neutral-700">
          {trade.description}
        </span>
        <span
          className="mt-2 inline-flex h-7 items-center rounded-pill px-3 text-xs font-semibold"
          style={badgeStyle}
        >
          {trade.badge}
        </span>
      </span>
    </button>
  )
}
