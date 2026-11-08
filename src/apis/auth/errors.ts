import axios, { type AxiosError } from 'axios'
import type { ApiResponse } from './types'

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  AUTH_400_5: '사업자번호, 개업일자 또는 대표자명이 국세청 등록 정보와 일치하지 않아요.',
  AUTH_400_6: '휴업 또는 폐업 상태인 사업자는 기관 회원으로 가입할 수 없어요.',
  AUTH_409_1: '이미 가입된 사업자번호예요. 기존 기관 계정으로 로그인해 주세요.',
  AUTH_503_1: '현재 국세청 사업자 확인 서비스를 이용할 수 없어요. 잠시 후 다시 시도해 주세요.',
}

const SERVER_ERROR_CODE_PATTERN = /\b[A-Z]+_\d+(?:_\d+)?\b/

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
