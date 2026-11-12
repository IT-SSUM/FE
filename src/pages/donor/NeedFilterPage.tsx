import {
  ChevronLeft,
} from 'lucide-react'

import {
  useMemo,
  useState,
} from 'react'

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

import {
  useItemCategoriesQuery,
} from '@/hooks/queries/useItemCategoriesQuery'

import {
  ROUTES,
} from '@/routes/paths'

import type {
  ItemConditionCode,
} from '@/types/item'

const PILOT_REGION = {
  id: 1,
  name: '경기 부천시',
} as const

const CONDITION_OPTIONS:
  Array<{
    value: ItemConditionCode
    label: string
  }> = [
    {
      value: 'HIGH',
      label: '상 · 미개봉',
    },

    {
      value: 'MID',
      label: '중 · 사용감 적음',
    },

    {
      value: 'LOW',
      label: '하 · 다회 사용',
    },
  ]

function parsePositiveId(
  value: string | null,
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
    Number(
      value,
    )

  return Number.isSafeInteger(
    id,
  )
    ? id
    : undefined
}

function parseCondition(
  value: string | null,
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

  const initialCategoryId =
    parsePositiveId(
      searchParams.get(
        'categoryId',
      ),
    )

  const initialRegionId =
    parsePositiveId(
      searchParams.get(
        'regionId',
      ),
    )

  const initialCondition =
    parseCondition(
      searchParams.get(
        'condition',
      ),
    )

  const [
    categoryId,
    setCategoryId,
  ] =
    useState<
      number | undefined
    >(
      initialCategoryId,
    )

  const [
    regionId,
    setRegionId,
  ] =
    useState<
      number | undefined
    >(
      initialRegionId,
    )

  const [
    condition,
    setCondition,
  ] =
    useState<
      ItemConditionCode | undefined
    >(
      initialCondition,
    )

  const categories =
    useMemo(
      () =>
        categoryQuery.data ??
        [],

      [
        categoryQuery.data,
      ],
    )

  const applyFilters =
    () => {
      const next =
        new URLSearchParams()

      const keyword =
        searchParams.get(
          'keyword',
        )

      if (
        keyword
      ) {
        next.set(
          'keyword',
          keyword,
        )
      }

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
      }

      if (
        regionId !==
        undefined
      ) {
        next.set(
          'regionId',

          String(
            regionId,
          ),
        )
      }

      if (
        condition
      ) {
        next.set(
          'condition',
          condition,
        )
      }

      const query =
        next.toString()

      navigate(
        `${ROUTES.donor.needList}${
          query
            ? `?${query}`
            : ''
        }`,
        {
          replace: true,
        },
      )
    }

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 shrink-0 items-center gap-2 px-5">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() =>
            navigate(-1)
          }
          className="flex size-6 items-center justify-center text-primary-700"
        >
          <ChevronLeft
            aria-hidden
            size={24}
            strokeWidth={2}
          />
        </button>

        <h1 className="typography-title-3 text-neutral-900">
          검색 · 필터
        </h1>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-5">
        <section>
          <h2 className="typography-title-3 text-neutral-900">
            카테고리
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">
            <FilterOption
              active={
                categoryId ===
                undefined
              }
              label="전체"
              onClick={() =>
                setCategoryId(
                  undefined,
                )
              }
            />

            {categories.map(
              (
                category,
              ) => (
                <FilterOption
                  key={
                    category.categoryId
                  }
                  active={
                    categoryId ===
                    category.categoryId
                  }
                  label={
                    category.name
                  }
                  onClick={() =>
                    setCategoryId(
                      category.categoryId,
                    )
                  }
                />
              ),
            )}
          </div>

          {categoryQuery.isError ? (
            <p className="mt-2 typography-label-2 text-error">
              카테고리를 불러오지
              못했어요.
            </p>
          ) : null}
        </section>

        <section className="mt-7">
          <h2 className="typography-title-3 text-neutral-900">
            지역
          </h2>

          <button
            type="button"
            aria-pressed={
              regionId ===
              PILOT_REGION.id
            }
            onClick={() =>
              setRegionId(
                (
                  current,
                ) =>
                  current ===
                  PILOT_REGION.id
                    ? undefined
                    : PILOT_REGION.id,
              )
            }
            className={
              regionId ===
              PILOT_REGION.id
                ? 'mt-3 flex h-[54px] w-full items-center rounded-input border border-primary-700 bg-primary-100 px-4 text-left typography-body-1 text-primary-700'
                : 'mt-3 flex h-[54px] w-full items-center rounded-input border border-neutral-500 bg-white px-4 text-left typography-body-1 text-neutral-900'
            }
          >
            {
              PILOT_REGION.name
            }
          </button>
        </section>

        <section className="mt-7">
          <h2 className="typography-title-3 text-neutral-900">
            희망 상태
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">
            {CONDITION_OPTIONS.map(
              (
                option,
              ) => (
                <FilterOption
                  key={
                    option.value
                  }
                  active={
                    condition ===
                    option.value
                  }
                  label={
                    option.label
                  }
                  onClick={() =>
                    setCondition(
                      (
                        current,
                      ) =>
                        current ===
                        option.value
                          ? undefined
                          : option.value,
                    )
                  }
                />
              ),
            )}
          </div>
        </section>
      </main>

      <footer className="shrink-0 bg-surface-canvas px-5 pb-5 pt-3">
        <button
          type="button"
          onClick={
            applyFilters
          }
          className="h-14 w-full rounded-control bg-primary-700 typography-title-3 text-white transition-colors hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
        >
          적용
        </button>
      </footer>
    </div>
  )
}

function FilterOption({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={
        active
      }
      onClick={
        onClick
      }
      className={
        active
          ? 'h-9 rounded-pill bg-primary-700 px-4 typography-label-1 text-white'
          : 'h-9 rounded-pill border border-neutral-200 bg-white px-4 typography-label-1 text-neutral-700'
      }
    >
      {label}
    </button>
  )
}