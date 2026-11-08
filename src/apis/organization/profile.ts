import axiosInstance from '@/apis/axios'
import type { ApiResponse, OrganizationProfile, UpdateOrganizationProfileRequest } from './types'

export async function getOrganizationProfile() {
  const response = await axiosInstance.get<ApiResponse<OrganizationProfile>>('/api/organizations/me')
  return response.data.data
}

export async function updateOrganizationProfile(request: UpdateOrganizationProfileRequest) {
  const response = await axiosInstance.patch<ApiResponse<OrganizationProfile>>(
    '/api/organizations/me',
    request,
  )
  return response.data.data
}
