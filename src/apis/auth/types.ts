export type ApiResponse<T> = {
  success: boolean
  code: string
  message: string
  data: T
  fieldErrors?: Array<{ field?: string; reason?: string }>
}

export type AuthSession = {
  userId: number
  role: 'DONOR' | 'ORGANIZATION'
  accessToken: string
  refreshToken: string
}

export type DonorSignUpRequest = {
  emailVerificationToken: string
  email: string
  password: string
  name: string
  birthDate: string
  phone: string
  regionId?: number
  agreedTerms: Array<'SERVICE' | 'PRIVACY'>
}

export type OrganizationSignUpRequest = {
  emailVerificationToken: string
  businessVerificationToken: string
  email: string
  password: string
  name: string
  representativeName: string
  businessNumber: string
  openingDate: string
  phone: string
  address: string
  addressDetail?: string
  agreedTerms: Array<'SERVICE' | 'PRIVACY' | 'ORG_ELIGIBILITY'>
}
