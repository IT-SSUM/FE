import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  useBlocker,
  useNavigate,
} from 'react-router-dom'

import {
  AddressSearchField,
} from '@/components/common/AddressSearchField/AddressSearchField'

import {
  Button,
} from '@/components/common/Button/Button'

import {
  Dialog,
} from '@/components/common/Dialog/Dialog'

import {
  Textarea,
} from '@/components/common/Textarea/Textarea'

import {
  ROUTES,
  routePath,
} from '@/routes/paths'

import {
  catalog,
  today,
  type DonationInput,
} from './model'

import {
  DonorPage,
} from './DonorPage'

import {
  PhotoInput,
} from './PhotoInput'

import {
  useItemConditionsQuery,
} from '@/hooks/queries/useItemConditionsQuery'

import {
  useItemCategoriesQuery,
} from '@/hooks/queries/useItemCategoriesQuery'

import {
  useItemUnitsQuery,
} from '@/hooks/queries/useItemUnitsQuery'

import {
  useCreateDonationItemMutation,
} from '@/hooks/mutations/useCreateDonationItemMutation'

import {
  getDonationItemFailure,
} from './donationItemApiState'

import type {
  ItemConditionCode,
} from '@/types/item'

import type {
  DonationItemDetail,
} from '@/types/donationItem'

const conditionValueByCode:
  Record<
    ItemConditionCode,
    string
  > = {
    HIGH: '상',
    MID: '중',
    LOW: '하',
  }

const conditionCodeByValue:
  Record<
    string,
    ItemConditionCode
  > = {
    상: 'HIGH',
    중: 'MID',
    하: 'LOW',
  }

const SERVICE_REGION_ID =
  1

type Step =
  | 1
  | 2
  | 3

