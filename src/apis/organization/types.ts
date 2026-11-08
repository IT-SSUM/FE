export type OrganizationProfile = {
  email: string
  name: string
  representativeName: string
  businessNumber: string
  openingDate: string
  phone: string
  address: string
  addressDetail: string
  verificationStatus: 'VERIFIED' | 'SUSPENDED'
}

export type UpdateOrganizationProfileRequest = {
  name?: string
  phone?: string
  address?: string
  addressDetail?: string
}

export type ApiResponse<T> = {
  success: boolean
  code: string
  message: string
  data: T
  fieldErrors?: Array<{ field?: string; reason?: string }>
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

export type MyNeededItemParams = {
  categoryId?: number
  beforeId?: number
  size?: number
}
