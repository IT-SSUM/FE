import { useMutation } from '@tanstack/react-query'
import { deletePushRegistration } from '@/apis/notification'

// 등록 API가 반환한 현재 계정·기기의 ID만 전달합니다. 로그아웃 전에 호출해야 합니다.
export function useDeletePushRegistrationMutation() {
  return useMutation({ mutationFn: deletePushRegistration })
}

