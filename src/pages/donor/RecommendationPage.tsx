import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { Button } from '@/components/common/Button/Button'
import { Dialog } from '@/components/common/Dialog/Dialog'
import { ROUTES, routePath } from '@/routes/paths'
import { getRecommendation, organizations } from './recommendations'
import { useRecipientSelection } from './useRecipientSelection'

export function RecommendationPage() {
  const { donationId = '', organizationId } = useParams()
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const donation = getRecommendation(donationId)
  const organization = organizations.find((item) => item.id === organizationId)
  const selection = useRecipientSelection((state) => state.selections[donationId])
  const selectRecipient = useRecipientSelection((state) => state.selectRecipient)
  const selectedOrganization = organizations.find((item) => item.id === selection?.organizationId)
  const invalid = !donation || (organizationId && !organization)

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 items-center gap-2 px-5">
        <button type="button" aria-label="뒤로가기"
          onClick={() => navigate(organizationId ? routePath.donorRecommendation(donationId) : ROUTES.donor.myItems)}
          className="flex size-8 items-center justify-center text-primary-700"
        ><ChevronLeft aria-hidden size={24} /></button>
        <h1 className="typography-title-3 text-neutral-900">{organizationId ? '추천 기관 상세' : '기관 추천'}</h1>
      </header>
      <main className="flex-1 px-5 pb-6 pt-2">
        {invalid ? (
          <section className="rounded-card border border-neutral-200 bg-white p-5">
            <h2 className="typography-title-2">추천 정보를 찾을 수 없어요</h2>
            <p className="mt-2 typography-body-2 text-neutral-700">완료된 물품이거나 유효하지 않은 주소입니다.</p>
            <Link to={ROUTES.donor.myItems} className="mt-4 inline-block text-primary-700">내 물품으로 돌아가기</Link>
          </section>
        ) : (
          <>
            <h2 className="typography-heading-2 text-neutral-900">{organization ? organization.name : '나눔이 필요한 곳을 찾았어요'}</h2>
            <p className="mt-2 typography-body-2 text-neutral-700">{donation.title} · 전달 가능 {donation.quantity}{donation.unit}</p>
            <p className="mt-2 typography-label-2 text-neutral-700">샘플 추천입니다. 기관 선택은 이 브라우저 세션에만 저장되며 실제 매칭은 진행되지 않습니다.</p>
            {selectedOrganization ? (
              <section role="status" className="mt-4 rounded-card bg-primary-100 p-4">
                <h3 className="typography-title-3 text-primary-700">선택한 기관 · {selectedOrganization.name}</h3>
                <p className="mt-2 typography-body-2">{donation.title} {selection.quantity}{donation.unit} · 매칭 전</p>
              </section>
            ) : null}
            <div className="mt-4 flex flex-col gap-4">
              {(organization ? [organization] : organizations).map((item) => (
                <article key={item.id} className="rounded-card border border-neutral-200 bg-white p-4">
                  <h3 className="typography-title-2 text-neutral-900"><span className="text-primary-700">{item.rank}순위</span> · {item.name}</h3>
                  <p className="mt-2 typography-label-2 text-neutral-700">{item.address}</p>
                  <p className="mt-2 typography-body-2">필요 물품 {donation.title} {donation.quantity}{donation.unit} · 희망 상태 중 이상</p>
                  <p className="mt-2 typography-body-2 text-neutral-700">추천 이유 · {item.reason}</p>
                  {organization ? (
                    <>
                      <h4 className="mt-5 typography-title-3">기관 소개</h4>
                      <p className="mt-2 typography-body-2 text-neutral-700">{item.introduction}</p>
                      <p className="mt-3 typography-label-2 text-neutral-700">연락처: 등록된 정보가 없습니다.</p>
                    </>
                  ) : (
                    <div className="mt-3 text-right">
                      <Link to={routePath.donorRecommendedOrganization(donationId, item.id)} aria-label={`${item.name} 상세보기`} className="inline-block py-2 typography-label-1 text-primary-700">기관 상세보기 →</Link>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </>
        )}
      </main>
      {!invalid && organization ? (
        <footer className="border-t border-neutral-200 px-5 py-4">
          <Button className="w-full" disabled={selection?.organizationId === organization.id} onClick={() => setConfirmOpen(true)}>
            {selection?.organizationId === organization.id ? '선택한 기관입니다' : selectedOrganization ? '이 기관으로 변경하기' : '이 기관 선택하기'}
          </Button>
        </footer>
      ) : <BottomNavigation activeItem="explore" />}
      <Dialog open={confirmOpen && Boolean(organization && donation)}
        title={`${organization?.name ?? ''}을 선택할까요?`}
        description={`${donation?.title ?? ''} ${donation?.quantity ?? ''}${donation?.unit ?? ''}의 수혜기관으로 선택합니다.${selectedOrganization ? ' 기존 선택은 변경됩니다.' : ''} 실제 매칭은 아직 진행되지 않습니다.`}
        confirmText="기관 선택 확인" cancelText="다시 검토하기"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (!organization || !donation) return
          selectRecipient(donationId, organization.id)
          setConfirmOpen(false)
          navigate(routePath.donorRecommendation(donationId), { replace: true })
        }}
      />
    </div>
  )
}
