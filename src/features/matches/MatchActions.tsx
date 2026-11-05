import { useRef, useState } from 'react'
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
  match: { matchId: number; status: string; requestedBy: string }
  audience: 'DONOR' | 'ORGANIZATION'
}) {
  const accept = useAcceptMatchMutation()
  const withdraw = useWithdrawMatchMutation()
  const reserve = useReserveMatchMutation()
  const lock = useRef(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const pending = accept.isPending || withdraw.isPending || reserve.isPending
  const direction = matchDirection(match.requestedBy, audience)
  async function run(action: 'accept' | 'withdraw' | 'reserve') {
    if (lock.current) return
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
      } else {
        const result = await reserve.mutateAsync(match.matchId)
        setNotice(`처리 상태: ${matchStatusLabel(result.status)}`)
      }
    } catch (cause) { setError(matchErrorMessage(cause)) }
    finally { lock.current = false }
  }
  return <div className="space-y-3">
    {match.status === 'PENDING' && direction === 'received' ? <Button className="w-full" disabled={pending} onClick={() => void run('accept')}>수락하기</Button> : null}
    {match.status === 'PENDING' && direction === 'sent' ? <Button variant="secondary" className="w-full" disabled={pending} onClick={() => void run('withdraw')}>철회하기</Button> : null}
    {match.status === 'TRADING' && audience === 'DONOR' ? <Button className="w-full" disabled={pending} onClick={() => void run('reserve')}>거래 예약하기</Button> : null}
    {pending ? <p role="status">처리 중이에요.</p> : null}
    {notice ? <p role="status">{notice}</p> : null}
    {error ? <p role="alert" className="text-error">{error}</p> : null}
  </div>
}
