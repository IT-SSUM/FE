import { useEffect, useRef, useState, type FormEvent } from 'react'
import { CheckCircle2, ChevronLeft, Search } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/common/Button/Button'
import { Dialog } from '@/components/common/Dialog/Dialog'
import { FilterSelect } from '@/components/common/FilterSelect/FilterSelect'
import { Input } from '@/components/common/Input/Input'
import { OptionCardGroup } from '@/components/common/OptionCardGroup/OptionCardGroup'
import { SelectField } from '@/components/common/SelectField/SelectField'
import { Textarea } from '@/components/common/Textarea/Textarea'
import { Toast } from '@/components/common/Toast/Toast'
import { PhotoInput } from '@/features/donor/PhotoInput'
import { getNeededItemErrorMessage } from '@/apis/neededItem'
import {
  getDonationItemFailure,
  parseDonationItemId,
} from '@/features/donor/donationItemApiState'
import { useCreateNeededItemMutation } from '@/hooks/mutations/useCreateNeededItemMutation'
import { useDonationItemQuery } from '@/hooks/queries/useDonationItemQuery'
import { useItemCategoriesQuery } from '@/hooks/queries/useItemCategoriesQuery'
import { useItemConditionsQuery } from '@/hooks/queries/useItemConditionsQuery'
import { useItemUnitsQuery } from '@/hooks/queries/useItemUnitsQuery'
import { ROUTES, routePath } from '@/routes/paths'
import type { ItemConditionCode } from '@/types/item'

