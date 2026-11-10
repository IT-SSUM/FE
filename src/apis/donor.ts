import axiosInstance from '@/apis/axios'
import type { ApiResponse } from '@/types/api'
import type {
  DonorProfile,
  UpdateDonorProfileRequest,
} from '@/types/donor'

export async function getDonorProfile(): Promise<DonorProfile> {
  const response =
    await axiosInstance.get<ApiResponse<DonorProfile>>(
      '/api/donors/me',
    )

  return response.data.data
}

export async function updateDonorProfile(
  body: UpdateDonorProfileRequest,
): Promise<DonorProfile> {
  const response =
    await axiosInstance.patch<ApiResponse<DonorProfile>>(
      '/api/donors/me',
      body,
    )

  return response.data.data
}