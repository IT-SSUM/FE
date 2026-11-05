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

export function matchDirection(requestedBy: string, audience: 'DONOR' | 'ORGANIZATION') {
  // 확인되지 않은 역할 값은 수신/발신으로 추측하지 않습니다.
  if (requestedBy !== 'DONOR' && requestedBy !== 'ORGANIZATION') return null
  return requestedBy === audience ? 'sent' : 'received'
}
export function matchStatusLabel(status: string) {
  return ({ PENDING: '응답 대기', TRADING: '거래중', RESERVED: '예약중' } as Record<string, string>)[status] ?? status
}
export function MatchActions({ match, audience }: {
  match: { matchId: number; status: string; requestedBy: string; quantity: number }
  audience: 'DONOR' | 'ORGANIZATION'
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
  const [notice, setNotice] = useState('')
  const pending = accept.isPending || withdraw.isPending || reserve.isPending || reject.isPending || quantityMutation.isPending || complete.isPending || cancel.isPending
  const direction = matchDirection(match.requestedBy, audience)
  async function run(action: 'accept' | 'withdraw' | 'reserve' | 'reject' | 'quantity' | 'complete' | 'cancel') {
    if (lock.current) return
    const allowed = action === 'accept' || action === 'reject'
      ? match.status === 'PENDING' && direction === 'received'
      : action === 'withdraw' ? match.status === 'PENDING' && direction === 'sent'
      : action === 'reserve' || action === 'quantity' ? match.status === 'TRADING' && audience === 'DONOR'
      : action === 'complete' ? match.status === 'RESERVED' && audience === 'ORGANIZATION'
      : match.status === 'TRADING' || match.status === 'RESERVED'
    if (!allowed) return
    lock.current = true
    setError('')
    setNotice('')
    try {
      if (action === 'accept') {
        const result = await accept.mutateAsync(match.matchId)
        // 기존 채팅 화면은 고정 데모 대화이므로 서버 채팅방으로 오인시키지 않습니다.
        setNotice(result.chatRoomId ? '수락되었습니다. 채팅방이 생성되었으며 채팅 화면 연동은 준비 중이에요.' : '수락되었습니다.')
      } else if (action === 'withdraw') {
        const result = await withdraw.mutateAsync(match.matchId)
        setNotice(`처리 상태: ${matchStatusLabel(result.status)}`)
      } else if (action === 'reserve') {
        const result = await reserve.mutateAsync(match.matchId)
        setNotice(`처리 상태: ${matchStatusLabel(result.status)}`)
      } else {
        const result = action === 'reject' ? await reject.mutateAsync(match.matchId)
          : action === 'quantity' ? await quantityMutation.mutateAsync({ matchId: match.matchId, body: { quantity: Number(quantity) } })
          : action === 'complete' ? await complete.mutateAsync(match.matchId)
          : await cancel.mutateAsync({ matchId: match.matchId, body: { reason } })
        setNotice(`처리 상태: ${matchStatusLabel(result.status)}`)
        setEditing(null)
        setConfirm(null)
        if (action === 'complete' || action === 'cancel') navigate(audience === 'DONOR' ? ROUTES.donor.myRequests : ROUTES.organization.offerList, { replace: true })
      }
    } catch (cause) { setError(matchErrorMessage(cause)) }
    finally { lock.current = false }
  }
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
      <Button type="submit" disabled={pending || !reason.trim()}>취소 확정</Button>
    </form> : null}
    <Dialog open={confirm !== null} title={confirm === 'complete' ? '실제 물품을 수령했나요?' : '제안·요청을 거절할까요?'}
      description={error || (confirm === 'complete' ? '수령을 확인한 뒤 완료 처리해 주세요.' : '거절한 제안·요청은 수락할 수 없어요.')}
      confirmText={pending ? '처리 중...' : '확인'} onConfirm={() => { if (confirm) void run(confirm) }}
      onCancel={() => { if (!lock.current) { setConfirm(null); setError('') } }} />
    {pending ? <p role="status">처리 중이에요.</p> : null}
    {notice ? <p role="status">{notice}</p> : null}
    {error ? <p role="alert" className="text-error">{error}</p> : null}
  </div>
}
