import { useQuery } from '@tanstack/react-query'
import { getDonationItem } from '@/apis/donationItem'
import { donationItemKeys } from '@/hooks/queries/useDonationItemsQuery'
import { getDonationItemFailure } from '@/features/donor/donationItemApiState'

export function useDonationItemQuery(donationItemId: number | null) {
  return useQuery({
    queryKey: donationItemKeys.detail(donationItemId),
    enabled: donationItemId !== null,
    queryFn: ({ signal }) => {
      if (donationItemId === null) throw new Error('올바른 물품 번호가 필요합니다.')
      return getDonationItem(donationItemId, signal)
    },
    staleTime: 1000 * 60,
    retry: (count, error) => {
      const { status, code } = getDonationItemFailure(error)
      if ((status && status >= 400 && status < 500) || code.startsWith('ITEM_')) return false
      return count < 1
    },
  })
}
