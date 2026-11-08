import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getOrganizationProfile,
  updateOrganizationProfile,
  type UpdateOrganizationProfileRequest,
} from '@/apis/organization'

export const organizationProfileQueryKey = ['organization', 'profile'] as const

export function useOrganizationProfile() {
  return useQuery({
    queryKey: organizationProfileQueryKey,
    queryFn: getOrganizationProfile,
  })
}

export function useUpdateOrganizationProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: UpdateOrganizationProfileRequest) => updateOrganizationProfile(request),
    onSuccess: (profile) => {
      queryClient.setQueryData(organizationProfileQueryKey, profile)
    },
  })
}
