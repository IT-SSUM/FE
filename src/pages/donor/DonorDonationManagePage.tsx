import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Package } from 'lucide-react'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { ItemRow } from '@/components/item/ItemRow/ItemRow'
import { ROUTES, routePath } from '@/routes/paths'
import { useDonorStore } from '@/features/donor/store'
import { availableQuantity, titleOf } from '@/features/donor/model'
import { DonorPage, EmptyState } from '@/features/donor/DonorPage'

export function DonorDonationManagePage() {
  const items = useDonorStore((state) => state.data.donations)
  const [params, setParams] = useSearchParams()
  const filter = params.get('status') ?? ''
  const navigate = useNavigate()
  const filtered = items.filter((item) => !filter || item.status === filter)
  return <DonorPage title="등록한 물품 관리" back={ROUTES.donor.myPage} footer={<BottomNavigation activeItem="my" />}>
    <section className="flex items-center justify-between rounded-card bg-primary-100 p-4"><h2 className="typography-title-2">등록 물품 {items.length}개</h2><Link to={ROUTES.donor.donationNew} className="text-primary-700">물품 등록</Link></section>
    <div className="flex flex-wrap gap-2">{[['', '전체'], ['waiting', '대기'], ['progress', '진행 중'], ['complete', '완료']].map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setParams(value ? { status: value } : {}, { replace: true })} className={`rounded-pill border border-neutral-200 px-3 py-2 ${filter === value ? 'bg-primary-100 text-primary-700' : 'bg-white'}`}>{label} {items.filter((item) => !value || item.status === value).length}</button>)}</div>
    <p role="status" className="typography-label-2 text-neutral-700">{filtered.length}개 물품</p>
    {filtered.length ? filtered.map((item) => <ItemRow key={item.id} title={titleOf(item)} description={`${item.category} · ${item.location} · 남은 ${availableQuantity(item)}개`} status={item.status} statusType="badge" icon={<Package aria-hidden size={28} />} onClick={() => navigate(routePath.donorDonationDetail(item.id))} />) : <EmptyState title="등록된 물품이 없어요" to={ROUTES.donor.donationNew} label="물품 등록하기" />}
  </DonorPage>
}
