import { useQuery } from '@tanstack/react-query'
import { getOrganizationDetail } from '@/apis/organization'

export const organizationDetailKeys = {
  all: ['organization', 'detail'] as const,

  detail: (organizationId: number | null) =>
    [...organizationDetailKeys.all, organizationId] as const,
}

export function useOrganizationDetail(
  organizationId: number | null,
) {
  return useQuery({
    queryKey: organizationDetailKeys.detail(organizationId),

    queryFn: ({ signal }) =>
      getOrganizationDetail(
        organizationId as number,
        signal,
      ),

    enabled: organizationId !== null,

    staleTime: 1000 * 60 * 5,
  })
}