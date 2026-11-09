import axiosInstance from '@/apis/axios'
import type {
  ApiResponse,
  OrganizationDetail,
  OrganizationProfile,
  UpdateOrganizationProfileRequest,
} from './types'

export async function getOrganizationProfile() {
  const response = await axiosInstance.get<ApiResponse<OrganizationProfile>>(
    '/api/organizations/me',
  )

  return response.data.data
}

export async function getOrganizationDetail(
  organizationId: number,
  signal?: AbortSignal,
) {
  if (!Number.isSafeInteger(organizationId) || organizationId <= 0) {
    throw new Error('올바른 기관 번호가 필요합니다.')
  }

  const response = await axiosInstance.get<ApiResponse<OrganizationDetail>>(
    `/api/organizations/${organizationId}`,
    { signal },
  )

  return response.data.data
}

export async function updateOrganizationProfile(
  request: UpdateOrganizationProfileRequest,
) {
  const response = await axiosInstance.patch<ApiResponse<OrganizationProfile>>(
    '/api/organizations/me',
    request,
  )

  return response.data.data
}