import type { ItemConditionCode } from '@/types/item'

export type CreateDonationItemRequest = {
  categoryId: number
  itemName: string
  quantity: number
  unit: string
  conditionGrade: ItemConditionCode
  description: string
  imageKeys: string[]
  pickupAddress: string
  pickupAddressDetail: string
  regionId: number
}

export type DonationItemDetail = {
  donationItemId: number
  status: string

  categoryId: number
  categoryName: string

  itemName: string

  quantity: number
  reservedQuantity: number
  completedQuantity: number
  availableQuantity: number

  unit: string
  conditionGrade: ItemConditionCode

  description: string

  regionName: string

  imageUrls: string[]
  imageKeys: string[]

  createdAt: string

  mine: boolean

  donorId: number
  donorName: string
  donorIntroduction: string

  pickupAddress: string
  pickupAddressDetail: string
}

export type DonationItemListItem = {
  donationItemId: number
  itemName: string
  availableQuantity: number
  unit: string

  donorName: string
  regionName: string

  conditionGrade: ItemConditionCode

  imageUrl: string
  createdAt: string
}

export type DonationItemListResponse = {
  items: DonationItemListItem[]
  nextCursor: number | null
  hasNext: boolean
}

export type DonationItemListParams = {
  keyword?: string
  categoryId?: number
  regionId?: number
  condition?: ItemConditionCode
  beforeId?: number
  size?: number
}