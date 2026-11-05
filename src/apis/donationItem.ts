import axiosInstance from '@/apis/axios'
import type { ApiFieldError, ApiResponse } from '@/types/api'
import type {
  CreateDonationItemRequest,
  DonationItemDetail,
  DonationItemListParams,
  DonationItemListResponse,
  UpdateDonationItemRequest,
} from '@/types/donationItem'

export class DonationItemApiError extends Error {
  readonly code: string
  readonly fieldErrors: ApiFieldError[]

  constructor(response: ApiResponse<unknown>) {
    super(response.message || '기부 물품 요청을 처리하지 못했어요.')
    this.name = 'DonationItemApiError'
    this.code = response.code
    this.fieldErrors = response.fieldErrors ?? []
  }
}

function unwrap<T>(response: ApiResponse<T>): T {
  if (!response.success) throw new DonationItemApiError(response)
  return response.data
}

function itemPath(donationItemId: number) {
  if (!Number.isSafeInteger(donationItemId) || donationItemId <= 0) {
    throw new Error('올바른 기부 물품 번호가 필요합니다.')
  }
  return `/api/donation-items/${donationItemId}`
}

export async function getDonationItem(
  donationItemId: number,
  signal?: AbortSignal,
): Promise<DonationItemDetail> {
  const response = await axiosInstance.get<ApiResponse<DonationItemDetail>>(
    itemPath(donationItemId),
    { signal },
  )
  return unwrap(response.data)
}

export async function updateDonationItem(
  donationItemId: number,
  body: UpdateDonationItemRequest,
): Promise<DonationItemDetail> {
  const { description, pickupAddress, pickupAddressDetail, imageKeys } = body
  const response = await axiosInstance.patch<ApiResponse<DonationItemDetail>>(
    itemPath(donationItemId),
    { description, pickupAddress, pickupAddressDetail, imageKeys },
  )
  return unwrap(response.data)
}

export async function deleteDonationItem(donationItemId: number): Promise<void> {
  const response = await axiosInstance.delete<ApiResponse<string | null>>(
    itemPath(donationItemId),
  )
  unwrap(response.data)
}

export async function createDonationItem(
  body: CreateDonationItemRequest,
): Promise<DonationItemDetail> {
  const response =
    await axiosInstance.post<
      ApiResponse<DonationItemDetail>
    >(
      '/api/donation-items',
      body,
    )

  return unwrap(response.data)
}

export async function getDonationItems(
  params: DonationItemListParams = {},
): Promise<DonationItemListResponse> {
  const response =
    await axiosInstance.get<
      ApiResponse<DonationItemListResponse>
    >(
      '/api/donation-items',
      {
        params,
      },
    )

  return unwrap(response.data)
}
