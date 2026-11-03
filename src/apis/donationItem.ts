import axiosInstance from '@/apis/axios'
import type { ApiResponse } from '@/types/api'
import type {
  CreateDonationItemRequest,
  DonationItemDetail,
  DonationItemListParams,
  DonationItemListResponse,
} from '@/types/donationItem'

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

  return response.data.data
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

  return response.data.data
}