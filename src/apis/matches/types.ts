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

export type ApiResponse<T> = {
  success: boolean
  code: string
  message: string
  data: T
  fieldErrors?: Array<{ field?: string; reason?: string }>
}
