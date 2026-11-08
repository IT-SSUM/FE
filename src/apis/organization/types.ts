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
