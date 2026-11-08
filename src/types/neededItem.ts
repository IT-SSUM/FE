import type { ItemConditionCode } from '@/types/item'

export type CreateNeededItemRequest = {
  categoryId: number
  itemName: string
  requiredQuantity: number
  unit: string
  regionId?: number
  desiredCondition: ItemConditionCode
  description?: string
  referenceImageKey?: string
}

export type CreateNeededItemInput = Omit<CreateNeededItemRequest, 'referenceImageKey'> & {
  referenceImage?: string
}

export type UpdateNeededItemRequest = {
  description?: string
  receiveAddress?: string
  referenceImageKey?: string
}

export type NeededItemDetail = {
  neededItemId: number
  status: 'RECRUITING' | 'FULL' | 'CLOSED'
  categoryId: number
  categoryName: string
  itemName: string
  requiredQuantity: number
  reservedQuantity: number
  receivedQuantity: number
  availableQuantity: number
  unit: string
  desiredCondition: ItemConditionCode
  description: string | null
  regionName: string
  referenceImageUrl: string | null
  createdAt: string
  mine: boolean
  organizationId: number
  organizationName: string
  verificationStatus: 'VERIFIED' | 'SUSPENDED'
  organizationAddress: string
  organizationIntroduction: string | null
  receiveAddress: string | null
  referenceImageKey: string | null
}

export type PresignedImageUpload = {
  objectKey: string
  uploadUrl: string
  requiredHeaders: Record<string, string>
}

export type MyNeededItem = {
  neededItemId: number
  itemName: string
  requiredQuantity: number
  reservedQuantity: number
  receivedQuantity: number
  availableQuantity: number
  unit: string
  status: 'RECRUITING' | 'FULL' | 'CLOSED'
  categoryId: number
  categoryName: string
  referenceImageUrl: string | null
  createdAt: string
}

export type MyNeededItemPage = {
  items: MyNeededItem[]
  nextCursor: number | null
  hasNext: boolean
}
