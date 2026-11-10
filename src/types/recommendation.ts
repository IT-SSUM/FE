import type { ItemConditionCode } from '@/types/item'

export type DonationRecommendation = {
  rank: number

  organizationId: number
  organizationName: string
  organizationAddress: string

  neededItemId: number
  itemName: string

  remainingQuantity: number
  unit: string

  desiredCondition: ItemConditionCode

  score: number
  distanceKm: number

  reason: string | null
}