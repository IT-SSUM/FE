import axiosInstance from '@/apis/axios'
import type { ApiResponse, AuthSession, DonorSignUpRequest, OrganizationSignUpRequest } from './types'

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