export function NeedRegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sourceDonationId = parseDonationItemId(
    searchParams.get('sourceDonationId') ?? undefined,
  )
  const sourceDonationQuery = useDonationItemQuery(sourceDonationId)
  const sourceDonation = sourceDonationQuery.data
  const isDonationFixed = sourceDonationId !== null
  const [step, setStep] = useState<1 | 2>(1)
  const [regionPanelOpen, setRegionPanelOpen] = useState(false)
  const [regionQuery, setRegionQuery] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('개')
  const [region, setRegion] = useState('경기도 부천시')
  const [condition, setCondition] = useState<ItemConditionCode>('MID')
  const [reason, setReason] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [photoBusy, setPhotoBusy] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [failure, setFailure] = useState('')
  const [createdNeedId, setCreatedNeedId] = useState<number | null>(null)
  const [completeOpen, setCompleteOpen] = useState(false)
  const submitting = useRef(false)

  const {
    data: itemCategories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useItemCategoriesQuery()
  const {
    data: itemConditions = [],
    isLoading: isConditionsLoading,
    isError: isConditionsError,
    refetch: refetchConditions,
  } = useItemConditionsQuery()
  const {
    data: itemUnits = [],
    isLoading: isUnitsLoading,
    isError: isUnitsError,
    refetch: refetchUnits,
  } = useItemUnitsQuery()
  const { mutateAsync: createNeededItem, isPending: isCreating } =
    useCreateNeededItemMutation()

  const selectedCategory = isDonationFixed
    ? itemCategories.find((item) => item.categoryId === sourceDonation?.categoryId)
    : itemCategories.find((item) => item.categoryId === categoryId) ?? itemCategories[0]
  const selectedCondition = itemConditions.find((item) => item.code === condition)
  const selectedUnit = isDonationFixed
    ? sourceDonation?.unit ?? ''
    : itemUnits.includes(unit) ? unit : (itemUnits[0] ?? '')
  const selectedItemName = isDonationFixed ? sourceDonation?.itemName ?? '' : itemName

  useEffect(() => {
    if (!failure) return
    const timer = window.setTimeout(() => setFailure(''), 4500)
    return () => window.clearTimeout(timer)
  }, [failure])

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
      return
    }
    navigate(ROUTES.organization.home)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFailure('')

    if (step === 1) {
      const nextErrors: FormErrors = {}
      if (!selectedCategory) nextErrors.category = '카테고리를 선택해 주세요.'
      if (!selectedItemName.trim()) nextErrors.itemName = '품목을 입력해 주세요.'
      else if (selectedItemName.trim().length > 50) nextErrors.itemName = '품목은 50자 이하로 입력해 주세요.'
      if (!/^[1-9]\d*$/.test(quantity)) nextErrors.quantity = '필요 수량을 1 이상의 숫자로 입력해 주세요.'
      if (!selectedUnit) nextErrors.unit = '단위를 선택해 주세요.'
      setErrors(nextErrors)
      if (Object.keys(nextErrors).length) {
        setFailure('필수 입력과 표시된 오류를 확인해 주세요.')
        return
      }
      setStep(2)
      return
    }

    const nextErrors: FormErrors = {}
    if (!selectedCondition) nextErrors.condition = '희망 상태를 선택해 주세요.'
    if (reason.trim().length > 1000) nextErrors.reason = '필요한 이유는 1,000자 이하로 입력해 주세요.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setFailure('필수 입력과 표시된 오류를 확인해 주세요.')
      return
    }
    if (!selectedCategory || !selectedCondition || !selectedUnit || submitting.current) return

    submitting.current = true
    try {
      const created = await createNeededItem({
        categoryId: selectedCategory.categoryId,
        itemName: selectedItemName.trim(),
        requiredQuantity: Number(quantity),
        unit: selectedUnit,
        desiredCondition: selectedCondition.code,
        description: reason.trim() || undefined,
        referenceImage: photos[0],
      })
      setCreatedNeedId(created.neededItemId)
      setCompleteOpen(true)
    } catch (error) {
      setFailure(getNeededItemErrorMessage(
        error,
        '필요 물품을 등록하지 못했어요. 잠시 후 다시 시도해 주세요.',
      ))
    } finally {
      submitting.current = false
    }
  }

  if (regionPanelOpen) {
    const showBucheon =
      !regionQuery.trim() || '경기도 부천시'.includes(regionQuery.trim())

    return (
      <div className="flex min-h-dvh flex-col bg-surface-canvas">
        <PageHeader
          title="지역 선택"
          onBack={() => setRegionPanelOpen(false)}
        />

        <main className="flex-1 overflow-y-auto px-5 pb-6 pt-4">
          <label
            htmlFor="region-search"
            className="text-xs font-bold leading-[18px] text-neutral-900"
          >
            지역 검색
          </label>
          <div className="mt-3 flex gap-2">
            <input
              id="region-search"
              type="search"
              value={regionQuery}
              onChange={(event) => setRegionQuery(event.target.value)}
              placeholder="시·군·구 검색"
              className="h-[52px] min-w-0 flex-1 rounded-input border border-neutral-500 bg-white px-4 typography-body-2 text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-primary-700"
            />
            <button
              type="button"
              className="flex h-[52px] shrink-0 items-center gap-2 rounded-control bg-primary-700 px-4 typography-title-3 text-white transition-colors hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
            >
              <Search aria-hidden size={18} strokeWidth={2} />
              검색
            </button>
          </div>

          <section className="mt-4" aria-label="선택 가능한 지역">
            {showBucheon ? (
              <button
                type="button"
                aria-pressed="true"
                onClick={() => setRegion('경기도 부천시')}
                style={{ minHeight: 52 }}
                className="flex w-full items-center gap-3 rounded-control border border-primary-300 bg-primary-100 px-4 text-left typography-body-2 text-primary-700"
              >
                <CheckCircle2 aria-hidden size={20} strokeWidth={2} />
                경기도 부천시
              </button>
            ) : (
              <div className="rounded-control border border-neutral-200 bg-white px-4 py-8 text-center typography-body-2 text-neutral-600">
                선택할 수 있는 지역은 경기도 부천시예요.
              </div>
            )}
          </section>

          <p className="mt-4 typography-label-2 text-neutral-600">
            시·군·구 단위로 공개돼요. 상세 위치는 채팅에서 협의해요.
          </p>
        </main>

        <footer className="shrink-0 bg-surface-canvas px-5 pb-4 pt-2">
          <Button
            className="h-[46px] w-full"
            onClick={() => {
              setRegion('경기도 부천시')
              setRegionPanelOpen(false)
            }}
          >
            적용
          </Button>
        </footer>
      </div>
    )
  }

  return (
    <form
      className="flex min-h-dvh flex-col bg-surface-canvas"
      onSubmit={handleSubmit}
    >
      <PageHeader title="필요 물품 등록" onBack={handleBack} />

      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
        <p className="typography-label-1 text-primary-700">
          {step} / 2 {step === 1 ? '물품·지역' : '희망상태·참고정보'}
        </p>
        <h2 className="mt-3 typography-heading-3 text-neutral-900">
          {step === 1
            ? '필요한 물품을 알려주세요'
            : '희망 상태와 참고 정보를 알려주세요'}
        </h2>

        {step === 1 ? (
          <div className="mt-5 space-y-4">
            <div className="flex w-full flex-col gap-2">
              <span className="text-xs font-bold leading-[18px] text-neutral-900">
                카테고리
              </span>
              <FilterSelect
                label="카테고리"
                showMenuLabel={false}
                includeAllOption={false}
                value={selectedCategory?.name ?? ''}
                options={itemCategories.map((item) => item.name)}
                disabled={
                  isDonationFixed || isCategoriesLoading || isCategoriesError
                }
                className="h-[54px] w-full justify-between rounded-input border-neutral-500 bg-white px-4 typography-body-2 text-neutral-900"
                onChange={(value) => {
                  setCategoryId(
                    itemCategories.find((item) => item.name === value)?.categoryId ?? null,
                  )
                  setErrors((previous) => ({ ...previous, category: undefined }))
                }}
              />
              {errors.category ? <p className="typography-label-2 text-error">{errors.category}</p> : null}
              {isCategoriesError ? (
                <p role="alert" className="typography-label-2 text-error">
                  카테고리를 불러오지 못했어요.{' '}
                  <button
                    type="button"
                    className="font-semibold underline underline-offset-2"
                    onClick={() => void refetchCategories()}
                  >
                    다시 시도
                  </button>
                </p>
              ) : null}
            </div>
            <Input
              label="품목"
              value={selectedItemName}
              disabled={isDonationFixed}
              onChange={(event) => {
                setItemName(event.target.value)
                setErrors((previous) => ({ ...previous, itemName: undefined }))
              }}
              error={errors.itemName}
              placeholder="예: 생수"
              maxLength={50}
              labelClassName="text-xs font-bold leading-[18px]"
              className="typography-body-2"
            />
            <div className="flex w-full flex-col gap-2">
              <label htmlFor="needed-item-quantity" className="text-xs font-bold leading-[18px] text-neutral-900">필요 수량</label>
              <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-2">
                <input
                  id="needed-item-quantity"
                  value={quantity}
                  onChange={(event) => {
                    setQuantity(event.target.value.replace(/\D/g, ''))
                    setErrors((previous) => ({ ...previous, quantity: undefined }))
                  }}
                  placeholder="예: 20"
                  inputMode="numeric"
                  aria-invalid={Boolean(errors.quantity)}
                  className={`h-[54px] min-w-0 rounded-input border bg-white px-4 typography-body-2 text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-primary-700 ${errors.quantity ? 'border-error' : 'border-neutral-500'}`}
                />
                <SelectField
                  label="필요 수량 단위"
                  value={selectedUnit}
                  disabled={isDonationFixed || isUnitsLoading || isUnitsError}
                  error={Boolean(errors.unit)}
                  options={itemUnits}
                  onChange={(value) => {
                    setUnit(value)
                    setErrors((previous) => ({ ...previous, unit: undefined }))
                  }}
                />
              </div>
              {errors.quantity ? <p className="typography-label-2 text-error">{errors.quantity}</p> : null}
              {errors.unit ? <p className="typography-label-2 text-error">{errors.unit}</p> : null}
              {isUnitsError ? (
                <p role="alert" className="typography-label-2 text-error">단위 목록을 불러오지 못했어요. <button type="button" className="font-semibold underline underline-offset-2" onClick={() => void refetchUnits()}>다시 시도</button></p>
              ) : null}
            </div>
            {isDonationFixed && sourceDonationQuery.isError ? (
              <div role="alert" className="rounded-control border border-error/30 bg-error-bg p-4 typography-body-2 text-error">
                {getDonationItemFailure(sourceDonationQuery.error).message}
                <button
                  type="button"
                  className="ml-2 font-semibold underline underline-offset-2"
                  onClick={() => void sourceDonationQuery.refetch()}
                >
                  다시 시도
                </button>
              </div>
            ) : null}
            <div className="flex w-full flex-col gap-2">
              <span className="text-xs font-bold leading-[18px] text-neutral-900">
                수령 지역
              </span>
              <button
                type="button"
                onClick={() => {
                  setRegionQuery('')
                  setRegionPanelOpen(true)
                }}
                style={{ height: 54 }}
                className="w-full rounded-input border border-neutral-500 bg-white px-4 text-left typography-body-2 text-neutral-900 outline-none transition-colors hover:border-primary-700 focus-visible:border-primary-700 focus-visible:outline-none"
              >
                {region}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            {isConditionsLoading ? (
              <p role="status" className="typography-body-2 text-neutral-600">물품 상태를 불러오는 중이에요.</p>
            ) : isConditionsError ? (
              <div role="alert" className="rounded-control border border-error/30 bg-error-bg p-4 typography-body-2 text-error">
                물품 상태를 불러오지 못했어요.
                <button type="button" className="ml-2 font-semibold underline underline-offset-2" onClick={() => void refetchConditions()}>다시 시도</button>
              </div>
            ) : (
              <OptionCardGroup
                label="희망 상태"
                options={itemConditions.map((item) => item.description)}
                value={selectedCondition?.description ?? ''}
                onChange={(value) => {
                  const code = itemConditions.find((item) => item.description === value)?.code
                  if (code) setCondition(code)
                  setErrors((previous) => ({ ...previous, condition: undefined }))
                }}
              />
            )}
            {errors.condition ? <p className="mt-2 typography-label-2 text-error">{errors.condition}</p> : null}

            <div className="mt-4">
              <Textarea
                label="필요한 이유 (선택)"
                value={reason}
                placeholder="필요한 이유를 입력해 주세요."
                error={errors.reason}
                maxLength={1000}
                labelClassName="text-xs font-bold leading-[18px]"
                onChange={(event) => {
                  setReason(event.target.value)
                  setErrors((previous) => ({ ...previous, reason: undefined }))
                }}
                className="min-h-[112px] resize-none"
              />
            </div>

            <div className="mt-4">
              <PhotoInput
                label="참고 사진"
                optional
                maxPhotos={1}
                photos={photos}
                onChange={setPhotos}
                onBusyChange={setPhotoBusy}
              />
            </div>
          </div>
        )}
      </main>

      <footer className="shrink-0 bg-surface-canvas px-5 pb-4 pt-2">
        <Button
          type="submit"
          className="h-[46px] w-full"
          disabled={
            photoBusy ||
            isCreating ||
            (isDonationFixed && (sourceDonationQuery.isPending || sourceDonationQuery.isError))
          }
        >
          {step === 1 ? '다음' : isCreating ? '등록 중...' : '등록하기'}
        </Button>
      </footer>

      <Dialog
        open={completeOpen}
        title="필요 물품이 등록됐어요!"
        description="가까운 기부자가 확인할 수 있도록 공개됐어요."
        confirmText={isDonationFixed ? '기부 요청 계속하기' : '추천 기부자 보기'}
        cancelText="홈으로 가기"
        onConfirm={() => {
          if (!createdNeedId) return
          if (sourceDonationId) {
            navigate(
              `${routePath.organizationDonationRequest(String(sourceDonationId))}?needId=${createdNeedId}`,
            )
            return
          }
          navigate(routePath.organizationRecommendation(String(createdNeedId)))
        }}
        onCancel={() => navigate(ROUTES.organization.home)}
      />
      {failure ? (
        <div className="pointer-events-none fixed left-1/2 top-4 z-300 w-full max-w-[393px] -translate-x-1/2 px-5">
          <Toast
            variant="error"
            title="필요 물품 등록을 확인해 주세요"
            description={failure}
            className="shadow-[0_12px_32px_rgb(18_61_49/18%)]"
          />
        </div>
      ) : null}
    </form>
  )
}

type FormErrors = {
  category?: string
  itemName?: string
  quantity?: string
  unit?: string
  condition?: string
  reason?: string
}

type PageHeaderProps = {
  title: string
  onBack: () => void
}

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
