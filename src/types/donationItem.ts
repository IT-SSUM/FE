import type {
  ItemConditionCode,
} from '@/types/item'

export type DonationItemStatus =
  | 'RECRUITING'
  | 'FULL'
  | 'COMPLETED'

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

export type CreateDonationItemInput =
  Omit<
    CreateDonationItemRequest,
    'imageKeys'
  > & {
    images: string[]
  }

export type PresignedDonationImage = {
  objectKey: string
  uploadUrl: string
  requiredHeaders: Record<
    string,
    string
  >
}

export type UpdateDonationItemRequest = {
  description?: string
  pickupAddress?: string
  pickupAddressDetail?: string
  imageKeys?: string[]
}

export type DonationItemDetail = {
  donationItemId: number

  status:
    DonationItemStatus

  categoryId: number
  categoryName: string

  itemName: string

  quantity: number
  reservedQuantity: number
  completedQuantity: number
  availableQuantity: number

  unit: string

  conditionGrade:
    ItemConditionCode

  description: string

  regionName: string

  imageUrls: string[]

  imageKeys?:
    | string[]
    | null

  createdAt: string

  mine: boolean

  donorId: number
  donorName: string
  donorIntroduction: string

  pickupAddress?:
    | string
    | null

  pickupAddressDetail?:
    | string
    | null
}

export type DonationItemListItem = {
  donationItemId: number
  itemName: string
  availableQuantity: number
  unit: string

  donorName: string
  regionName: string

  conditionGrade:
    ItemConditionCode

  imageUrl:
    | string
    | null

  createdAt: string
}

export type DonationItemListResponse = {
  items:
    DonationItemListItem[]

  nextCursor:
    | number
    | null

  hasNext: boolean
}

export type DonationItemListParams = {
  keyword?: string
  categoryId?: number
  regionId?: number

  condition?:
    ItemConditionCode

  beforeId?: number
  size?: number
}

/*
 * GET /api/donors/me/donation-items
 *
 * 내 기부 물품 관리 화면에서 사용하는
 * 서버 목록 타입입니다.
 */
export type MyDonationItem = {
  donationItemId: number

  status:
    DonationItemStatus

  itemName: string

  quantity: number

  reservedQuantity?: number
  completedQuantity?: number

  availableQuantity: number

  unit: string

  categoryId?: number
  categoryName?: string

  conditionGrade?:
    ItemConditionCode

  regionName?: string

  imageUrl?:
    | string
    | null

  imageUrls?: string[]

  createdAt: string
}

export type MyDonationItemPage = {
  items:
    MyDonationItem[]

  nextCursor:
    | number
    | null

  hasNext: boolean
}