export function DonationForm({
  preset,
}: {
  preset?: {
    name: string
    category: string
  }
}) {
  const navigate =
    useNavigate()

  const {
    data:
      itemConditions = [],
    isLoading:
      isConditionsLoading,
    isError:
      isConditionsError,
    refetch:
      refetchConditions,
  } =
    useItemConditionsQuery()

  const {
    data:
      itemCategories = [],
    isLoading:
      isCategoriesLoading,
    isError:
      isCategoriesError,
    refetch:
      refetchCategories,
  } =
    useItemCategoriesQuery()

  const {
    data:
      itemUnits = [],
    isLoading:
      isUnitsLoading,
    isError:
      isUnitsError,
    refetch:
      refetchUnits,
  } =
    useItemUnitsQuery()

  const createMutation =
    useCreateDonationItemMutation()

  const [
    draft,
    setDraft,
  ] =
    useState<DonationInput>(
      () => ({
        name:
          preset?.name ??
          '',
        category:
          preset?.category ??
          '',
        quantity: 1,
        condition: '중',
        location: '',
        startDate:
          today(),
        endDate:
          today(),
        description:
          '',
        photos: [],
      }),
    )

  const [
    detailAddress,
    setDetailAddress,
  ] =
    useState('')

  const [
    step,
    setStep,
  ] =
    useState<Step>(1)

  const [
    errors,
    setErrors,
  ] =
    useState<
      Partial<
        Record<
          keyof DonationInput,
          string
        >
      >
    >({})

  const [
    categoryError,
    setCategoryError,
  ] =
    useState('')

  const [
    unitError,
    setUnitError,
  ] =
    useState('')

  const [
    failure,
    setFailure,
  ] =
    useState('')

  const [
    busy,
    setBusy,
  ] =
    useState(false)

  const [
    dirty,
    setDirty,
  ] =
    useState(false)

  const [
    unit,
    setUnit,
  ] =
    useState('개')

  const [
    createdItem,
    setCreatedItem,
  ] =
    useState<
      DonationItemDetail | null
    >(null)

  const blocker =
    useBlocker(
      dirty &&
        !createdItem,
    )

  const submitted =
    useRef(false)

  const form =
    useRef<HTMLFormElement>(
      null,
    )

  useEffect(() => {
    if (
      !itemUnits.length ||
      itemUnits.includes(
        unit,
      )
    ) {
      return
    }

    setUnit(
      itemUnits[0] ??
        '',
    )
  }, [
    itemUnits,
    unit,
  ])

  useEffect(() => {
    if (
      !dirty ||
      createdItem
    ) {
      return
    }

    const warn =
      (
        event:
          BeforeUnloadEvent,
      ) => {
        event.preventDefault()

        event.returnValue =
          ''
      }

    window.addEventListener(
      'beforeunload',
      warn,
    )

    return () => {
      window.removeEventListener(
        'beforeunload',
        warn,
      )
    }
  }, [
    dirty,
    createdItem,
  ])

  const change = <
    K extends
      keyof DonationInput,
  >(
    key: K,
    value:
      DonationInput[K],
  ) => {
    setDraft(
      (
        previous,
      ) => ({
        ...previous,
        [key]: value,
      }),
    )

    setErrors(
      (
        previous,
      ) => ({
        ...previous,
        [key]:
          undefined,
      }),
    )

    setFailure('')
    setDirty(true)
  }

  const itemOptions =
    Array.from(
      new Set([
        ...(
          catalog[
            draft.category
          ] ?? []
        ),

        ...(draft.name
          ? [
              draft.name,
            ]
          : []),
      ]),
    )

  const selectedUnit =
    itemUnits.includes(
      unit,
    )
      ? unit
      : (
          itemUnits[0] ??
          ''
        )

  function validateStep1() {
    let invalid =
      false

    const nextErrors:
      typeof errors = {}

    if (
      !draft.category
    ) {
      setCategoryError(
        '카테고리를 선택해 주세요.',
      )

      invalid =
        true
    } else {
      setCategoryError(
        '',
      )
    }

    if (!draft.name) {
      nextErrors.name =
        '기부할 품목을 선택해 주세요.'

      invalid =
        true
    }

    if (
      !Number.isInteger(
        draft.quantity,
      ) ||
      draft.quantity <
        1
    ) {
      nextErrors.quantity =
        '수량은 1 이상으로 입력해 주세요.'

      invalid =
        true
    }

    if (
      !selectedUnit
    ) {
      setUnitError(
        '단위를 선택해 주세요.',
      )

      invalid =
        true
    } else {
      setUnitError(
        '',
      )
    }

    setErrors(
      (
        previous,
      ) => ({
        ...previous,
        ...nextErrors,
      }),
    )

    return !invalid
  }

  function validateStep2() {
    let invalid =
      false

    const nextErrors:
      typeof errors = {}

    if (
      !conditionCodeByValue[
        draft.condition
      ]
    ) {
      nextErrors.condition =
        '물품 상태를 선택해 주세요.'

      invalid =
        true
    }

    if (
      draft.description.length >
      1000
    ) {
      nextErrors.description =
        '설명은 1000자 이하로 입력해 주세요.'

      invalid =
        true
    }

    if (
      draft.photos.length <
        1 ||
      draft.photos.length >
        5
    ) {
      nextErrors.photos =
        '사진을 최소 1장 선택해 주세요.'

      invalid =
        true
    }

    setErrors(
      (
        previous,
      ) => ({
        ...previous,
        ...nextErrors,
      }),
    )

    return !invalid
  }

  function validateStep3() {
    if (
      !draft.location.trim()
    ) {
      setErrors(
        (
          previous,
        ) => ({
          ...previous,
          location:
            '물품 위치를 입력해 주세요.',
        }),
      )

      return false
    }

    return true
  }

  async function submit() {
    if (
      busy ||
      createMutation.isPending ||
      submitted.current
    ) {
      return
    }

    if (step === 1) {
      if (
        !validateStep1()
      ) {
        setFailure(
          '필수 입력과 표시된 오류를 확인해 주세요.',
        )

        return
      }

      setFailure('')
      setStep(2)

      return
    }

    if (step === 2) {
      if (
        !validateStep2()
      ) {
        setFailure(
          '필수 입력과 표시된 오류를 확인해 주세요.',
        )

        return
      }

      setFailure('')
      setStep(3)

      return
    }

    if (
      !validateStep3()
    ) {
      setFailure(
        '필수 입력과 표시된 오류를 확인해 주세요.',
      )

      return
    }

    submitted.current =
      true

    try {
      const category =
        itemCategories.find(
          (value) =>
            value.name ===
            draft.category,
        )

      const conditionGrade =
        conditionCodeByValue[
          draft.condition
        ]

      if (
        !category ||
        !conditionGrade ||
        !selectedUnit
      ) {
        throw new Error(
          '카테고리, 상태와 단위를 다시 확인해 주세요.',
        )
      }

      const created =
        await createMutation.mutateAsync(
          {
            categoryId:
              category.categoryId,

            itemName:
              draft.name,

            quantity:
              draft.quantity,

            unit:
              selectedUnit,

            conditionGrade,

            description:
              draft.description.trim(),

            images:
              draft.photos,

            pickupAddress:
              draft.location.trim(),

            pickupAddressDetail:
              detailAddress.trim(),

            regionId:
              SERVICE_REGION_ID,
          },
        )

      setCreatedItem(
        created,
      )

      setDirty(false)
    } catch (
      cause
    ) {
      setFailure(
        getDonationItemFailure(
          cause,
        ).message,
      )

      submitted.current =
        false
    }
  }

  const moveToPreviousStep =
    () => {
      if (step === 3) {
        setStep(2)
        return
      }

      if (step === 2) {
        setStep(1)
      }
    }

  if (createdItem) {
    const donationId =
      String(
        createdItem.donationItemId,
      )

    const openRecommendation =
      () =>
        navigate(
          routePath.donorRecommendation(
            donationId,
          ),
          {
            replace:
              true,

            state: {
              recalculate:
                true,
            },
          },
        )

    const openMyItem =
      () =>
        navigate(
          routePath.donorDonationDetail(
            donationId,
          ),
          {
            replace:
              true,
          },
        )

    return (
      <DonorPage
        title="등록 완료"
        back={
          ROUTES.donor
            .myItems
        }
        footer={
          <footer className="shrink-0 bg-surface-canvas p-5">
            <Button
              className="w-full"
              onClick={
                openRecommendation
              }
            >
              추천 기관 보기
            </Button>
          </footer>
        }
      >
        <section>
          <h2 className="typography-title-2 text-neutral-900">
            {
              createdItem.itemName
            }
          </h2>

          <div className="mt-4 rounded-card border border-neutral-200 bg-white p-4">
            <dl className="space-y-2">
              <SummaryRow
                label="품목 · 수량"
                value={`${createdItem.categoryName} · ${createdItem.quantity}${createdItem.unit}`}
              />

              <SummaryRow
                label="물품 상태"
                value={conditionDescription(
                  createdItem.conditionGrade,
                )}
              />

              <SummaryRow
                label="물품 위치"
                value={
                  createdItem.regionName ||
                  createdItem.pickupAddress ||
                  '-'
                }
              />
            </dl>
          </div>
        </section>

        <Dialog
          open
          title="물품이 등록됐어요!"
          confirmText="추천 기관 보기"
          cancelText="내 물품 보기"
          onConfirm={
            openRecommendation
          }
          onCancel={
            openMyItem
          }
        />
      </DonorPage>
    )
  }

  return (
    <DonorPage
      title={
        step === 3
          ? '전달 정보'
          : '기부 물품 등록'
      }
      back={
        step === 1
          ? ROUTES.donor
              .myItems
          : undefined
      }
      onBack={
        step > 1
          ? moveToPreviousStep
          : undefined
      }
      footer={
        <footer className="shrink-0 bg-surface-canvas p-5">
          <Button
            className="w-full"
            disabled={
              busy ||
              createMutation.isPending ||
              (
                step === 1 &&
                (
                  isCategoriesLoading ||
                  isCategoriesError ||
                  isUnitsLoading ||
                  isUnitsError
                )
              )
            }
            onClick={() =>
              form.current?.requestSubmit()
            }
          >
            {step < 3
              ? '다음'
              : createMutation.isPending
                ? '등록 중...'
                : '등록하기'}
          </Button>
        </footer>
      }
    >
      <p className="typography-label-1 text-primary-700">
        {step} / 3{' '}
        {step === 1
          ? '물품·지역'
          : step === 2
            ? '상태·사진'
            : '위치'}
      </p>

      <form
        ref={form}
        noValidate
        className="space-y-4"
        onSubmit={(
          event,
        ) => {
          event.preventDefault()

          void submit()
        }}
      >
        {step === 1 ? (
          <>
            <h2 className="typography-heading-2 text-neutral-900">
              기부할 물품을 알려주세요
            </h2>

            <label className="block space-y-2">
              <span className="typography-label-1 text-neutral-900">
                카테고리
              </span>

              <select
                aria-label="카테고리"
                aria-invalid={Boolean(
                  categoryError,
                )}
                value={
                  draft.category
                }
                className={`h-[54px] w-full rounded-input border bg-white px-4 typography-body-1 text-neutral-900 outline-none ${
                  categoryError
                    ? 'border-error'
                    : 'border-neutral-500'
                }`}
                disabled={
                  isCategoriesLoading ||
                  isCategoriesError
                }
                onChange={(
                  event,
                ) => {
                  const value =
                    event.target
                      .value

                  change(
                    'category',
                    value,
                  )

                  change(
                    'name',
                    '',
                  )

                  setCategoryError(
                    '',
                  )
                }}
              >
                <option value="">
                  {isCategoriesLoading
                    ? '카테고리를 불러오는 중...'
                    : '카테고리를 선택해 주세요'}
                </option>

                {itemCategories.map(
                  (
                    category,
                  ) => (
                    <option
                      key={
                        category.categoryId
                      }
                      value={
                        category.name
                      }
                    >
                      {
                        category.name
                      }
                    </option>
                  ),
                )}
              </select>

              {categoryError ? (
                <p className="typography-label-2 text-error">
                  {
                    categoryError
                  }
                </p>
              ) : null}

              {isCategoriesError ? (
                <button
                  type="button"
                  className="typography-label-1 text-primary-700 underline"
                  onClick={() =>
                    void refetchCategories()
                  }
                >
                  카테고리 다시 불러오기
                </button>
              ) : null}
            </label>

            <label className="block space-y-2">
              <span className="typography-label-1 text-neutral-900">
                품목
              </span>

              <select
                aria-label="품목"
                aria-invalid={Boolean(
                  errors.name,
                )}
                value={
                  draft.name
                }
                disabled={
                  !draft.category
                }
                className={`h-[54px] w-full rounded-input border bg-white px-4 typography-body-1 text-neutral-900 outline-none ${
                  errors.name
                    ? 'border-error'
                    : 'border-neutral-500'
                }`}
                onChange={(
                  event,
                ) =>
                  change(
                    'name',
                    event.target
                      .value,
                  )
                }
              >
                <option value="">
                  {draft.category
                    ? '품목을 선택해 주세요'
                    : '카테고리를 먼저 선택해 주세요'}
                </option>

                {itemOptions.map(
                  (
                    value,
                  ) => (
                    <option
                      key={
                        value
                      }
                      value={
                        value
                      }
                    >
                      {value}
                    </option>
                  ),
                )}
              </select>

              {errors.name ? (
                <p className="typography-label-2 text-error">
                  {
                    errors.name
                  }
                </p>
              ) : null}
            </label>

            <div className="space-y-2">
              <span className="block typography-label-1 text-neutral-900">
                수량
              </span>

              <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-2">
                <input
                  type="number"
                  min={1}
                  max={9999}
                  step={1}
                  aria-label="수량"
                  value={
                    Number.isNaN(
                      draft.quantity,
                    )
                      ? ''
                      : draft.quantity
                  }
                  className={`h-[54px] w-full rounded-input border bg-white px-4 typography-body-1 text-neutral-900 outline-none ${
                    errors.quantity
                      ? 'border-error'
                      : 'border-neutral-500'
                  }`}
                  onChange={(
                    event,
                  ) =>
                    change(
                      'quantity',
                      event.target
                        .value ===
                        ''
                        ? NaN
                        : Number(
                            event.target
                              .value,
                          ),
                    )
                  }
                />

                <select
                  aria-label="단위"
                  value={
                    selectedUnit
                  }
                  disabled={
                    isUnitsLoading ||
                    isUnitsError
                  }
                  className={`h-[54px] rounded-input border bg-white px-3 typography-body-1 text-neutral-900 outline-none ${
                    unitError
                      ? 'border-error'
                      : 'border-neutral-500'
                  }`}
                  onChange={(
                    event,
                  ) => {
                    setUnit(
                      event.target
                        .value,
                    )

                    setUnitError(
                      '',
                    )

                    setDirty(
                      true,
                    )
                  }}
                >
                  {itemUnits.map(
                    (
                      itemUnit,
                    ) => (
                      <option
                        key={
                          itemUnit
                        }
                        value={
                          itemUnit
                        }
                      >
                        {
                          itemUnit
                        }
                      </option>
                    ),
                  )}
                </select>
              </div>

              <p className="typography-label-2 text-neutral-600">
                예) 개, 권, 장, 벌,
                세트, 병, 박스, 켤레
              </p>

              {errors.quantity ? (
                <p className="typography-label-2 text-error">
                  {
                    errors.quantity
                  }
                </p>
              ) : null}

              {unitError ? (
                <p className="typography-label-2 text-error">
                  {
                    unitError
                  }
                </p>
              ) : null}

              {isUnitsError ? (
                <button
                  type="button"
                  className="typography-label-1 text-primary-700 underline"
                  onClick={() =>
                    void refetchUnits()
                  }
                >
                  단위 다시 불러오기
                </button>
              ) : null}
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <h2 className="typography-heading-2 text-neutral-900">
              물품 상태와 사진
            </h2>

            <fieldset>
              <legend className="mb-2 typography-label-1 text-neutral-900">
                물품 상태
              </legend>

              {isConditionsLoading ? (
                <p className="typography-body-2 text-neutral-700">
                  물품 상태 기준을
                  불러오고 있어요.
                </p>
              ) : null}

              {isConditionsError ? (
                <button
                  type="button"
                  className="typography-label-1 text-primary-700 underline"
                  onClick={() =>
                    void refetchConditions()
                  }
                >
                  상태 기준 다시 불러오기
                </button>
              ) : null}

              {!isConditionsLoading &&
                !isConditionsError ? (
                <div className="flex flex-wrap gap-2">
                  {itemConditions.map(
                    (
                      condition,
                    ) => {
                      const value =
                        conditionValueByCode[
                          condition.code
                        ]

                      const selected =
                        draft.condition ===
                        value

                      return (
                        <button
                          key={
                            condition.code
                          }
                          type="button"
                          aria-pressed={
                            selected
                          }
                          className={
                            selected
                              ? 'rounded-pill border border-primary-700 bg-primary-700 px-3 py-2 typography-label-1 text-white'
                              : 'rounded-pill border border-neutral-200 bg-white px-3 py-2 typography-label-1 text-neutral-700'
                          }
                          onClick={() =>
                            change(
                              'condition',
                              value,
                            )
                          }
                        >
                          {
                            condition.description
                          }
                        </button>
                      )
                    },
                  )}
                </div>
              ) : null}

              {errors.condition ? (
                <p className="mt-2 typography-label-2 text-error">
                  {
                    errors.condition
                  }
                </p>
              ) : null}
            </fieldset>

            <Textarea
              label="설명 (선택)"
              maxLength={1000}
              value={
                draft.description
              }
              error={
                errors.description
              }
              onChange={(
                event,
              ) =>
                change(
                  'description',
                  event.target
                    .value,
                )
              }
              placeholder="물품 상태나 전달할 내용을 적어 주세요."
            />

            <PhotoInput
              label="사진"
              flowStyle
              maxPhotos={5}
              photos={
                draft.photos
              }
              error={
                errors.photos
              }
              onChange={(
                photos,
              ) =>
                change(
                  'photos',
                  photos,
                )
              }
              onBusyChange={
                setBusy
              }
            />
          </>
        ) : null}

        {step === 3 ? (
          <>
            <h2 className="typography-heading-2 text-neutral-900">
              어디에서 전달할 수
              있나요?
            </h2>

            <p className="typography-body-2 text-neutral-700">
              기관과 정확한
              위치를 함께
              확인해요.
            </p>

            <AddressSearchField
              id="donation-pickup"
              label="물품 위치 *"
              stacked
              address={
                draft.location
              }
              detailAddress={
                detailAddress
              }
              onAddressChange={(
                value,
              ) =>
                change(
                  'location',
                  value,
                )
              }
              onDetailAddressChange={(
                value,
              ) => {
                setDetailAddress(
                  value,
                )

                setDirty(
                  true,
                )

                setFailure(
                  '',
                )
              }}
            />

            {errors.location ? (
              <p className="typography-label-2 text-error">
                {
                  errors.location
                }
              </p>
            ) : null}
          </>
        ) : null}

        {failure ? (
          <p
            role="alert"
            className="typography-label-2 text-error"
          >
            {failure}
          </p>
        ) : null}
      </form>

      <Dialog
        open={
          blocker.state ===
          'blocked'
        }
        title="작성 중인 내용을 버릴까요?"
        description="저장하지 않은 입력 내용은 사라집니다."
        confirmText="나가기"
        cancelText="계속 작성하기"
        onConfirm={() =>
          blocker.state ===
            'blocked' &&
          blocker.proceed()
        }
        onCancel={() =>
          blocker.state ===
            'blocked' &&
          blocker.reset()
        }
      />
    </DonorPage>
  )
}

function SummaryRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="grid grid-cols-[96px_1fr] gap-3">
      <dt className="typography-body-2 text-neutral-700">
        {label}
      </dt>

      <dd className="typography-body-2 text-neutral-900">
        {value}
      </dd>
    </div>
  )
}

function conditionDescription(
  condition:
    ItemConditionCode,
) {
  switch (condition) {
    case 'HIGH':
      return '상 · 미개봉'

    case 'MID':
      return '중 · 사용감 적음'

    case 'LOW':
      return '하 · 다회 사용'
  }
}