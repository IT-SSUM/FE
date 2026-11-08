import axios, { type AxiosError } from 'axios'
import axiosInstance from '@/apis/axios'
import type { AuthSession } from './storage'

type ApiResponse<T> = {
  success: boolean
  code: string
  message: string
  data: T
  fieldErrors?: Array<{ field?: string; reason?: string }>
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

function unwrap<T>(response: { data: ApiResponse<T> }) {
  return response.data.data
}

export async function sendEmailVerification(email: string) {
  const response = await axiosInstance.post<ApiResponse<{ expiresInSeconds: number }>>(
    '/api/auth/email-verifications',
    { email },
  )
  return unwrap(response)
}

export async function confirmEmailVerification(email: string, code: string) {
  const response = await axiosInstance.post<ApiResponse<{ emailVerificationToken: string }>>(
    '/api/auth/email-verifications/confirm',
    { email, code },
  )
  return unwrap(response)
}

export async function verifyBusiness(request: {
  businessNumber: string
  openingDate: string
  representativeName: string
}) {
  const response = await axiosInstance.post<ApiResponse<{ businessVerificationToken: string }>>(
    '/api/auth/organizations/business-verifications',
    request,
  )
  return unwrap(response)
}

export async function signUpDonor(request: DonorSignUpRequest) {
  const response = await axiosInstance.post<ApiResponse<AuthSession>>(
    '/api/auth/donors/sign-up',
    request,
  )
  return unwrap(response)
}

export async function signUpOrganization(request: OrganizationSignUpRequest) {
  const response = await axiosInstance.post<ApiResponse<AuthSession>>(
    '/api/auth/organizations/sign-up',
    request,
  )
  return unwrap(response)
}

export function getAuthErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback

  const response = (error as AxiosError<ApiResponse<unknown>>).response?.data
  const fieldMessage = response?.fieldErrors?.find((item) => item.reason)?.reason
  return fieldMessage || response?.message || fallback
}
