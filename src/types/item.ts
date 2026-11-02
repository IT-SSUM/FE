export type ItemConditionCode = 'HIGH' | 'MID' | 'LOW'

export type ItemCondition = {
  code: ItemConditionCode
  description: string
}