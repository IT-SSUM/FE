import axios, { type AxiosError } from 'axios'
import type { ApiResponse } from './types'

export function getOrganizationErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback
  const response = (error as AxiosError<ApiResponse<unknown>>).response?.data
  const fieldMessage = response?.fieldErrors?.find((item) => item.reason)?.reason
  return fieldMessage || response?.message || fallback
}
