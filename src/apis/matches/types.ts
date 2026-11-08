export type MatchStatus =
  | 'PENDING'
  | 'TRADING'
  | 'RESERVED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELED'

export type MatchListItem = {
  matchId: number
  requestedBy: 'DONOR' | 'ORGANIZATION'
  status: MatchStatus
  donationItemName: string
  neededItemName: string
  donorName: string
  organizationName: string
  quantity: number
  unit: string
  itemCategoryId: number
  donationItemRegion: string
  neededItemRegion: string
  deliveryMethod: 'DIRECT' | 'PARCEL' | null
  scheduledAt: string | null
  completedAt: string | null
}

export type MatchDetail = {
  matchId: number
  donationItemId: number
  donationItemName: string
  neededItemId: number
  neededItemName: string
  donorId: number
  organizationId: number
  requestedBy: 'DONOR' | 'ORGANIZATION'
  quantity: number
  initialQuantity: number
  message: string
  status: MatchStatus
  deliveryMethod: 'DIRECT' | 'PARCEL' | null
  scheduledAt: string | null
  deliveryPlace: string | null
  receiverName: string | null
  createdAt: string
  respondedAt: string | null
  reservedAt: string | null
  completedAt: string | null
  canceledAt: string | null
  cancelReason: string | null
  itemCategoryId: number
  itemCategoryName: string
  unit: string
  conditionGrade: 'HIGH' | 'MID' | 'LOW'
  donationItemRegion: string
  donationItemAvailableQuantity: number
  neededItemRegion: string
  neededItemAdditionalQuantity: number
  neededItemReceiveAddress: string
  donorName: string
  organizationName: string
  organizationAddress: string
  chatRoomId: number | null
}

export type ApiResponse<T> = {
  success: boolean
  code: string
  message: string
  data: T
  fieldErrors?: Array<{ field?: string; reason?: string }>
}
