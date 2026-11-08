export type CreateMatchRequest = {
  donationItemId: number
  neededItemId: number
  quantity: number
  message: string
}
export type CreateMatchResponse = {
  matchId: number
  status: string
  createdAt: string
}
export type MatchListItem = {
  matchId: number
  requestedBy: string
  status: string
  donationItemName: string
  neededItemName: string
  donorName: string
  organizationName: string
  quantity: number
  unit: string
  itemCategoryId: number
  donationItemRegion: string
  neededItemRegion: string
  deliveryMethod: string | null
  scheduledAt: string | null
  completedAt: string | null
}
export type MatchDetail = CreateMatchResponse & CreateMatchRequest & {
  donationItemName: string
  neededItemName: string
  donorId: number
  organizationId: number
  requestedBy: string
  initialQuantity: number
  deliveryMethod: string | null
  scheduledAt: string | null
  deliveryPlace: string | null
  receiverName: string | null
  respondedAt: string | null
  reservedAt: string | null
  completedAt: string | null
  canceledAt: string | null
  cancelReason: string | null
  itemCategoryId: number
  itemCategoryName: string
  unit: string
  conditionGrade: string
  donationItemRegion: string
  donationItemRemainingQuantity: number
  neededItemRegion: string
  neededItemAdditionalQuantity: number
  neededItemReceiveAddress: string
  donorName: string
  organizationName: string
  organizationAddress: string
  chatRoomId: number | null
}
export type AcceptMatchResponse = {
  matchId: number
  status: string
  chatRoomId: number
  respondedAt: string | null
}
export type MatchStateResponse = {
  matchId: number
  status: string
  canceledAt?: string | null
  quantity?: number
  reservedAt?: string | null
  respondedAt?: string | null
  completedAt?: string | null
  initialQuantity?: number
  deliveryMethod?: string
  scheduledAt?: string | null
  deliveryPlace?: string | null
  receiverName?: string | null
}
export type UpdateMatchQuantityRequest = { quantity: number }
export type CancelMatchRequest = { reason: string }
export type UpdateMatchAppointmentRequest = {
  deliveryMethod: string
  scheduledAt: string
  deliveryPlace: string
  receiverName: string
}
