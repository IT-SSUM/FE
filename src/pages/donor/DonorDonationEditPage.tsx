import { useParams } from 'react-router-dom'
import { DonationForm } from '@/features/donor/DonationForm'
import { useDonorStore } from '@/features/donor/store'
export function DonorDonationEditPage() {
  const { donationId } = useParams()
  const item = useDonorStore((state) => state.data.donations.find((row) => row.id === donationId))
  return <DonationForm key={donationId} item={item} editing />
}
