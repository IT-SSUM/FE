import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { withdrawCurrentUser } from '@/apis/users'
import { clearAuthSession } from '@/features/auth/storage'
import { ROUTES } from '@/routes/paths'

export function useWithdrawAccount() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: withdrawCurrentUser,
    onSuccess: () => {
      clearAuthSession()
      queryClient.clear()
      navigate(ROUTES.start, { replace: true })
    },
  })
}
