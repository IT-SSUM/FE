import { useMutation } from '@tanstack/react-query'
import { registerPush } from '@/apis/notification'
import { getAuthSession } from '@/features/auth/storage'
import { savePushRegistration } from '@/features/notifications/pushRegistrationStorage'
import type { RegisterPushRequest } from '@/types/notification'

// Firebase가 발급한 실제 FID와 서버에서 지원하는 기기 유형을 전달해야 합니다.
export function useRegisterPushMutation() {
  return useMutation({
    mutationFn: async (body: RegisterPushRequest) => {
      const session = getAuthSession()
      if (!session?.accessToken) throw new Error('로그인이 필요합니다.')
      const result = await registerPush(body)
      if (getAuthSession()?.userId === session.userId) {
        savePushRegistration(session.userId, result.pushRegistrationId)
      }
      return result
    },
  })
}
