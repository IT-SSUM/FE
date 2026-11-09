export type ChatMessageType = 'TEXT' | 'IMAGE' | 'SYSTEM' | 'APPOINTMENT'

export type ChatRoom = {
  chatRoomId: number
  matchId: number
  otherUserId: number
  otherName: string
  donationItemId: number
  itemName: string
  quantity: number
  unit: string
  matchStatus:
    | 'PENDING'
    | 'TRADING'
    | 'RESERVED'
    | 'COMPLETED'
    | 'REJECTED'
    | 'CANCELED'
  lastMessageContent: string | null
  lastMessageAt: string | null
  unreadCount: number
}

export type ChatAppointment = {
  deliveryMethod: 'DIRECT' | 'PARCEL'
  scheduledAt: string
  deliveryPlace: string
  receiverName: string
}

export type ChatMessage = {
  messageId: number
  chatRoomId: number
  senderId: number | null
  messageType: ChatMessageType
  content: string
  thumbnailUrl: string | null
  systemDescription: string | null
  appointment: ChatAppointment | null
  createdAt: string
}

export type ChatMessagePage = {
  messages: ChatMessage[]
  nextCursor: number | null
  hasNext: boolean
  otherLastReadMessageId: number | null
}

export type MarkChatReadRequest = {
  lastReadMessageId: number
}

export type PresignChatImageRequest = {
  contentType: string
}

export type PresignedChatImageUpload = {
  objectKey: string
  uploadUrl: string
  requiredHeaders: Record<string, string>
}

export type SendChatMessageRequest = {
  messageType: Extract<ChatMessageType, 'TEXT' | 'IMAGE'>
  content: string
}

export type ChatReadEvent = {
  chatRoomId: number
  userId: number
  lastReadMessageId: number
}
