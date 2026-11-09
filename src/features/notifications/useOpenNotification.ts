import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReadNotificationMutation } from '@/hooks/mutations/useNotificationMutations'

export function useOpenNotification() {
  const mutation = useReadNotificationMutation()
  const navigate = useNavigate()
  const locked = useRef(false)
  const open = async (item: { id: number; unread: boolean; to: string | null }) => {
    if (locked.current) return
    locked.current = true
    mutation.reset()
    try {
      if (item.unread) await mutation.mutateAsync(item.id)
      if (item.to) navigate(item.to)
    } catch {
      // 읽음 실패를 표시하고 현재 화면에서 재시도할 수 있도록 유지합니다.
    } finally { locked.current = false }
  }
  return { open, isPending: mutation.isPending, error: mutation.error }
}
