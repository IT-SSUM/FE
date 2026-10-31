import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/common/Badge/Badge'
import { Button } from '@/components/common/Button/Button'
import { Dialog } from '@/components/common/Dialog/Dialog'
import { ROUTES, routePath } from '@/routes/paths'
import { availableQuantity, canEdit, titleOf } from '@/features/donor/model'
import { useDonorStore } from '@/features/donor/store'
import { DonorPage, EmptyState } from '@/features/donor/DonorPage'

export function DonationDetailPage() {
  const { donationId } = useParams()
  const navigate = useNavigate()
  const item = useDonorStore((state) => state.data.donations.find((row) => row.id === donationId))
  const remove = useDonorStore((state) => state.remove)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  if (!item) return <DonorPage title="기부 물품 상세" back={ROUTES.donor.myItems}><EmptyState title="삭제되었거나 존재하지 않는 물품이에요" to={ROUTES.donor.myItems} label="내 물품 보기" /></DonorPage>
  const editable = canEdit(item)
  return <DonorPage title="기부 물품 상세" back={ROUTES.donor.myItems} footer={
    <footer className="grid grid-cols-2 gap-2 border-t border-neutral-200 px-5 py-4">
      {availableQuantity(item) > 0 ? <Button className="col-span-2" onClick={() => navigate(routePath.donorRecommendation(item.id))}>추천 기관 보기</Button> : null}
      <Button variant="secondary" disabled={!editable} onClick={() => setOpen(true)}>삭제</Button>
      <Button disabled={!editable} onClick={() => navigate(routePath.donorDonationEdit(item.id))}>수정</Button>
    </footer>
  }>
    <div className="flex items-start justify-between gap-2"><h2 className="typography-heading-2">{titleOf(item)}</h2><Badge variant={item.status} /></div>
    <p className="typography-body-2 text-neutral-700">{item.category} · {item.location}</p>
    <div className="flex gap-2 overflow-x-auto">{item.photos.map((photo, index) => <img key={index} src={photo} alt={`물품 사진 ${index + 1}`} className="h-52 w-full shrink-0 rounded-card object-contain bg-white" />)}</div>
    <dl className="space-y-2 rounded-card border border-neutral-200 bg-white p-4">
      {[['전체 수량', `${item.quantity}개`], ['예약 수량', `${item.reserved}개`], ['남은 수량', `${availableQuantity(item)}개`], ['상태', item.condition], ['수령 기간', `${item.startDate} ~ ${item.endDate}`], ...(item.status === 'complete' ? [['수령 기관', item.recipient ?? '정보 없음'], ['완료일', item.completedAt ?? '정보 없음']] : [])].map(([label, value]) => <div key={label} className="grid grid-cols-[88px_1fr] gap-2"><dt className="text-neutral-700">{label}</dt><dd>{value}</dd></div>)}
    </dl>
    {item.description ? <section><h3 className="typography-title-3">상세 설명</h3><p className="mt-2 whitespace-pre-wrap break-words">{item.description}</p></section> : null}
    {!editable ? <p className="typography-label-2 text-neutral-700">예약 중이거나 완료된 물품은 수정·삭제할 수 없어요.</p> : null}
    {error ? <p role="alert" className="text-error">{error}</p> : null}
    <Dialog open={open} title="물품을 삭제할까요?" description="삭제한 물품과 해당 물품의 기관 선택 내역은 복구할 수 없어요." confirmText="삭제하기" onCancel={() => setOpen(false)} onConfirm={() => {
      try { remove(item.id); navigate(ROUTES.donor.myItems, { replace: true }) }
      catch (cause) { setError(cause instanceof Error ? cause.message : '삭제하지 못했어요.'); setOpen(false) }
    }} />
  </DonorPage>
}
