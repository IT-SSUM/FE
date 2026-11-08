import axios, { type AxiosError } from 'axios'

type ErrorResponse = {
  code?: string
  message?: string
  fieldErrors?: Array<{ reason?: string }>
}

const USER_ERROR_MESSAGES: Record<string, string> = {
  USER_409: '응답 대기 중인 제안·요청 또는 진행 중·예약 중인 거래를 먼저 정리해 주세요.',
}

const SERVER_ERROR_CODE_PATTERN = /\b[A-Z]+_\d+(?:_\d+)?\b/

export function getUserErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback

  const response = (error as AxiosError<ErrorResponse>).response?.data
  const mappedMessage = response?.code ? USER_ERROR_MESSAGES[response.code] : undefined
  const fieldMessage = response?.fieldErrors?.find((item) => item.reason)?.reason

  if (mappedMessage) return mappedMessage
  if (fieldMessage && !SERVER_ERROR_CODE_PATTERN.test(fieldMessage)) return fieldMessage
  if (response?.message && !SERVER_ERROR_CODE_PATTERN.test(response.message)) return response.message
  return fallback
}
