import {
  useState,
} from 'react'

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

import {
  Button,
} from '@/components/common/Button/Button'

import {
  DonorPage,
} from '@/features/donor/DonorPage'

import {
  useItemCategoriesQuery,
} from '@/hooks/queries/useItemCategoriesQuery'

import {
  ROUTES,
} from '@/routes/paths'

import {
  cn,
} from '@/utils/cn'

import type {
  ItemConditionCode,
} from '@/types/item'

const PILOT_REGION = {
  id: 1,
  name: '경기 부천시',
} as const

const CONDITION_OPTIONS:
  {
    code:
      ItemConditionCode

    label:
      string
  }[] = [
    {
      code:
        'HIGH',

      label:
        '상 · 미개봉',
    },

    {
      code:
        'MID',

      label:
        '중 · 사용감 적음',
    },

    {
      code:
        'LOW',

      label:
        '하 · 다회 사용',
    },
  ]

function parsePositiveId(
  value:
    | string
    | null,
) {
  if (
    !value ||
    !/^[1-9]\d*$/.test(
      value,
    )
  ) {
    return undefined
  }

  const id =
    Number(value)

  return Number.isSafeInteger(
    id,
  )
    ? id
    : undefined
}

function parseCondition(
  value:
    | string
    | null,
):
  | ItemConditionCode
  | undefined {
  if (
    value === 'HIGH' ||
    value === 'MID' ||
    value === 'LOW'
  ) {
    return value
  }

  return undefined
}

export function NeedFilterPage() {
  const navigate =
    useNavigate()

  const [
    searchParams,
  ] =
    useSearchParams()

  const categoryQuery =
    useItemCategoriesQuery()

  const [
    categoryId,
    setCategoryId,
  ] =
    useState<
      number | undefined
    >(() =>
      parsePositiveId(
        searchParams.get(
          'categoryId',
        ),
      ),
    )

  /*
   * 현재 백엔드는 파일럿 지역
   * 경기 부천시(regionId=1)만
   * 사용하고 있습니다.
   *
   * 지역 데이터가 확장되면
   * 이 부분만 지역 선택 UI로
   * 교체하면 됩니다.
   */
  const [
    regionId,
  ] =
    useState<number>(
      () =>
        parsePositiveId(
          searchParams.get(
            'regionId',
          ),
        ) ??
        PILOT_REGION.id,
    )

  const [
    condition,
    setCondition,
  ] =
    useState<
      | ItemConditionCode
      | undefined
    >(() =>
      parseCondition(
        searchParams.get(
          'condition',
        ),
      ),
    )

  const backQuery =
    searchParams.toString()

  const backTarget =
    `${ROUTES.donor.needList}${
      backQuery
        ? `?${backQuery}`
        : ''
    }`

  const applyFilters =
    () => {
      const next =
        new URLSearchParams(
          searchParams,
        )

      if (
        categoryId !==
        undefined
      ) {
        next.set(
          'categoryId',
          String(
            categoryId,
          ),
        )
      } else {
        next.delete(
          'categoryId',
        )
      }

      next.set(
        'regionId',
        String(regionId),
      )

      if (
        condition
      ) {
        next.set(
          'condition',
          condition,
        )
      } else {
        next.delete(
          'condition',
        )
      }

      const queryString =
        next.toString()

      navigate(
        `${ROUTES.donor.needList}${
          queryString
            ? `?${queryString}`
            : ''
        }`,
      )
    }

  return (
    <DonorPage
      title="검색 · 필터"
      back={
        backTarget
      }
      footer={
        <footer className="shrink-0 bg-surface-canvas p-5">
          <Button
            className="w-full"
            onClick={
              applyFilters
            }
          >
            적용
          </Button>
        </footer>
      }
    >
      <section className="space-y-3">
        <h2 className="typography-title-3 text-neutral-900">
          카테고리
        </h2>

        <div className="flex flex-wrap gap-2">
          <SelectionChip
            selected={
              categoryId ===
              undefined
            }
            onClick={() =>
              setCategoryId(
                undefined,
              )
            }
          >
            전체
          </SelectionChip>

          {categoryQuery.data?.map(
            (
              category,
            ) => (
              <SelectionChip
                key={
                  category.categoryId
                }
                selected={
                  categoryId ===
                  category.categoryId
                }
                onClick={() =>
                  setCategoryId(
                    category.categoryId,
                  )
                }
              >
                {
                  category.name
                }
              </SelectionChip>
            ),
          )}
        </div>

        {categoryQuery.isPending ? (
          <p
            role="status"
            className="typography-label-2 text-neutral-600"
          >
            카테고리를
            불러오고 있어요.
          </p>
        ) : null}

        {categoryQuery.isError ? (
          <p
            role="alert"
            className="typography-label-2 text-error"
          >
            카테고리를
            불러오지 못했어요.
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="typography-title-3 text-neutral-900">
          지역
        </h2>

        <div className="flex h-[54px] w-full items-center rounded-input border border-neutral-500 bg-white px-4">
          <span className="typography-body-1 text-neutral-900">
            {
              PILOT_REGION.name
            }
          </span>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="typography-title-3 text-neutral-900">
          희망 상태
        </h2>

        <div className="flex flex-wrap gap-2">
          {CONDITION_OPTIONS.map(
            (option) => (
              <SelectionChip
                key={
                  option.code
                }
                selected={
                  condition ===
                  option.code
                }
                onClick={() =>
                  setCondition(
                    (
                      current,
                    ) =>
                      current ===
                      option.code
                        ? undefined
                        : option.code,
                  )
                }
              >
                {
                  option.label
                }
              </SelectionChip>
            ),
          )}
        </div>
      </section>
    </DonorPage>
  )
}

function SelectionChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean

  onClick:
    () => void

  children:
    string
}) {
  return (
    <button
      type="button"
      aria-pressed={
        selected
      }
      className={cn(
        'shrink-0 rounded-pill border px-3 py-2 typography-label-1 transition-colors',

        selected
          ? 'border-primary-700 bg-primary-700 text-white'
          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100',
      )}
      onClick={
        onClick
      }
    >
      {children}
    </button>
  )
}