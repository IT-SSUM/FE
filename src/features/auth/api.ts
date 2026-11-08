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

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  AUTH_400_5: '사업자번호, 개업일자 또는 대표자명이 국세청 등록 정보와 일치하지 않아요.',
  AUTH_400_6: '휴업 또는 폐업 상태인 사업자는 기관 회원으로 가입할 수 없어요.',
  AUTH_409_1: '이미 가입된 사업자번호예요. 기존 기관 계정으로 로그인해 주세요.',
  AUTH_503_1: '현재 국세청 사업자 확인 서비스를 이용할 수 없어요. 잠시 후 다시 시도해 주세요.',
}

const SERVER_ERROR_CODE_PATTERN = /\b[A-Z]+_\d+(?:_\d+)?\b/

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

export async function login(request: { email: string; password: string }) {
  const response = await axiosInstance.post<ApiResponse<AuthSession>>(
    '/api/auth/login',
    request,
  )
  return unwrap(response)
}

export function getAuthErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback

  const response = (error as AxiosError<ApiResponse<unknown>>).response?.data
  const mappedMessage = response?.code ? AUTH_ERROR_MESSAGES[response.code] : undefined
  const fieldMessage = response?.fieldErrors?.find((item) => item.reason)?.reason

  if (mappedMessage) return mappedMessage
  if (fieldMessage && !SERVER_ERROR_CODE_PATTERN.test(fieldMessage)) return fieldMessage
  if (response?.message && !SERVER_ERROR_CODE_PATTERN.test(response.message)) return response.message
  return fallback
}
