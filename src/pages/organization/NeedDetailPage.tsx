import { useState, type ReactNode } from 'react'
import { BookOpen, ChevronLeft, Package } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { getNeededItemErrorMessage } from '@/apis/neededItem'
import { Button } from '@/components/common/Button/Button'
import { Dialog } from '@/components/common/Dialog/Dialog'
import { useCloseNeededItemMutation } from '@/hooks/mutations/useCloseNeededItemMutation'
import { useDeleteNeededItemMutation } from '@/hooks/mutations/useDeleteNeededItemMutation'
import { useNeededItemQuery } from '@/hooks/queries/useNeededItemQuery'
import { ROUTES, routePath } from '@/routes/paths'
import { cn } from '@/utils/cn'

const statusConfig = {
  RECRUITING: { label: '모집중', className: 'bg-neutral-100 text-neutral-700' },
  FULL: { label: '예약마감', className: 'bg-primary-100 text-primary-700' },
  CLOSED: { label: '모집 종료', className: 'bg-success-bg text-success' },
} as const

const conditionLabels = {
  HIGH: '상 · 미개봉 이상',
  MID: '중 · 사용감 적음 이상',
  LOW: '하 · 다회 사용 이상',
} as const

export function NeedDetailPage() {
  const navigate = useNavigate()
  const { needId } = useParams()
  const id = needId && /^[1-9]\d*$/.test(needId) ? Number(needId) : null
  const query = useNeededItemQuery(id)
  const closeMutation = useCloseNeededItemMutation()
  const deleteMutation = useDeleteNeededItemMutation()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [closeOpen, setCloseOpen] = useState(false)
  const [actionError, setActionError] = useState('')
  const need = query.data
  const status = need ? statusConfig[need.status] : null
  const Icon = need?.categoryName.includes('도서') ? BookOpen : Package
  const pending = closeMutation.isPending || deleteMutation.isPending

  const closeNeed = async () => {
    if (id === null || pending) return
    setActionError('')
    try {
      await closeMutation.mutateAsync(id)
      setCloseOpen(false)
    } catch (error) {
      setCloseOpen(false)
      setActionError(getNeededItemErrorMessage(error, '모집을 종료하지 못했어요. 다시 시도해 주세요.'))
    }
  }

  const deleteNeed = async () => {
    if (id === null || pending) return
    setActionError('')
    try {
      await deleteMutation.mutateAsync(id)
      navigate(ROUTES.organization.needManage, { replace: true })
    } catch (error) {
      setDeleteOpen(false)
      setActionError(getNeededItemErrorMessage(error, '필요 물품을 삭제하지 못했어요. 다시 시도해 주세요.'))
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 shrink-0 items-center gap-2 px-5">
        <button type="button" aria-label="뒤로가기" onClick={() => navigate(-1)} className="flex size-6 items-center justify-center text-primary-700">
          <ChevronLeft aria-hidden size={24} strokeWidth={2} />
        </button>
        <h1 className="typography-title-3 text-neutral-900">필요 물품</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
        {id === null ? (
          <p role="alert" className="py-12 text-center typography-body-2 text-error">올바른 필요 물품 번호가 필요해요.</p>
        ) : query.isPending ? (
          <p role="status" className="py-12 text-center typography-body-2 text-neutral-700">필요 물품을 불러오는 중이에요.</p>
        ) : query.isError ? (
          <div role="alert" className="py-12 text-center">
            <p className="typography-body-2 text-error">{getNeededItemErrorMessage(query.error, '필요 물품을 불러오지 못했어요.')}</p>
            <Button variant="secondary" className="mt-4 h-10" onClick={() => void query.refetch()}>다시 시도</Button>
          </div>
        ) : need && status ? (
          <>
            <div className="flex h-[126px] items-center justify-center overflow-hidden rounded-card bg-error-bg text-primary-700">
              {need.referenceImageUrl ? <img src={need.referenceImageUrl} alt="" className="size-full object-cover" /> : <Icon aria-hidden size={72} strokeWidth={2} />}
            </div>
            <span className={cn('mt-2 inline-flex h-7 items-center rounded-pill px-3 text-xs font-medium', status.className)}>{status.label}</span>
            <section className="mt-2 rounded-card border border-neutral-200 bg-white p-4">
              <h2 className="text-base font-semibold leading-6 text-neutral-900">{need.itemName} {need.requiredQuantity}{need.unit}</h2>
              <dl className="mt-3 space-y-2 text-xs leading-[18px]">
                <InfoRow label="품목" value={need.itemName} />
                <InfoRow label="카테고리" value={need.categoryName} />
                <InfoRow label="수량" value={<><span>필요 수량 {need.requiredQuantity}{need.unit}</span><br /><span>예약 {need.reservedQuantity}{need.unit} · 수령 완료 {need.receivedQuantity}{need.unit}</span><br /><span>추가 필요 {need.availableQuantity}{need.unit}</span></>} />
                <InfoRow label="희망 상태" value={conditionLabels[need.desiredCondition]} />
                <InfoRow label="수령 지역" value={need.regionName} />
                <InfoRow label="필요한 이유" value={need.description || '작성된 내용이 없어요.'} />
              </dl>
            </section>
            {actionError ? <p role="alert" className="mt-3 typography-body-2 text-error">{actionError}</p> : null}
            {need.mine ? (
              <div className="mt-2 flex gap-2">
                <ManageAction label="수정" onClick={() => navigate(routePath.organizationNeedEdit(String(need.neededItemId)))} />
                <ManageAction label="삭제" danger onClick={() => setDeleteOpen(true)} />
                {need.status !== 'CLOSED' ? <ManageAction label="모집 종료" onClick={() => setCloseOpen(true)} /> : null}
              </div>
            ) : null}
          </>
        ) : null}
      </main>

      <footer className="shrink-0 bg-surface-canvas px-5 pb-4 pt-2">
        <Button className="h-[46px] w-full" onClick={() => navigate(`${ROUTES.organization.donationList}?view=received`)}>받은 제안 보기</Button>
      </footer>

      <Dialog open={deleteOpen} title="필요 물품을 삭제할까요?" description="삭제한 물품은 다시 확인할 수 없어요." confirmText={deleteMutation.isPending ? '삭제 중...' : '삭제하기'} cancelText="취소" confirmVariant="danger" confirmDisabled={pending} cancelDisabled={pending} onConfirm={() => void deleteNeed()} onCancel={() => { if (!pending) setDeleteOpen(false) }} />
      <Dialog open={closeOpen} title="모집을 종료할까요?" description="신규 제안과 요청은 종료되고 진행 중인 거래는 유지돼요." confirmText={closeMutation.isPending ? '종료 중...' : '모집 종료'} cancelText="계속 모집" confirmVariant="danger" confirmDisabled={pending} cancelDisabled={pending} className="text-center" onConfirm={() => void closeNeed()} onCancel={() => { if (!pending) setCloseOpen(false) }} />
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return <div className="grid grid-cols-[76px_1fr] gap-2"><dt className="text-neutral-700">{label}</dt><dd className="font-normal text-neutral-900">{value}</dd></div>
}

function ManageAction({ label, onClick, danger = false }: { label: string; onClick: () => void; danger?: boolean }) {
  const isClose = label === '모집 종료'
  return <button type="button" onClick={onClick} className={cn('h-9 rounded-pill border text-xs font-bold leading-[18px] transition-colors', isClose ? 'w-[112px]' : 'w-16', isClose ? 'border-primary-700 bg-primary-700 text-white hover:bg-primary-800' : danger ? 'border-error/40 bg-white text-error hover:border-error' : 'border-primary-300 bg-white text-primary-700 hover:border-primary-700')}>{label}</button>
}
