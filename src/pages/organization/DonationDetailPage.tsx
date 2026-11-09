import { ChevronLeft, Package } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button/Button'
import {
  conditionLabel,
  getDonationItemFailure,
  parseDonationItemId,
} from '@/features/donor/donationItemApiState'
import { useDonationItemQuery } from '@/hooks/queries/useDonationItemQuery'
import { routePath } from '@/routes/paths'

export function DonationDetailPage() {
  const navigate = useNavigate()
  const { donationId: donationIdParam } = useParams()
  const donationId = parseDonationItemId(donationIdParam)
  const donationQuery = useDonationItemQuery(donationId)
  const donation = donationQuery.data

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 shrink-0 items-center gap-2 px-5">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-6 shrink-0 items-center justify-center text-primary-700"
        >
          <ChevronLeft aria-hidden size={24} strokeWidth={2} />
        </button>
        <h1 className="typography-title-3 text-neutral-900">기부 물품 상세</h1>
      </header>

      {donationId === null ? (
        <DetailState message="올바른 기부 물품 번호가 필요해요." />
      ) : donationQuery.isPending ? (
        <DetailState message="기부 물품을 불러오는 중이에요." />
      ) : donationQuery.isError ? (
        <DetailState
          message={getDonationItemFailure(donationQuery.error).message}
          actionText="다시 시도"
          onAction={() => void donationQuery.refetch()}
        />
      ) : donation ? (
        <>
          <main className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
            <h2 className="typography-heading-3 text-neutral-900">
              {donation.itemName} {donation.availableQuantity}{donation.unit}을 받을 수 있어요
            </h2>
            <p className="mt-2 typography-body-2 font-medium text-neutral-700">
              {donation.donorName} · {donation.regionName}
            </p>

            {donation.imageUrls[0] ? (
              <img
                src={donation.imageUrls[0]}
                alt={`${donation.itemName} 기부 물품`}
                className="mt-4 h-[188px] w-full rounded-card object-cover"
              />
            ) : (
              <div className="mt-4 flex h-[188px] items-center justify-center rounded-card bg-error-bg text-primary-700">
                <Package aria-hidden size={42} strokeWidth={1.8} />
              </div>
            )}

            <section className="mt-4 rounded-card border border-neutral-200 bg-white p-4">
              <dl className="space-y-2 typography-label-1">
                <InfoRow label="물품 품목" value={donation.itemName} />
                <InfoRow
                  label="신청 가능 수량"
                  value={`${donation.availableQuantity}${donation.unit}`}
                />
                <InfoRow
                  label="물품 상태"
                  value={conditionLabel[donation.conditionGrade]}
                />
                <InfoRow label="물품 위치" value={donation.regionName} />
              </dl>
            </section>

            <p className="mt-5 whitespace-pre-wrap typography-body-1 font-medium text-neutral-900">
              {donation.description || '등록된 물품 설명이 없어요.'}
            </p>

            <section className="mt-6">
              <h3 className="typography-title-2 text-neutral-900">기부자 소개</h3>
              <p className="mt-3 whitespace-pre-wrap typography-body-1 font-medium text-neutral-900">
                {donation.donorIntroduction || '등록된 기부자 소개가 없어요.'}
              </p>
            </section>
          </main>

          <footer className="shrink-0 bg-surface-canvas px-5 pb-3 pt-2">
            <Button
              className="h-[46px] w-full"
              disabled={donation.status !== 'RECRUITING' || donation.availableQuantity <= 0}
              onClick={() =>
                navigate(
                  routePath.organizationDonationRequest(String(donation.donationItemId)),
                )
              }
            >
              {donation.availableQuantity > 0 ? '요청하기' : '신청 가능한 수량이 없어요'}
            </Button>
          </footer>
        </>
      ) : null}
    </div>
  )
}

function DetailState({
  message,
  actionText,
  onAction,
}: {
  message: string
  actionText?: string
  onAction?: () => void
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-5 text-center">
      <p className="typography-body-2 text-neutral-700">{message}</p>
      {actionText && onAction ? (
        <Button variant="secondary" className="mt-4" onClick={onAction}>
          {actionText}
        </Button>
      ) : null}
    </main>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-2">
      <dt className="whitespace-nowrap text-neutral-700">{label}</dt>
      <dd className="font-medium text-neutral-900">{value}</dd>
    </div>
  )
}
