import { useMemo, useState, type FormEvent } from 'react'
import { CheckCircle2, ChevronLeft, Package } from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import excitedMascot from '@/assets/images/mascot/excited.svg'
import { matchErrorMessage } from '@/apis/match'
import { Button } from '@/components/common/Button/Button'
import { Input } from '@/components/common/Input/Input'
import { SelectField } from '@/components/common/SelectField/SelectField'
import {
  conditionLabel,
  getDonationItemFailure,
  parseDonationItemId,
} from '@/features/donor/donationItemApiState'
import { useCreateMatchMutation } from '@/hooks/mutations/useCreateMatchMutation'
import { useDonationItemQuery } from '@/hooks/queries/useDonationItemQuery'
import { useMyNeededItemsQuery } from '@/hooks/queries/useMyNeededItemsQuery'
import { ROUTES, routePath } from '@/routes/paths'

export function DonationRequestPage() {
  const navigate = useNavigate()
  const { donationId: donationIdParam } = useParams()
  const [searchParams] = useSearchParams()
  const donationId = parseDonationItemId(donationIdParam)
  const donationQuery = useDonationItemQuery(donationId)
  const neededItemsQuery = useMyNeededItemsQuery()
  const createMatch = useCreateMatchMutation()
  const donation = donationQuery.data

  const compatibleNeeds = useMemo(
    () =>
      (neededItemsQuery.data ?? []).filter(
        (need) =>
          need.status === 'RECRUITING' &&
          need.availableQuantity > 0 &&
          need.categoryId === donation?.categoryId &&
          need.unit === donation.unit,
      ),
    [donation, neededItemsQuery.data],
  )
  const requestedNeedId = parsePositiveId(searchParams.get('needId'))
  const [selectedNeedOverride, setSelectedNeedOverride] = useState<number | null>(null)
  const [quantityInput, setQuantityInput] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [quantityError, setQuantityError] = useState('')
  const [submitError, setSubmitError] = useState('')

  const needOptions = useMemo(
    () =>
      compatibleNeeds.map(
        (need) => `${need.itemName} · ${need.availableQuantity}${need.unit} 필요`,
      ),
    [compatibleNeeds],
  )
  const selectedNeedId =
    compatibleNeeds.find((need) => need.neededItemId === selectedNeedOverride)?.neededItemId ??
    compatibleNeeds.find((need) => need.neededItemId === requestedNeedId)?.neededItemId ??
    compatibleNeeds[0]?.neededItemId ??
    null
  const selectedNeed = compatibleNeeds.find((need) => need.neededItemId === selectedNeedId)
  const selectedNeedLabel = selectedNeed
    ? `${selectedNeed.itemName} · ${selectedNeed.availableQuantity}${selectedNeed.unit} 필요`
    : ''
  const quantity =
    quantityInput ?? (donation ? String(Math.min(10, donation.availableQuantity)) : '')

  const handleQuantityChange = (value: string) => {
    const digits = value.replace(/\D/g, '')
    setQuantityInput(digits.replace(/^0+(?=\d)/, ''))
    setQuantityError('')
    setSubmitError('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!donation || donationId === null || selectedNeedId === null) return

    const requestedQuantity = Number.parseInt(quantity, 10)
    if (!requestedQuantity || requestedQuantity < 1) {
      setQuantityError('요청 수량을 입력해 주세요.')
      return
    }
    const maxQuantity = Math.min(donation.availableQuantity, selectedNeed?.availableQuantity ?? 0)
    if (requestedQuantity > maxQuantity) {
      setQuantityError(`최대 ${maxQuantity}${donation.unit}까지 요청할 수 있어요.`)
      return
    }
    if (message.length > 500) {
      setSubmitError('메시지는 500자 이하로 입력해 주세요.')
      return
    }

    setSubmitError('')
    try {
      const result = await createMatch.mutateAsync({
        donationItemId: donationId,
        neededItemId: selectedNeedId,
        quantity: requestedQuantity,
        message: message.trim(),
      })
      navigate(
        `${routePath.organizationDonationRequestComplete(String(donationId))}?quantity=${requestedQuantity}&matchId=${result.matchId}`,
        { replace: true },
      )
    } catch (error) {
      setSubmitError(matchErrorMessage(error))
    }
  }

  const isPending = donationQuery.isPending || neededItemsQuery.isPending
  const loadError = donationQuery.isError
    ? getDonationItemFailure(donationQuery.error).message
    : neededItemsQuery.isError
      ? '기관의 필요 물품 목록을 불러오지 못했어요.'
      : ''

  return (
    <form className="flex min-h-dvh flex-col bg-surface-canvas" onSubmit={handleSubmit}>
      <PageHeader title="기부 요청" onBack={() => navigate(-1)} />

      {donationId === null ? (
        <RequestState message="올바른 기부 물품 번호가 필요해요." />
      ) : isPending ? (
        <RequestState message="기부 요청 정보를 불러오는 중이에요." />
      ) : loadError ? (
        <RequestState
          message={loadError}
          actionText="다시 시도"
          onAction={() => {
            if (donationQuery.isError) void donationQuery.refetch()
            if (neededItemsQuery.isError) void neededItemsQuery.refetch()
          }}
        />
      ) : donation ? (
        <>
          <main className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
            <p className="typography-body-2 text-neutral-700">{donation.donorName}</p>

            {donation.imageUrls[0] ? (
              <img
                src={donation.imageUrls[0]}
                alt={`${donation.itemName} 기부 물품`}
                className="mt-4 h-40 w-full rounded-card object-cover"
              />
            ) : (
              <div className="mt-4 flex h-40 items-center justify-center rounded-card bg-error-bg text-primary-700">
                <Package aria-hidden size={42} strokeWidth={1.8} />
              </div>
            )}

            <section className="mt-3 rounded-control bg-primary-100 p-4">
              <h2 className="text-sm font-bold leading-5 text-primary-700">
                {donation.itemName} · 신청 가능 수량 {donation.availableQuantity}{donation.unit}
              </h2>
              <p className="mt-2 typography-label-2 text-neutral-700">
                물품 상태 {conditionLabel[donation.conditionGrade]} · {donation.regionName}
              </p>
            </section>

            {compatibleNeeds.length === 0 ? (
              <section className="mt-4 rounded-control border border-neutral-200 bg-white p-4">
                <p className="typography-title-3 text-neutral-900">연결할 수 있는 필요 물품이 없어요.</p>
                <p className="mt-2 typography-label-2 text-neutral-700">
                  같은 카테고리와 단위의 모집 중인 필요 물품을 먼저 등록해 주세요.
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-4 w-full"
                  onClick={() => navigate(ROUTES.organization.needNew)}
                >
                  필요 물품 등록하기
                </Button>
              </section>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="flex w-full flex-col gap-2">
                  <label className="text-xs font-bold leading-[18px] text-neutral-900">
                    연결할 필요 물품
                  </label>
                  <SelectField
                    label="연결할 필요 물품"
                    value={selectedNeedLabel}
                    options={needOptions}
                    onChange={(label) => {
                      const index = needOptions.indexOf(label)
                      setSelectedNeedOverride(compatibleNeeds[index]?.neededItemId ?? null)
                      setSubmitError('')
                    }}
                  />
                </div>
                <Input
                  label="지원받을 물품"
                  value={`${donation.itemName} · 신청 가능 수량 ${donation.availableQuantity}${donation.unit}`}
                  disabled
                  labelClassName="text-xs font-bold leading-[18px]"
                  className="typography-body-2 text-neutral-700"
                />
                <div className="flex w-full flex-col gap-2">
                  <label htmlFor="request-quantity" className="text-xs font-bold leading-[18px] text-neutral-900">
                    요청 수량
                  </label>
                  <div className="relative">
                    <input
                      id="request-quantity"
                      value={quantity}
                      inputMode="numeric"
                      aria-invalid={Boolean(quantityError)}
                      aria-describedby={quantityError ? 'request-quantity-error' : undefined}
                      onChange={(event) => handleQuantityChange(event.target.value)}
                      className="h-[54px] w-full rounded-input border border-neutral-500 bg-white px-4 pr-12 typography-body-2 text-neutral-700 outline-none transition-colors focus:border-primary-700"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 typography-body-2 text-neutral-700">
                      {donation.unit}
                    </span>
                  </div>
                  {quantityError ? (
                    <p id="request-quantity-error" className="typography-label-2 text-error">
                      {quantityError}
                    </p>
                  ) : null}
                </div>
                <Input
                  label="기부자에게 전할 메시지 (선택)"
                  value={message}
                  maxLength={500}
                  labelClassName="text-xs font-bold leading-[18px]"
                  className="typography-body-2 text-neutral-700"
                  onChange={(event) => {
                    setMessage(event.target.value)
                    setSubmitError('')
                  }}
                />
                {submitError ? (
                  <p role="alert" className="typography-label-2 text-error">{submitError}</p>
                ) : null}
              </div>
            )}
          </main>

          <footer className="shrink-0 bg-surface-canvas px-5 pb-4 pt-2">
            <Button
              type="submit"
              className="h-[46px] w-full"
              disabled={
                compatibleNeeds.length === 0 ||
                donation.status !== 'RECRUITING' ||
                donation.availableQuantity <= 0 ||
                createMatch.isPending
              }
            >
              {createMatch.isPending ? '요청 보내는 중...' : '요청 보내기'}
            </Button>
          </footer>
        </>
      ) : null}
    </form>
  )
}

export function DonationRequestCompletePage() {
  const navigate = useNavigate()
  const { donationId: donationIdParam } = useParams()
  const [searchParams] = useSearchParams()
  const donationId = parseDonationItemId(donationIdParam)
  const donationQuery = useDonationItemQuery(donationId)
  const donation = donationQuery.data
  const requestedQuantity = Math.max(Number(searchParams.get('quantity')) || 1, 1)

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <PageHeader
        title="기부 요청 전송 완료"
        onBack={() => navigate(routePath.organizationDonationDetail(donationIdParam ?? ''))}
      />

      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-5">
        <section className="text-center">
          <img src={excitedMascot} alt="" className="mx-auto size-20 object-contain" />
          <h2 className="mt-3 typography-title-2 text-neutral-900">요청을 보냈어요</h2>
          <p className="mt-2 typography-label-2 text-neutral-700">
            {donation
              ? `${donation.donorName}님이 ${donation.itemName} ${requestedQuantity}${donation.unit} 요청을 확인하고 있어요.`
              : '기부자가 요청을 확인하고 있어요.'}
          </p>
        </section>

        {donation ? (
          <section className="mt-8 rounded-card border border-neutral-200 bg-white p-4">
            <h3 className="typography-title-3 text-neutral-900">
              {donation.itemName} {requestedQuantity}{donation.unit}
            </h3>
            <dl className="mt-3 space-y-2 typography-body-2">
              <InfoRow label="물품 상태" value={conditionLabel[donation.conditionGrade]} />
              <InfoRow label="기부자" value={donation.donorName} />
              <InfoRow label="물품 위치" value={donation.regionName} />
            </dl>
          </section>
        ) : null}

        <section className="mt-3 rounded-control bg-primary-100 p-4">
          <div className="flex items-center gap-2 text-primary-700">
            <CheckCircle2 aria-hidden size={20} strokeWidth={2} />
            <h3 className="typography-title-3">응답 대기 · 신청 가능 수량 유지</h3>
          </div>
          <p className="mt-2 typography-label-2 leading-5 text-neutral-700">
            기부자가 요청을 수락하면 거래를 진행할 수 있어요.
          </p>
        </section>
      </main>

      <footer className="shrink-0 bg-surface-canvas px-5 pb-4 pt-2">
        <Button className="h-[46px] w-full" onClick={() => navigate(ROUTES.organization.tradeStatus)}>
          보낸 요청 보기
        </Button>
      </footer>
    </div>
  )
}

function RequestState({
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
        <Button type="button" variant="secondary" className="mt-4" onClick={onAction}>
          {actionText}
        </Button>
      ) : null}
    </main>
  )
}

function parsePositiveId(value: string | null) {
  if (!value || !/^[1-9]\d*$/.test(value)) return null
  const id = Number(value)
  return Number.isSafeInteger(id) ? id : null
}

type PageHeaderProps = { title: string; onBack: () => void }

function PageHeader({ title, onBack }: PageHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 px-5">
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={onBack}
        className="flex size-6 shrink-0 items-center justify-center text-primary-700"
      >
        <ChevronLeft aria-hidden size={24} strokeWidth={2} />
      </button>
      <h1 className="typography-title-3 text-neutral-900">{title}</h1>
    </header>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[72px_1fr] gap-2">
      <dt className="text-neutral-700">{label}</dt>
      <dd className="font-medium text-neutral-900">{value}</dd>
    </div>
  )
}
