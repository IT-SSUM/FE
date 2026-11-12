import { useMemo, useState, type FormEvent } from 'react'
import { Package } from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import boxHappyImage from '@/assets/images/mascot/box-happy.png'
import { matchErrorMessage } from '@/apis/match'
import { getNeededItemErrorMessage } from '@/apis/neededItem'
import { Button } from '@/components/common/Button/Button'
import { SelectField } from '@/components/common/SelectField/SelectField'
import { Textarea } from '@/components/common/Textarea/Textarea'
import { DonorPage } from '@/features/donor/DonorPage'
import { conditionLabel } from '@/features/donor/donationItemApiState'
import { useCreateMatchMutation } from '@/hooks/mutations/useCreateMatchMutation'
import { useDonorDonationItemsQuery } from '@/hooks/queries/useDonorDonationItemsQuery'
import { useDonationItemQuery } from '@/hooks/queries/useDonationItemQuery'
import { useNeededItemQuery } from '@/hooks/queries/useNeededItemQuery'
import { ROUTES, routePath } from '@/routes/paths'
import type { ItemConditionCode } from '@/types/item'

const conditionRank: Record<ItemConditionCode, number> = {
  LOW: 1,
  MID: 2,
  HIGH: 3,
}

export function DonationProposalPage() {
  const navigate = useNavigate()
  const { needId: needIdParam } = useParams()
  const needId = parsePositiveId(needIdParam)
  const needQuery = useNeededItemQuery(needId)
  const donationItemsQuery = useDonorDonationItemsQuery()
  const createMatch = useCreateMatchMutation()
  const need = needQuery.data

  const compatibleItems = useMemo(
    () =>
      (donationItemsQuery.data ?? []).filter((item) => {
        if (
          !need ||
          item.status !== 'RECRUITING' ||
          item.availableQuantity < 1 ||
          item.unit !== need.unit ||
          normalizeItemName(item.itemName) !== normalizeItemName(need.itemName)
        ) {
          return false
        }
        if (item.categoryId !== undefined && item.categoryId !== need.categoryId) return false
        if (
          item.conditionGrade !== undefined &&
          conditionRank[item.conditionGrade] < conditionRank[need.desiredCondition]
        ) {
          return false
        }
        return true
      }),
    [donationItemsQuery.data, need],
  )

  const [selectedItemOverride, setSelectedItemOverride] = useState<number | null>(null)
  const [quantityInput, setQuantityInput] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [quantityError, setQuantityError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const selectedItem =
    compatibleItems.find((item) => item.donationItemId === selectedItemOverride) ??
    compatibleItems[0]
  const itemOptions = compatibleItems.map(
    (item) => `${item.itemName} · 신청 가능 ${item.availableQuantity}${item.unit}`,
  )
  const selectedItemLabel = selectedItem
    ? `${selectedItem.itemName} · 신청 가능 ${selectedItem.availableQuantity}${selectedItem.unit}`
    : ''
  const maximumQuantity = Math.min(
    selectedItem?.availableQuantity ?? 0,
    need?.availableQuantity ?? 0,
  )
  const quantity = quantityInput ?? (maximumQuantity ? String(maximumQuantity) : '')

  const submitProposal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!need || needId === null || !selectedItem) return

    const requestedQuantity = Number(quantity)
    if (!Number.isSafeInteger(requestedQuantity) || requestedQuantity < 1) {
      setQuantityError('제안 수량을 1개 이상 입력해 주세요.')
      return
    }
    if (requestedQuantity > maximumQuantity) {
      setQuantityError(`최대 ${maximumQuantity}${need.unit}까지 제안할 수 있어요.`)
      return
    }

    setSubmitError('')
    try {
      const result = await createMatch.mutateAsync({
        donationItemId: selectedItem.donationItemId,
        neededItemId: needId,
        quantity: requestedQuantity,
        message: message.trim(),
      })
      navigate(
        `${routePath.donorDonationProposalComplete(String(needId))}?matchId=${result.matchId}&donationItemId=${selectedItem.donationItemId}&quantity=${requestedQuantity}`,
        { replace: true },
      )
    } catch (error) {
      setSubmitError(matchErrorMessage(error))
    }
  }

  const isPending = needQuery.isPending || donationItemsQuery.isPending
  const loadError = needQuery.isError
    ? getNeededItemErrorMessage(needQuery.error, '필요 물품 정보를 불러오지 못했어요.')
    : donationItemsQuery.isError
      ? '등록한 기부 물품을 불러오지 못했어요.'
      : ''

  return (
    <DonorPage
      title="기부 제안하기"
      back={needIdParam ? routePath.donorNeedDetail(needIdParam) : ROUTES.donor.needList}
      footer={
        need && compatibleItems.length > 0 ? (
          <footer className="shrink-0 bg-surface-canvas px-5 pb-5 pt-3">
            <Button
              type="submit"
              form="donation-proposal"
              className="w-full"
              disabled={createMatch.isPending}
            >
              {createMatch.isPending ? '제안 중...' : '제안하기'}
            </Button>
          </footer>
        ) : undefined
      }
    >
      {needId === null ? (
        <StateCard message="올바른 필요 물품 번호가 필요해요." />
      ) : isPending ? (
        <StateCard message="제안 정보를 불러오는 중이에요." />
      ) : loadError ? (
        <StateCard
          message={loadError}
          action="다시 시도"
          onAction={() => {
            if (needQuery.isError) void needQuery.refetch()
            if (donationItemsQuery.isError) void donationItemsQuery.refetch()
          }}
        />
      ) : need && compatibleItems.length === 0 ? (
        <section className="rounded-card border border-neutral-200 bg-white p-5 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            <Package aria-hidden size={24} />
          </span>
          <h2 className="mt-3 typography-title-3 text-neutral-900">
            제안할 수 있는 기부 물품이 없어요.
          </h2>
          <p className="mt-2 typography-body-2 text-neutral-700">
            품목·카테고리·단위와 희망 상태가 맞는 물품을 먼저 등록해 주세요.
          </p>
          <Button
            variant="secondary"
            className="mt-4 w-full"
            onClick={() => navigate(`${ROUTES.donor.donationNew}?needId=${need.neededItemId}`)}
          >
            기부 물품 등록하기
          </Button>
        </section>
      ) : need && selectedItem ? (
        <form id="donation-proposal" className="space-y-4" onSubmit={submitProposal}>
          <div>
            <h2 className="typography-heading-2 text-neutral-900">
              필요한 곳에 기부를 제안해요
            </h2>
            <p className="mt-2 typography-body-2 text-neutral-700">
              {need.organizationName}
            </p>
          </div>

          <section className="rounded-card bg-primary-100 p-4">
            <h3 className="typography-title-3 text-primary-700">
              {need.itemName} {need.requiredQuantity}{need.unit} 필요 · 추가 필요 {need.availableQuantity}{need.unit}
            </h3>
            <p className="mt-2 typography-label-2 text-neutral-700">
              희망 상태 {conditionShortLabel(need.desiredCondition)} · {need.regionName}
            </p>
          </section>

          <div className="flex flex-col gap-2">
            <label className="typography-label-1 text-neutral-900">기부할 물품</label>
            <SelectField
              label="기부할 물품"
              value={selectedItemLabel}
              options={itemOptions}
              onChange={(label) => {
                const index = itemOptions.indexOf(label)
                setSelectedItemOverride(compatibleItems[index]?.donationItemId ?? null)
                setQuantityInput(null)
                setQuantityError('')
                setSubmitError('')
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="proposal-quantity" className="typography-label-1 text-neutral-900">
              제안 수량
            </label>
            <div className="relative">
              <input
                id="proposal-quantity"
                value={quantity}
                inputMode="numeric"
                aria-invalid={Boolean(quantityError)}
                onChange={(event) => {
                  setQuantityInput(event.target.value.replace(/\D/g, ''))
                  setQuantityError('')
                  setSubmitError('')
                }}
                className="h-[54px] w-full rounded-input border border-neutral-500 bg-white px-4 pr-12 typography-body-2 text-neutral-900 outline-none focus:border-primary-700"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 typography-body-2 text-neutral-700">
                {need.unit}
              </span>
            </div>
            {quantityError ? <p className="typography-label-2 text-error">{quantityError}</p> : null}
          </div>

          <Textarea
            label="기관에 전할 메시지 (선택)"
            value={message}
            maxLength={500}
            placeholder="전달 가능한 일정이나 물품 정보를 적어 주세요."
            onChange={(event) => {
              setMessage(event.target.value)
              setSubmitError('')
            }}
          />

          {submitError ? <p role="alert" className="typography-label-2 text-error">{submitError}</p> : null}
        </form>
      ) : null}
    </DonorPage>
  )
}

export function DonationProposalCompletePage() {
  const navigate = useNavigate()
  const { needId: needIdParam } = useParams()
  const [searchParams] = useSearchParams()
  const needId = parsePositiveId(needIdParam)
  const donationItemId = parsePositiveId(searchParams.get('donationItemId') ?? undefined)
  const matchId = parsePositiveId(searchParams.get('matchId') ?? undefined)
  const requestedQuantity = Math.max(Number(searchParams.get('quantity')) || 1, 1)
  const needQuery = useNeededItemQuery(needId)
  const donationQuery = useDonationItemQuery(donationItemId)
  const need = needQuery.data
  const donation = donationQuery.data

  return (
    <DonorPage
      title="기부 제안 전송 완료"
      back={needIdParam ? routePath.donorNeedDetail(needIdParam) : ROUTES.donor.needList}
      footer={
        <footer className="shrink-0 bg-surface-canvas px-5 pb-5 pt-3">
          <Button
            className="w-full"
            disabled={matchId === null}
            onClick={() => {
              if (matchId) navigate(routePath.donorRequestDetail(String(matchId)))
            }}
          >
            내역 보기
          </Button>
        </footer>
      }
    >
      <section className="pt-8 text-center">
        <img src={boxHappyImage} alt="" className="mx-auto size-20 object-contain" />
        <h2 className="mt-4 typography-heading-2 text-neutral-900">제안을 보냈어요</h2>
        <p className="mt-2 typography-body-2 text-neutral-700">
          기관이 제안을 확인하고 있어요.
          <br />
          수락·채팅 시작만으로 예약되거나 수량이 차감되지 않아요.
        </p>
      </section>

      {donation ? (
        <section className="mt-5 rounded-card border border-neutral-200 bg-white p-4 text-left">
          <h3 className="typography-title-3 text-neutral-900">
            {donation.itemName} {requestedQuantity}{donation.unit}
          </h3>
          <dl className="mt-3 space-y-2 typography-body-2">
            <CompleteInfoRow label="물품 상태" value={conditionLabel[donation.conditionGrade]} />
            <CompleteInfoRow label="수령 기관" value={need?.organizationName ?? '기관 확인 중'} />
            <CompleteInfoRow label="기관 지역" value={need?.regionName ?? '지역 확인 중'} />
          </dl>
        </section>
      ) : null}
    </DonorPage>
  )
}

function StateCard({
  message,
  action,
  onAction,
}: {
  message: string
  action?: string
  onAction?: () => void
}) {
  return (
    <section className="rounded-card border border-neutral-200 bg-white p-6 text-center">
      <p className="typography-title-3 text-neutral-900">{message}</p>
      {action && onAction ? (
        <Button variant="secondary" className="mt-4" onClick={onAction}>{action}</Button>
      ) : null}
    </section>
  )
}

function parsePositiveId(value: string | undefined) {
  if (!value || !/^[1-9]\d*$/.test(value)) return null
  const id = Number(value)
  return Number.isSafeInteger(id) ? id : null
}

function normalizeItemName(value: string) {
  return value.trim().replace(/\s+/g, '').toLocaleLowerCase('ko-KR')
}

function conditionShortLabel(condition: ItemConditionCode) {
  return condition === 'HIGH' ? '상' : condition === 'MID' ? '중 이상' : '하 이상'
}

function CompleteInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[76px_1fr] gap-3">
      <dt className="text-neutral-700">{label}</dt>
      <dd className="text-neutral-900">{value}</dd>
    </div>
  )
}
