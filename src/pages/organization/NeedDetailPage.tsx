import { useState, type ReactNode } from 'react'
import { BookOpen, ChevronLeft, Package } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button/Button'
import { Dialog } from '@/components/common/Dialog/Dialog'
import { ROUTES, routePath } from '@/routes/paths'
import { cn } from '@/utils/cn'
import {
  additionalQuantity,
  organizationNeeds,
  type OrganizationNeedStatus,
} from './organizationNeeds'

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

export function NeedDetailPage() {
  const navigate = useNavigate()
  const { needId } = useParams()
  const need =
    organizationNeeds.find((item) => item.id === needId) ?? organizationNeeds[0]
  const [status, setStatus] = useState(need.status)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [closeOpen, setCloseOpen] = useState(false)
  const statusStyle = statusConfig[status]
  const Icon = need.category === '도서' ? BookOpen : Package

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
        <h1 className="typography-title-3 text-neutral-900">필요 물품</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
        <div className="flex h-[126px] items-center justify-center rounded-card bg-error-bg text-primary-700">
          <Icon aria-hidden size={72} strokeWidth={2} />
        </div>

        <span
          className={cn(
            'mt-2 inline-flex h-7 items-center rounded-pill px-3 text-xs font-medium',
            statusStyle.className,
          )}
        >
          {statusStyle.label}
        </span>

        <section className="mt-2 rounded-card border border-neutral-200 bg-white p-4">
          <h2 className="text-base font-semibold leading-6 text-neutral-900">
            {need.title}
          </h2>
          <dl className="mt-3 space-y-2 text-xs leading-[18px]">
            <InfoRow label="품목" value={need.itemName} />
            <InfoRow
              label="수량"
              value={
                <>
                  필요 수량 {need.requiredQuantity}
                  <br />
                  예약 수량 {need.reservedQuantity} · 수령 완료 수량{' '}
                  {need.receivedQuantity}
                  <br />
                  추가 필요 수량 {additionalQuantity(need)}
                </>
              }
            />
            <InfoRow label="물품 상태" value={need.condition} />
            <InfoRow label="물품 위치" value={need.location} />
          </dl>
        </section>

        <div className="mt-2 flex gap-2">
          <ManageAction
            label="수정"
            onClick={() => navigate(routePath.organizationNeedEdit(need.id))}
          />
          <ManageAction label="삭제" danger onClick={() => setDeleteOpen(true)} />
          {status !== 'complete' ? (
            <ManageAction label="모집 종료" onClick={() => setCloseOpen(true)} />
          ) : null}
        </div>

      </main>

      <footer className="shrink-0 bg-surface-canvas px-5 pb-4 pt-2">
        <Button
          className="h-[46px] w-full"
          onClick={() =>
            navigate(`${ROUTES.organization.donationList}?view=received`)
          }
        >
          받은 제안 보기
        </Button>
      </footer>

      <Dialog
        open={deleteOpen}
        title="필요 물품을 삭제할까요?"
        description="삭제한 물품은 다시 확인할 수 없어요."
        confirmText="삭제하기"
        cancelText="취소"
        confirmVariant="danger"
        onConfirm={() => navigate(ROUTES.organization.needManage)}
        onCancel={() => setDeleteOpen(false)}
      />

      <Dialog
        open={closeOpen}
        title="모집을 종료할까요?"
        description="신규 기부 제안 모집을 종료해요."
        confirmText="모집 종료"
        cancelText="계속 모집"
        confirmVariant="danger"
        className="text-center"
        onConfirm={() => {
          setStatus('complete')
          setCloseOpen(false)
        }}
        onCancel={() => setCloseOpen(false)}
      />
    </div>
  )
}

type InfoRowProps = {
  label: string
  value: ReactNode
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="grid grid-cols-[68px_1fr] gap-2">
      <dt className="text-neutral-700">{label}</dt>
      <dd className="font-normal text-neutral-900">{value}</dd>
    </div>
  )
}

type ManageActionProps = {
  label: string
  onClick: () => void
  danger?: boolean
}

function ManageAction({ label, onClick, danger = false }: ManageActionProps) {
  const isCloseAction = label === '모집 종료'

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-9 rounded-pill border text-xs font-bold leading-[18px] transition-colors',
        isCloseAction ? 'w-[112px]' : 'w-16',
        isCloseAction
          ? 'border-primary-700 bg-primary-700 text-white hover:bg-primary-800'
          : danger
            ? 'border-error/40 bg-white text-error hover:border-error'
            : 'border-primary-300 bg-white text-primary-700 hover:border-primary-700',
      )}
    >
      {label}
    </button>
  )
}
