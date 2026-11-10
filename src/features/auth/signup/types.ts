export type SignupRole = 'donor' | 'organization'
export type SignupStep = 'profile' | 'account' | 'business' | 'eligibility' | 'agreements'

export type SignupField = {
  name: string
  label: string
  placeholder: string
  type?: string
  required?: boolean
}

export type SignupValues = Record<string, string>
export type SignupAgreements = Record<string, boolean>
