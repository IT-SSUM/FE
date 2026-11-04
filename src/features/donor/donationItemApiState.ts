import { isAxiosError } from 'axios'
import { DonationItemApiError } from '@/apis/donationItem'
import type { ApiFieldError, ApiResponse } from '@/types/api'
import type { DonationItemDetail, UpdateDonationItemRequest } from '@/types/donationItem'

export function parseDonationItemId(value: string | undefined): number | null {
  if (!value || !/^[1-9]\d*$/.test(value)) return null
  const id = Number(value)
  return Number.isSafeInteger(id) ? id : null
}

export function getDonationItemFailure(error: unknown) {
  const response = isAxiosError<Partial<ApiResponse<unknown>>>(error)
    ? error.response : undefined
  const body = error instanceof DonationItemApiError ? error : response?.data
  const code = body?.code ?? ''
  const status = response?.status
  let message = '기부 물품 요청을 처리하지 못했어요. 다시 시도해 주세요.'
  if (status === 401) message = '로그인이 필요하거나 인증이 만료됐어요. 로그인 후 다시 시도해 주세요.'
  else if (status === 403 || code === 'ITEM_403') message = '이 물품에 접근하거나 변경할 권한이 없어요.'
  else if (status === 404 || code === 'ITEM_404') message = '삭제되었거나 존재하지 않는 물품이에요.'
  else if (status === 409 || code === 'ITEM_409') message = '응답 대기 중인 제안·요청이나 진행 중인 거래가 있어 삭제할 수 없어요.'
  else if (body?.message) message = body.message
  const fieldErrors: ApiFieldError[] = Array.isArray(body?.fieldErrors)
    ? body.fieldErrors.filter((field) => typeof field?.field === 'string' && typeof field?.reason === 'string') : []
  return { code, status, message, fieldErrors, notFound: status === 404 || code === 'ITEM_404' }
}

export type DonationItemEditDraft = {
  description: string
  pickupAddress: string
  pickupAddressDetail: string
}

export function donationItemDraft(item: DonationItemDetail): DonationItemEditDraft {
  return {
    description: item.description ?? '',
    pickupAddress: item.pickupAddress ?? '',
    pickupAddressDetail: item.pickupAddressDetail ?? '',
  }
}

// 사진 업로드를 연결하기 전에는 imageKeys를 보내지 않아 서버 사진을 그대로 유지합니다.
export function donationItemPatch(
  original: DonationItemEditDraft,
  draft: DonationItemEditDraft,
): UpdateDonationItemRequest {
  const patch: UpdateDonationItemRequest = {}
  for (const key of ['description', 'pickupAddress', 'pickupAddressDetail'] as const) {
    if (original[key] !== draft[key]) patch[key] = draft[key]
  }
  return patch
}

export const conditionLabel = { HIGH: '상 · 미개봉', MID: '중 · 처음 상태와 유사', LOW: '하 · 다회 사용' }
