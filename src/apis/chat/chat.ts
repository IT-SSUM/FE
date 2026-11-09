import axiosInstance from '@/apis/axios'
import type { ApiResponse } from '@/types/api'
import type {
  ChatMessagePage,
  ChatRoom,
  MarkChatReadRequest,
  PresignChatImageRequest,
  PresignedChatImageUpload,
} from './types'

export async function getChatRooms(signal?: AbortSignal) {
  const response = await axiosInstance.get<ApiResponse<ChatRoom[]>>(
    '/api/chat-rooms',
    { signal },
  )
  return response.data.data
}

export async function getChatMessages(
  chatRoomId: number,
  params: { beforeId?: number; size?: number } = {},
  signal?: AbortSignal,
) {
  const response = await axiosInstance.get<ApiResponse<ChatMessagePage>>(
    `/api/chat-rooms/${chatRoomId}/messages`,
    { params, signal },
  )
  return response.data.data
}

export async function markChatRead(
  chatRoomId: number,
  request: MarkChatReadRequest,
) {
  await axiosInstance.patch<ApiResponse<null>>(
    `/api/chat-rooms/${chatRoomId}/read`,
    request,
  )
}

export async function presignChatImage(
  chatRoomId: number,
  request: PresignChatImageRequest,
) {
  const response = await axiosInstance.post<ApiResponse<PresignedChatImageUpload>>(
    `/api/chat-rooms/${chatRoomId}/images/presign`,
    request,
  )
  return response.data.data
}
