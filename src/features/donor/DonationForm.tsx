import { useEffect, useRef, useState } from 'react'
import { useBlocker, useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button/Button'
import { Input } from '@/components/common/Input/Input'
import { Textarea } from '@/components/common/Textarea/Textarea'
import { Dialog } from '@/components/common/Dialog/Dialog'
import { SelectField } from '@/components/common/SelectField/SelectField'
import { ROUTES, routePath } from '@/routes/paths'
import {
  canEdit,
  catalog,
  today,
  validateDonation,
  type Donation,
  type DonationInput,
} from './model'
import { useDonorStore } from './store'
import { DonorPage, EmptyState } from './DonorPage'
import { PhotoInput } from './PhotoInput'
import { useItemConditionsQuery } from '@/hooks/queries/useItemConditionsQuery'
import { useItemCategoriesQuery } from '@/hooks/queries/useItemCategoriesQuery'
import { useItemUnitsQuery } from '@/hooks/queries/useItemUnitsQuery'
import { useCreateDonationItemMutation } from '@/hooks/mutations/useCreateDonationItemMutation'
import { getDonationItemFailure } from './donationItemApiState'
import type { ItemConditionCode } from '@/types/item'

const conditionValueByCode: Record<ItemConditionCode, string> = {
  HIGH: '상',
  MID: '중',
  LOW: '하',
}

const conditionCodeByValue: Record<string, ItemConditionCode> = {
  상: 'HIGH',
  중: 'MID',
  하: 'LOW',
}

export function DonationForm({
  item,
  editing = false,
  preset,
}: {
  item?: Donation
  editing?: boolean
  preset?: {
    name: string
    category: string
  }
}) {
  const navigate = useNavigate()

  const save = useDonorStore((state) => state.save)

  const {
    data: itemConditions = [],
    isLoading: isConditionsLoading,
    isError: isConditionsError,
    refetch: refetchConditions,
  } = useItemConditionsQuery()

  const {
    data: itemCategories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useItemCategoriesQuery()
  const {
    data: itemUnits = [],
    isLoading: isUnitsLoading,
    isError: isUnitsError,
    refetch: refetchUnits,
  } = useItemUnitsQuery()
  const createMutation = useCreateDonationItemMutation()

  const [draft, setDraft] = useState<DonationInput>(() =>
    item ?? {
      name: preset?.name ?? '',
      category: preset?.category ?? '',
      quantity: 1,
      condition: '중',
      location: '',
      startDate: today(),
      endDate: today(),
      description: '',
      photos: [],
    },
  )

  const [step, setStep] = useState(1)

  const [errors, setErrors] = useState<
    Partial<Record<keyof DonationInput, string>>
  >({})

  const [failure, setFailure] = useState('')
  const [busy, setBusy] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [savedId, setSavedId] = useState('')
  const [unit, setUnit] = useState('개')

  const blocker = useBlocker(dirty && !savedId)

  const submitted = useRef(false)
  const form = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!dirty || savedId) {
      return
    }

    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', warn)

    return () => {
      window.removeEventListener('beforeunload', warn)
    }
  }, [dirty, savedId])

  const change = <K extends keyof DonationInput>(
    key: K,
    value: DonationInput[K],
  ) => {
    setDraft((previous) => ({
      ...previous,
      [key]: value,
    }))

    setErrors((previous) => ({
      ...previous,
      [key]: undefined,
    }))

    setFailure('')
    setDirty(true)
  }

  const back =
    editing && item
      ? routePath.donorDonationDetail(item.id)
      : ROUTES.donor.myItems

  if (editing && (!item || !canEdit(item))) {
    return (
      <DonorPage title="기부 물품 수정" back={back}>
        <EmptyState
          title={
            item
              ? '예약 중이거나 완료된 물품은 수정할 수 없어요'
              : '물품을 찾을 수 없어요'
          }
          to={back}
          label="돌아가기"
        />
      </DonorPage>
    )
  }

  async function submit() {
    if (busy || createMutation.isPending || submitted.current) {
      return
    }

    const checked = validateDonation(draft)
    if (!editing) {
      delete checked.startDate
      delete checked.endDate
    }

    const visibleErrors =
      step === 1
        ? Object.fromEntries(
            Object.entries(checked).filter(
              ([key]) =>
                !['photos', 'condition', 'description'].includes(key),
            ),
          )
        : checked

    setErrors(visibleErrors)

    if (Object.keys(visibleErrors).length) {
      setFailure('필수 입력과 표시된 오류를 확인해 주세요.')
      return
    }

    if (step === 1) {
      setStep(2)
      setFailure('')
      return
    }

    submitted.current = true

    try {
      if (editing) {
        setSavedId(save(draft, item?.id))
      } else {
        const category = itemCategories.find((value) => value.name === draft.category)
        const conditionGrade = conditionCodeByValue[draft.condition]
        const selectedUnit = itemUnits.includes(unit) ? unit : itemUnits[0]
        if (!category || !conditionGrade || !selectedUnit) {
          throw new Error('카테고리, 상태와 단위를 다시 확인해 주세요.')
        }
        const created = await createMutation.mutateAsync({
          categoryId: category.categoryId,
          itemName: draft.name,
          quantity: draft.quantity,
          unit: selectedUnit,
          conditionGrade,
          description: draft.description.trim(),
          images: draft.photos,
          pickupAddress: draft.location.trim(),
          pickupAddressDetail: '',
        })
        setSavedId(String(created.donationItemId))
      }

      setDirty(false)
    } catch (cause) {
      setFailure(getDonationItemFailure(cause).message)

      submitted.current = false
    }
  }

  const selectClass =
    'h-[54px] w-full rounded-input border border-neutral-500 bg-white px-4'

  return (
    <DonorPage
      title={editing ? '기부 물품 수정' : '기부 물품 등록'}
      back={back}
      footer={
        <footer className="flex gap-2 border-t border-neutral-200 px-5 py-4">
          {step === 2 ? (
            <Button
              variant="secondary"
              disabled={busy || createMutation.isPending || Boolean(savedId)}
              onClick={() => setStep(1)}
            >
              이전
            </Button>
          ) : null}

          <Button
            className="flex-1"
            disabled={busy || createMutation.isPending || Boolean(savedId) || (step === 1 && (isUnitsLoading || isUnitsError))}
            onClick={() => form.current?.requestSubmit()}
          >
            {step === 1
              ? '다음'
                : createMutation.isPending
                  ? '등록 중...'
                  : editing
                ? '수정 완료'
                : '등록하기'}
          </Button>
        </footer>
      }
    >
      <p className="typography-label-1 text-primary-700">
        {step} / 2{' '}
        {step === 1
          ? '물품·수령 정보'
          : '상태·사진'}
      </p>

      <form
        ref={form}
        noValidate
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        {step === 1 ? (
          <>
            <label className="block space-y-2">
              <span>카테고리 *</span>

              <select
                aria-label="카테고리"
                value={draft.category}
                className={selectClass}
                disabled={
                  isCategoriesLoading ||
                  isCategoriesError
                }
                onChange={(event) => {
                  change(
                    'category',
                    event.target.value,
                  )
                  change('name', '')
                }}
              >
                <option value="">
                  {isCategoriesLoading
                    ? '카테고리를 불러오는 중...'
                    : isCategoriesError
                      ? '카테고리를 불러오지 못했어요'
                      : '선택해 주세요'}
                </option>

                {itemCategories.map((category) => (
                  <option
                    key={category.categoryId}
                    value={category.name}
                  >
                    {category.name}
                  </option>
                ))}
              </select>

              {isCategoriesError ? (
                <div>
                  <p
                    role="alert"
                    className="typography-label-2 text-error"
                  >
                    물품 카테고리를 불러오지 못했어요.
                  </p>

                  <button
                    type="button"
                    className="mt-1 typography-label-1 text-primary-700 underline"
                    onClick={() => {
                      void refetchCategories()
                    }}
                  >
                    다시 시도
                  </button>
                </div>
              ) : null}
            </label>

            <label className="block space-y-2">
              <span>품목 *</span>

              <select
                aria-label="품목"
                aria-invalid={Boolean(errors.name)}
                value={draft.name}
                className={selectClass}
                disabled={!draft.category}
                onChange={(event) =>
                  change('name', event.target.value)
                }
              >
                <option value="">
                  {draft.category
                    ? '선택해 주세요'
                    : '카테고리를 먼저 선택해 주세요'}
                </option>

                {(catalog[draft.category] ?? []).map(
                  (value) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {value}
                    </option>
                  ),
                )}
              </select>

              {errors.name ? (
                <span className="text-error">
                  {errors.name}
                </span>
              ) : null}
            </label>

            <div className="grid grid-cols-[minmax(0,1fr)_112px] items-end gap-2">
              <Input
                label="수량"
                type="number"
                min={1}
                max={9999}
                step={1}
                required
                value={Number.isNaN(draft.quantity) ? '' : draft.quantity}
                error={errors.quantity}
                onChange={(event) => change('quantity', event.target.value === '' ? NaN : Number(event.target.value))}
              />
              <div className="flex flex-col gap-2">
                <span className="typography-label-1 text-neutral-900">단위 *</span>
                <SelectField
                  label="물품 단위"
                  value={itemUnits.includes(unit) ? unit : (itemUnits[0] ?? '')}
                  options={itemUnits}
                  disabled={isUnitsLoading || isUnitsError}
                  onChange={(value) => {
                    setUnit(value)
                    setDirty(true)
                    setFailure('')
                  }}
                />
              </div>
            </div>
            {isUnitsError ? (
              <p role="alert" className="typography-label-2 text-error">단위 목록을 불러오지 못했어요. <button type="button" className="font-semibold underline" onClick={() => void refetchUnits()}>다시 시도</button></p>
            ) : null}

            <Input
              label="물품 위치"
              required
              maxLength={100}
              value={draft.location}
              error={errors.location}
              onChange={(event) =>
                change('location', event.target.value)
              }
              placeholder="도로명 주소를 입력해 주세요."
            />

            {editing ? <><Input
              label="수령 시작일"
              type="date"
              required
              value={draft.startDate}
              error={errors.startDate}
              onChange={(event) =>
                change('startDate', event.target.value)
              }
            />

            <Input
              label="수령 종료일"
              type="date"
              required
              min={
                draft.startDate > today()
                  ? draft.startDate
                  : today()
              }
              value={draft.endDate}
              error={errors.endDate}
              onChange={(event) =>
                change('endDate', event.target.value)
              }
            /></> : null}
          </>
        ) : (
          <>
            <fieldset>
              <legend className="mb-2 typography-label-1">
                물품 상태 *
              </legend>

              {isConditionsLoading ? (
                <p
                  role="status"
                  className="rounded-input border border-neutral-200 bg-white p-4 typography-body-2 text-neutral-700"
                >
                  물품 상태 기준을 불러오고 있어요.
                </p>
              ) : null}

              {isConditionsError ? (
                <div className="rounded-input border border-error bg-error-bg p-4">
                  <p
                    role="alert"
                    className="typography-body-2 text-error"
                  >
                    물품 상태 기준을 불러오지 못했어요.
                  </p>

                  <button
                    type="button"
                    className="mt-2 typography-label-1 text-primary-700 underline"
                    onClick={() => {
                      void refetchConditions()
                    }}
                  >
                    다시 시도
                  </button>
                </div>
              ) : null}

              {!isConditionsLoading &&
                !isConditionsError &&
                itemConditions.map((condition) => {
                  const value =
                    conditionValueByCode[condition.code]

                  return (
                    <label
                      key={condition.code}
                      className="mb-2 flex items-center gap-2 rounded-input border border-neutral-200 bg-white p-3"
                    >
                      <input
                        type="radio"
                        name="condition"
                        value={value}
                        checked={
                          draft.condition === value
                        }
                        onChange={() =>
                          change('condition', value)
                        }
                      />

                      <span>
                        {condition.description}
                      </span>
                    </label>
                  )
                })}

              {errors.condition ? (
                <p className="mt-2 text-error">
                  {errors.condition}
                </p>
              ) : null}
            </fieldset>

            <Textarea
              label="상세 설명 (선택)"
              maxLength={1000}
              value={draft.description}
              error={errors.description}
              onChange={(event) =>
                change(
                  'description',
                  event.target.value,
                )
              }
            />

            <PhotoInput
              maxPhotos={5}
              photos={draft.photos}
              error={errors.photos}
              onChange={(photos) =>
                change('photos', photos)
              }
              onBusyChange={setBusy}
            />
          </>
        )}

        {failure ? (
          <p
            role="alert"
            className="text-error"
          >
            {failure}
          </p>
        ) : null}
      </form>

      <Dialog
        open={Boolean(savedId)}
        title={
          editing
            ? '물품을 수정했어요'
            : '물품을 등록했어요'
        }
        description={editing ? '물품 정보를 수정했어요.' : '기부 물품이 등록되어 기관에 공개됐어요.'}
        confirmText="내 물품 보기"
        cancelText="추천 기관 보기"
        onConfirm={() =>
          navigate(
            routePath.donorDonationDetail(savedId),
            { replace: true },
          )
        }
        onCancel={() =>
          navigate(
            routePath.donorRecommendation(savedId),
            { replace: true },
          )
        }
      />

      <Dialog
        open={blocker.state === 'blocked'}
        title="작성 중인 내용을 버릴까요?"
        description="저장하지 않은 입력 내용은 사라집니다."
        confirmText="나가기"
        cancelText="계속 작성하기"
        onConfirm={() =>
          blocker.state === 'blocked' &&
          blocker.proceed()
        }
        onCancel={() =>
          blocker.state === 'blocked' &&
          blocker.reset()
        }
      />
    </DonorPage>
  )
}
