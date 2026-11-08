import axios, { type AxiosError } from 'axios'
import axiosInstance from '@/apis/axios'
import type { ApiFieldError, ApiResponse } from '@/types/api'
import type {
  CreateNeededItemRequest,
  MyNeededItem,
  MyNeededItemPage,
  NeededItemDetail,
  PresignedImageUpload,
} from '@/types/neededItem'

export class NeededItemApiError extends Error {
  readonly code: string
  readonly fieldErrors: ApiFieldError[]

  constructor(response: ApiResponse<unknown>) {
    super(response.message || '필요 물품 요청을 처리하지 못했어요.')
    this.name = 'NeededItemApiError'
    this.code = response.code
    this.fieldErrors = response.fieldErrors ?? []
  }
}

const NEEDED_ITEM_ERROR_MESSAGES: Record<string, string> = {
  ITEM_400: '선택한 물품 정보가 올바르지 않아요. 입력 내용을 다시 확인해 주세요.',
  ITEM_400_1: '참고 사진을 확인하지 못했어요. 사진을 다시 선택해 주세요.',
  ITEM_503: '현재 사진 업로드를 이용할 수 없어요. 잠시 후 다시 시도해 주세요.',
}

const SERVER_ERROR_CODE_PATTERN = /\b[A-Z]+_\d+(?:_\d+)?\b/

function unwrap<T>(response: ApiResponse<T>): T {
  if (!response.success) throw new NeededItemApiError(response)
  return response.data
}

function errorResponse(error: unknown) {
  if (error instanceof NeededItemApiError) {
    return {
      code: error.code,
      message: error.message,
      fieldErrors: error.fieldErrors,
    }
  }
  if (!axios.isAxiosError(error)) return null
  return (error as AxiosError<ApiResponse<unknown>>).response?.data ?? null
}

export function getNeededItemErrorMessage(error: unknown, fallback: string) {
  const response = errorResponse(error)
  if (!response) {
    if (error instanceof Error && !SERVER_ERROR_CODE_PATTERN.test(error.message)) {
      return error.message
    }
    return fallback
  }

  const mappedMessage = response.code
    ? NEEDED_ITEM_ERROR_MESSAGES[response.code]
    : undefined
  const fieldMessage = response.fieldErrors?.find((item) => item.reason)?.reason

  if (mappedMessage) return mappedMessage
  if (fieldMessage && !SERVER_ERROR_CODE_PATTERN.test(fieldMessage)) return fieldMessage
  if (response.message && !SERVER_ERROR_CODE_PATTERN.test(response.message)) return response.message
  return fallback
}

export async function createNeededItem(request: CreateNeededItemRequest) {
  const response = await axiosInstance.post<ApiResponse<NeededItemDetail>>(
    '/api/needed-items',
    request,
  )
  return unwrap(response.data)
}

export async function getAllMyNeededItems(signal?: AbortSignal) {
  const items = new Map<number, MyNeededItem>()
  const seenCursors = new Set<number>()
  let beforeId: number | undefined

  while (true) {
    const response = await axiosInstance.get<ApiResponse<MyNeededItemPage>>(
      '/api/organizations/me/needed-items',
      { params: { beforeId, size: 50 }, signal },
    )
    const page = unwrap(response.data)
    page.items.forEach((item) => items.set(item.neededItemId, item))

    if (!page.hasNext || page.nextCursor === null) break
    if (seenCursors.has(page.nextCursor)) {
      throw new Error('필요 물품 목록을 이어서 불러오지 못했어요.')
    }
    seenCursors.add(page.nextCursor)
    beforeId = page.nextCursor
  }

  return [...items.values()]
}

export async function uploadNeededItemImage(dataUrl: string) {
  const imageResponse = await fetch(dataUrl)
  const image = await imageResponse.blob()
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(image.type)) {
    throw new Error('JPG, PNG, WebP 형식의 사진만 등록할 수 있어요.')
  }

  const presignResponse = await axiosInstance.post<ApiResponse<PresignedImageUpload>>(
    '/api/needed-items/images/presign',
    { contentType: image.type },
  )
  const presigned = unwrap(presignResponse.data)
  const uploadResponse = await fetch(presigned.uploadUrl, {
    method: 'PUT',
    headers: presigned.requiredHeaders,
    body: image,
  })

  if (!uploadResponse.ok) {
    throw new Error('참고 사진을 업로드하지 못했어요. 잠시 후 다시 시도해 주세요.')
  }
  return presigned.objectKey
}
