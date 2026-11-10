import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/common/Badge/Badge'
import { Button } from '@/components/common/Button/Button'
import { Dialog } from '@/components/common/Dialog/Dialog'
import { ROUTES, routePath } from '@/routes/paths'
import { DonorPage, EmptyState } from '@/features/donor/DonorPage'
import { conditionLabel, getDonationItemFailure, parseDonationItemId } from '@/features/donor/donationItemApiState'
import { useDonationItemQuery } from '@/hooks/queries/useDonationItemQuery'
import { useDeleteDonationItemMutation } from '@/hooks/mutations/useDeleteDonationItemMutation'

export function DonationDetailPage() {
  const { donationId } = useParams()
  const id = parseDonationItemId(donationId)
  const query = useDonationItemQuery(id)
  const remove = useDeleteDonationItemMutation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const deleting = useRef(false)
  const frame = { title: '기부 물품 상세', back: ROUTES.donor.myItems, mode: 'server' as const }

  if (id === null) return <DonorPage {...frame}><EmptyState title="올바른 서버 물품 번호가 필요해요" to={ROUTES.donor.myItems} label="내 물품 보기" /></DonorPage>
  if (query.isError) {
    const failure = getDonationItemFailure(query.error)
    return <DonorPage {...frame}>
      <p role="alert" className="text-error">{failure.message}</p>
      <Button variant="secondary" disabled={query.isFetching} onClick={() => { void query.refetch() }}>다시 시도</Button>
    </DonorPage>
  }
  if (query.isPending) return <DonorPage {...frame}><p role="status">{query.isPaused ? '네트워크 연결을 기다리고 있어요.' : '물품 정보를 불러오고 있어요.'}</p></DonorPage>
  const item = query.data
  if (!item) return <DonorPage {...frame}><EmptyState title="물품 정보를 찾을 수 없어요" to={ROUTES.donor.myItems} label="내 물품 보기" /></DonorPage>

  return <DonorPage {...frame} footer={item.mine ?
    <footer className="grid grid-cols-2 gap-2 border-t border-neutral-200 px-5 py-4">
      <Button variant="secondary" disabled={remove.isPending} onClick={() => { setError(''); setOpen(true) }}>삭제</Button>
      <Button disabled={remove.isPending} onClick={() => navigate(routePath.donorDonationEdit(String(id)))}>수정</Button>
    </footer> : undefined
  }>
    <div className="flex items-start justify-between gap-2">
      <h2 className="typography-heading-2">{item.itemName} {item.quantity}{item.unit}</h2>
      <Badge variant="waiting">{item.status === 'RECRUITING' ? '모집 중' : item.status}</Badge>
    </div>
    <p className="typography-body-2 text-neutral-700">{item.categoryName} · {item.regionName}</p>
    <div className="flex gap-2 overflow-x-auto">{item.imageUrls.map((photo, index) =>
      <img key={`${photo}-${index}`} src={photo} alt={`물품 사진 ${index + 1}`} className="h-52 w-full shrink-0 rounded-card object-contain bg-white" />
    )}</div>
    {item.imageUrls.length === 0 ? <p className="typography-body-2 text-neutral-700">등록된 사진이 없어요.</p> : null}
    <dl className="space-y-2 rounded-card border border-neutral-200 bg-white p-4">
      {[
        ['전체 수량', `${item.quantity}${item.unit}`],
        ['예약 수량', `${item.reservedQuantity}${item.unit}`],
        ['전달 완료', `${item.completedQuantity}${item.unit}`],
        ['남은 수량', `${item.availableQuantity}${item.unit}`],
        ['물품 상태', conditionLabel[item.conditionGrade] ?? item.conditionGrade],
        ['기부자', item.donorName],
        ...(item.mine ? [['수령 주소', item.pickupAddress ?? '정보 없음'], ['상세 주소', item.pickupAddressDetail || '입력 없음']] : []),
      ].map(([label, value]) => <div key={label} className="grid grid-cols-[88px_1fr] gap-2"><dt className="text-neutral-700">{label}</dt><dd className="break-words">{value}</dd></div>)}
    </dl>
    {item.description ? <section><h3 className="typography-title-3">상세 설명</h3><p className="mt-2 whitespace-pre-wrap break-words">{item.description}</p></section> : null}
    {item.donorIntroduction ? <section><h3 className="typography-title-3">기부자 소개</h3><p className="mt-2 whitespace-pre-wrap break-words">{item.donorIntroduction}</p></section> : null}
    {item.mine ? <p className="typography-label-2 text-neutral-700">설명과 수령 주소를 수정할 수 있어요. 응답 대기 요청이나 진행 중인 거래가 있으면 삭제가 제한됩니다.</p> : null}
    {error ? <p role="alert" className="text-error">{error}</p> : null}
    <Dialog open={open} title="물품을 삭제할까요?" description="삭제하면 물품을 다시 조회할 수 없어요." confirmText={remove.isPending ? '삭제 중...' : '삭제하기'}
      onCancel={() => { if (!deleting.current) setOpen(false) }}
      onConfirm={async () => {
        if (deleting.current || !item.mine) return
        deleting.current = true
        try {
          await remove.mutateAsync(id)
          navigate(ROUTES.donor.myItems, { replace: true })
        } catch (cause) {
          setError(getDonationItemFailure(cause).message)
          setOpen(false)
        } finally { deleting.current = false }
      }}
    />
  </DonorPage>
}
