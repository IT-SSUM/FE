import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/common/Input/Input'
import { Dialog } from '@/components/common/Dialog/Dialog'
import { ROUTES, routePath } from '@/routes/paths'
import { useRejectMatchMutation } from '@/hooks/mutations/useRejectMatchMutation'
import { useUpdateMatchQuantityMutation } from '@/hooks/mutations/useUpdateMatchQuantityMutation'
import { useCompleteMatchMutation } from '@/hooks/mutations/useCompleteMatchMutation'
import { useCancelMatchMutation } from '@/hooks/mutations/useCancelMatchMutation'
import { Button } from '@/components/common/Button/Button'
import { matchErrorMessage } from '@/apis/match'
import { useAcceptMatchMutation } from '@/hooks/mutations/useAcceptMatchMutation'
import { useWithdrawMatchMutation } from '@/hooks/mutations/useWithdrawMatchMutation'
import { useReserveMatchMutation } from '@/hooks/mutations/useReserveMatchMutation'
import { Toast } from '@/components/common/Toast/Toast'

type ActionNotice = {
  title: string
  description?: string
}

export function matchDirection(requestedBy: string, audience: 'DONOR' | 'ORGANIZATION' | null) {
  // 확인되지 않은 역할 값은 수신/발신으로 추측하지 않습니다.
  if (!audience || (requestedBy !== 'DONOR' && requestedBy !== 'ORGANIZATION')) return null
  return requestedBy === audience ? 'sent' : 'received'
}
export function matchStatusLabel(status: string) {
  return ({
    PENDING: '응답 대기',
    TRADING: '거래중',
    RESERVED: '예약중',
    COMPLETED: '거래 완료',
    REJECTED: '거절됨',
    CANCELED: '취소됨',
  } as Record<string, string>)[status] ?? status
}
export function MatchActions({ match, audience, authenticatedRole = null }: {
  match: { matchId: number; status: string; requestedBy: string; quantity: number }
  audience: 'DONOR' | 'ORGANIZATION'
  // Auth 통합 이후 검증된 로그인 역할만 전달합니다. 화면 audience는 권한이 아닙니다.
  authenticatedRole?: 'DONOR' | 'ORGANIZATION' | null
}) {
  const navigate = useNavigate()
  const reject = useRejectMatchMutation()
  const quantityMutation = useUpdateMatchQuantityMutation()
  const complete = useCompleteMatchMutation()
  const cancel = useCancelMatchMutation()
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [editing, setEditing] = useState<'quantity' | 'cancel' | null>(null)
  const [confirm, setConfirm] = useState<'reject' | 'complete' | null>(null)
  const accept = useAcceptMatchMutation()
  const withdraw = useWithdrawMatchMutation()
  const reserve = useReserveMatchMutation()
  const lock = useRef(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState<ActionNotice | null>(null)
  const pending = accept.isPending || withdraw.isPending || reserve.isPending || reject.isPending || quantityMutation.isPending || complete.isPending || cancel.isPending
  const direction = matchDirection(match.requestedBy, authenticatedRole)
  async function run(action: 'accept' | 'withdraw' | 'reserve' | 'reject' | 'quantity' | 'complete' | 'cancel') {
    if (lock.current || !authenticatedRole || authenticatedRole !== audience) return
    const allowed = action === 'accept' || action === 'reject'
      ? match.status === 'PENDING' && direction === 'received'
      : action === 'withdraw' ? match.status === 'PENDING' && direction === 'sent'
      : action === 'reserve' || action === 'quantity' ? match.status === 'TRADING' && audience === 'DONOR'
      : action === 'complete' ? match.status === 'RESERVED' && audience === 'ORGANIZATION'
      : match.status === 'TRADING' || match.status === 'RESERVED'
    if (!allowed) return
    lock.current = true
    setError('')
    setNotice(null)
    try {
      if (action === 'accept') {
        const result = await accept.mutateAsync(match.matchId)
        setNotice({
          title: '제안을 수락했어요',
          description: result.chatRoomId
            ? '채팅방에서 기부자와 대화를 시작해 보세요.'
            : '거래 상세에서 진행 상태를 확인할 수 있어요.',
        })
      } else if (action === 'withdraw') {
        await withdraw.mutateAsync(match.matchId)
        setNotice({ title: '요청을 철회했어요' })
      } else if (action === 'reserve') {
        await reserve.mutateAsync(match.matchId)
        setNotice({
          title: '거래를 예약했어요',
          description: '기관과 전달 일정과 장소를 정해 보세요.',
        })
      } else {
        await (action === 'reject' ? reject.mutateAsync(match.matchId)
          : action === 'quantity' ? await quantityMutation.mutateAsync({ matchId: match.matchId, body: { quantity: Number(quantity) } })
          : action === 'complete' ? await complete.mutateAsync(match.matchId)
          : await cancel.mutateAsync({ matchId: match.matchId, body: { reason } }))
        setNotice({
          title: action === 'reject'
            ? '제안·요청을 거절했어요'
            : action === 'quantity'
              ? '거래 수량을 변경했어요'
              : action === 'complete'
                ? '전달을 완료했어요'
                : '거래를 취소했어요',
        })
        setEditing(null)
        setConfirm(null)
        if (action === 'complete' || action === 'cancel') navigate(audience === 'DONOR' ? ROUTES.donor.myRequests : ROUTES.organization.offerList, { replace: true })
      }
    } catch (cause) { setError(matchErrorMessage(cause)) }
    finally { lock.current = false }
  }
  if (!authenticatedRole || authenticatedRole !== audience) return <p role="status">로그인 역할 확인 후 매칭 작업을 이용할 수 있어요.</p>
  return <div className="space-y-3">
    {match.status === 'PENDING' && direction === 'received' ? <Button className="w-full" disabled={pending} onClick={() => void run('accept')}>수락하기</Button> : null}
    {match.status === 'PENDING' && direction === 'sent' ? <Button variant="secondary" className="w-full" disabled={pending} onClick={() => void run('withdraw')}>철회하기</Button> : null}
    {match.status === 'TRADING' && audience === 'DONOR' ? <Button className="w-full" disabled={pending} onClick={() => void run('reserve')}>거래 예약하기</Button> : null}
    {match.status === 'PENDING' && direction === 'received' ? <Button variant="secondary" className="w-full" disabled={pending} onClick={() => { setError(''); setConfirm('reject') }}>거절하기</Button> : null}
    {match.status === 'TRADING' && audience === 'DONOR' ? <Button variant="secondary" className="w-full" disabled={pending} onClick={() => { setQuantity(String(match.quantity)); setEditing('quantity'); setError('') }}>수량 변경</Button> : null}
    {match.status === 'RESERVED' ? <Button variant="secondary" className="w-full" disabled={pending} onClick={() => navigate(audience === 'ORGANIZATION' ? routePath.organizationTradeAppointment(String(match.matchId)) : `/trades/${match.matchId}/appointment`)}>전달 약속 입력·수정</Button> : null}
    {match.status === 'RESERVED' && audience === 'ORGANIZATION' ? <Button className="w-full" disabled={pending} onClick={() => { setError(''); setConfirm('complete') }}>전달 완료</Button> : null}
    {match.status === 'TRADING' || match.status === 'RESERVED' ? <Button variant="secondary" className="w-full" disabled={pending} onClick={() => { setEditing('cancel'); setError('') }}>거래 취소</Button> : null}
    {editing === 'quantity' && match.status === 'TRADING' && audience === 'DONOR' ? <form className="space-y-2" onSubmit={event => { event.preventDefault(); void run('quantity') }}>
      <Input label="변경할 수량" type="number" min={1} step={1} required value={quantity} disabled={pending} onChange={event => setQuantity(event.target.value)} />
      <Button type="submit" disabled={pending}>수량 저장</Button>
    </form> : null}
    {editing === 'cancel' && (match.status === 'TRADING' || match.status === 'RESERVED') ? <form className="space-y-2" onSubmit={event => { event.preventDefault(); void run('cancel') }}>
      <Input label="취소 사유" required value={reason} disabled={pending} onChange={event => setReason(event.target.value)} />
      <Button type="submit" className="w-full" disabled={pending || !reason.trim()}>취소 확정</Button>
    </form> : null}
    <Dialog open={confirm !== null} title={confirm === 'complete' ? '실제 물품을 수령했나요?' : '제안·요청을 거절할까요?'}
      description={error || (confirm === 'complete' ? '수령을 확인한 뒤 완료 처리해 주세요.' : '거절한 제안·요청은 수락할 수 없어요.')}
      confirmText={pending ? '처리 중...' : '확인'} onConfirm={() => { if (confirm) void run(confirm) }}
      onCancel={() => { if (!lock.current) { setConfirm(null); setError('') } }} />
    {pending ? (
      <Toast
        variant="info"
        title="요청을 처리하고 있어요"
        className="min-h-0 max-w-none shadow-none"
      />
    ) : null}
    {notice ? (
      <Toast
        title={notice.title}
        description={notice.description}
        className="min-h-0 max-w-none shadow-none"
      />
    ) : null}
    {error ? (
      <Toast
        variant="error"
        title="요청을 처리하지 못했어요"
        description={error}
        className="min-h-0 max-w-none shadow-none"
      />
    ) : null}
  </div>
}
