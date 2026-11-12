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
  FilterSelect,
} from '@/components/common/FilterSelect/FilterSelect'

import {
  Input,
} from '@/components/common/Input/Input'

import {
  SelectField,
} from '@/components/common/SelectField/SelectField'

import {
  ROUTES,
  routePath,
} from '@/routes/paths'

import {
  today,
  validateDonation,
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

type DonationStep =
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

        condition:
          '중',

        location:
          '',

        startDate:
          today(),

        endDate:
          today(),

        description:
          '',

        photos:
          [],
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
    useState<DonationStep>(
      1,
    )

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
    savedItem,
    setSavedItem,
  ] =
    useState<
      DonationItemDetail | null
    >(null)

  const blocker =
    useBlocker(
      dirty &&
        !savedItem,
    )

  const submitted =
    useRef(false)

  const form =
    useRef<HTMLFormElement>(
      null,
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

  const visibleItemCategories =
    itemCategories.filter(
      (category) =>
        category.name !==
        '미사용 소모품',
    )

  useEffect(() => {
    if (
      !dirty ||
      savedItem
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
    savedItem,
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

        [key]:
          value,
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

    setFailure(
      '',
    )

    setDirty(
      true,
    )
  }

  async function submit() {
    if (
      busy ||
      createMutation.isPending ||
      submitted.current
    ) {
      return
    }

    const checked =
      validateDonation(
        draft,
      )

    delete checked.startDate
    delete checked.endDate

    const visibleKeys:
      Array<
        keyof DonationInput
      > =
      step === 1
        ? [
            'category',
            'name',
            'quantity',
          ]
        : step === 2
          ? [
              'condition',
              'description',
              'photos',
            ]
          : [
              'location',
            ]

    const visibleErrors =
      Object.fromEntries(
        Object.entries(
          checked,
        ).filter(
          ([key]) =>
            visibleKeys.includes(
              key as keyof DonationInput,
            ),
        ),
      ) as Partial<
        Record<
          keyof DonationInput,
          string
        >
      >

    setErrors(
      visibleErrors,
    )

    if (
      step === 1 &&
      !selectedUnit
    ) {
      setFailure(
        '물품 단위를 선택해 주세요.',
      )

      return
    }

    if (
      Object.keys(
        visibleErrors,
      ).length
    ) {
      setFailure(
        '필수 입력과 표시된 오류를 확인해 주세요.',
      )

      return
    }

    if (
      step === 1
    ) {
      setStep(
        2,
      )

      setFailure(
        '',
      )

      return
    }

    if (
      step === 2
    ) {
      setStep(
        3,
      )

      setFailure(
        '',
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
              draft.name.trim(),

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

      setSavedItem(
        created,
      )

      setDirty(
        false,
      )
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

  const moveBack =
    () => {
      setFailure(
        '',
      )

      if (
        step === 3
      ) {
        setStep(
          2,
        )

        return
      }

      if (
        step === 2
      ) {
        setStep(
          1,
        )
      }
    }

  if (
    savedItem
  ) {
    const savedId =
      String(
        savedItem.donationItemId,
      )

    return (
      <DonorPage
        title="등록 완료"
        back={
          ROUTES.donor
            .myItems
        }
      >
        <section className="rounded-card border border-neutral-200 bg-white p-4">
          <h2 className="typography-title-2 text-neutral-900">
            {
              savedItem.itemName
            }
          </h2>

          <dl className="mt-4 space-y-2">
            <SummaryRow
              label="품목 · 수량"
              value={`${savedItem.categoryName} · ${savedItem.quantity}${savedItem.unit}`}
            />

            <SummaryRow
              label="물품 상태"
              value={conditionDescription(
                savedItem.conditionGrade,
              )}
            />

            <SummaryRow
              label="물품 위치"
              value={
                savedItem.pickupAddress ||
                savedItem.regionName
              }
            />
          </dl>
        </section>

        <Dialog
          open
          title="물품이 등록됐어요!"
          confirmText="추천 기관 보기"
          cancelText="내 물품 보기"
          onConfirm={() =>
            navigate(
              routePath.donorRecommendation(
                savedId,
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
          }
          onCancel={() =>
            navigate(
              routePath.donorDonationDetail(
                savedId,
              ),
              {
                replace:
                  true,
              },
            )
          }
        />
      </DonorPage>
    )
  }

  const headerTitle =
    step === 3
      ? '전달 정보'
      : '기부 물품 등록'

  return (
    <DonorPage
      title={
        headerTitle
      }
      back={
        step === 1
          ? ROUTES.donor
              .myItems
          : undefined
      }
      onBack={
        step > 1
          ? moveBack
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
                step ===
                  1 &&
                (
                  isCategoriesLoading ||
                  isCategoriesError ||
                  isUnitsLoading ||
                  isUnitsError
                )
              ) ||
              (
                step ===
                  2 &&
                (
                  isConditionsLoading ||
                  isConditionsError
                )
              )
            }
            onClick={() =>
              form.current?.requestSubmit()
            }
          >
            {step <
            3
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
          : step ===
              2
            ? '상태·사진'
            : '위치'}
      </p>

      <form
        ref={
          form
        }
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

            <div className="flex w-full flex-col gap-2">
              <span className="text-[14px] font-medium leading-5 text-neutral-900">
                카테고리
              </span>

              <FilterSelect
                label="카테고리"
                showMenuLabel={false}
                includeAllOption={false}
                value={draft.category}
                options={visibleItemCategories.map((category) => category.name)}
                disabled={
                  isCategoriesLoading ||
                  isCategoriesError
                }
                className={`h-[54px] w-full justify-between rounded-input bg-white px-4 text-[15px] font-normal leading-[22.5px] text-neutral-900 ${
                  errors.category
                    ? 'border-error'
                    : 'border-neutral-500'
                }`}
                onChange={(value) => change('category', value)}
              />

              {errors.category ? (
                <p className="typography-label-2 text-error">
                  {
                    errors.category
                  }
                </p>
              ) : null}

              {isCategoriesError ? (
                <button
                  type="button"
                  className="self-start typography-label-1 text-primary-700 underline"
                  onClick={() =>
                    void refetchCategories()
                  }
                >
                  카테고리 다시 불러오기
                </button>
              ) : null}
            </div>

            <Input
              label="품목"
              value={
                draft.name
              }
              maxLength={
                100
              }
              error={
                errors.name
              }
              placeholder="예시) 어린이 도서, 책상, 수건"
              onChange={(
                event,
              ) =>
                change(
                  'name',
                  event.target
                    .value,
                )
              }
            />

            <div className="grid grid-cols-[minmax(0,1fr)_112px] items-end gap-2">
              <Input
                label="수량"
                type="number"
                min={
                  1
                }
                max={
                  9999
                }
                step={
                  1
                }
                value={
                  Number.isNaN(
                    draft.quantity,
                  )
                    ? ''
                    : draft.quantity
                }
                error={
                  errors.quantity
                }
                placeholder="수량"
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

              <div className="flex flex-col gap-2">
                <span className="typography-label-1 text-neutral-900">
                  단위
                </span>

                <SelectField
                  label="물품 단위"
                  value={
                    selectedUnit
                  }
                  options={
                    itemUnits
                  }
                  placeholder="선택"
                  disabled={
                    isUnitsLoading ||
                    isUnitsError
                  }
                  onChange={(
                    value,
                  ) => {
                    setUnit(
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
              </div>
            </div>

            {isUnitsError ? (
              <p
                role="alert"
                className="typography-label-2 text-error"
              >
                단위 목록을 불러오지 못했어요.{' '}

                <button
                  type="button"
                  className="font-semibold underline"
                  onClick={() =>
                    void refetchUnits()
                  }
                >
                  다시 시도
                </button>
              </p>
            ) : null}
          </>
        ) : null}

        {step === 2 ? (
          <>
            <h2 className="typography-heading-2 text-neutral-900">
              물품 상태와 사진
            </h2>

            <fieldset>
              <legend className="mb-3 typography-label-1 text-neutral-900">
                물품 상태
              </legend>

              {isConditionsLoading ? (
                <p
                  role="status"
                  className="typography-body-2 text-neutral-700"
                >
                  물품 상태 기준을 불러오고 있어요.
                </p>
              ) : null}

              {isConditionsError ? (
                <div>
                  <p
                    role="alert"
                    className="typography-body-2 text-error"
                  >
                    물품 상태 기준을 불러오지 못했어요.
                  </p>

                  <button
                    type="button"
                    className="mt-2 typography-label-1 text-primary-700 underline"
                    onClick={() =>
                      void refetchConditions()
                    }
                  >
                    다시 시도
                  </button>
                </div>
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
                              : 'rounded-pill border border-neutral-200 bg-white px-3 py-2 typography-label-1 text-neutral-700 transition-colors hover:border-primary-300'
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

            <div className="space-y-2">
              <label
                htmlFor="donation-description"
                className="block typography-label-1 text-neutral-900"
              >
                설명 (선택)
              </label>

              <textarea
                id="donation-description"
                maxLength={
                  1000
                }
                value={
                  draft.description
                }
                className={`min-h-[128px] w-full resize-none rounded-input border bg-white px-4 py-3 typography-body-1 text-neutral-900 outline-none transition-colors placeholder:text-neutral-500 focus:border-primary-700 ${
                  errors.description
                    ? 'border-error'
                    : 'border-neutral-500'
                }`}
                placeholder="물품 상태나 전달할 내용을 적어 주세요."
                onChange={(
                  event,
                ) =>
                  change(
                    'description',
                    event.target
                      .value,
                  )
                }
              />

              {errors.description ? (
                <p className="typography-label-2 text-error">
                  {
                    errors.description
                  }
                </p>
              ) : null}
            </div>

            <PhotoInput
              maxPhotos={
                5
              }
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
              어디에서 전달할 수 있나요?
            </h2>

            <p className="typography-body-2 text-neutral-700">
              기관과 정확한 위치를 함께 확인해요.
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
            {
              failure
            }
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
  switch (
    condition
  ) {
    case 'HIGH':
      return '상 · 미개봉'

    case 'MID':
      return '중 · 사용감 적음'

    case 'LOW':
      return '하 · 다회 사용'
  }
}
