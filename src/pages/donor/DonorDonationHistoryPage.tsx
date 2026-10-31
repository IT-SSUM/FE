import { useNavigate } from 'react-router-dom'
import { PackageCheck } from 'lucide-react'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { ItemRow } from '@/components/item/ItemRow/ItemRow'
import { ROUTES, routePath } from '@/routes/paths'
import { useDonorStore } from '@/features/donor/store'
import { titleOf } from '@/features/donor/model'
import { DonorPage, EmptyState } from '@/features/donor/DonorPage'
export function DonorDonationHistoryPage() {
  const items = useDonorStore((state) => state.data.donations).filter((item) => item.status === 'complete').sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))
  const navigate = useNavigate()
  return <DonorPage title="기부 내역" back={ROUTES.donor.myPage} footer={<BottomNavigation activeItem="my" />}>
    <h2 className="rounded-card border border-neutral-200 bg-white p-4 typography-title-2">완료된 기부 {items.length}건</h2>
    {items.length ? items.map((item) => <ItemRow key={item.id} title={titleOf(item)} description={`${item.recipient} · ${item.completedAt} 전달 완료`} status="complete" statusType="badge" icon={<PackageCheck aria-hidden size={28} />} onClick={() => navigate(routePath.donorDonationDetail(item.id))} />) : <EmptyState title="아직 완료된 기부가 없어요" to={ROUTES.donor.myItems} label="진행 중인 물품 보기" />}
  </DonorPage>
}
