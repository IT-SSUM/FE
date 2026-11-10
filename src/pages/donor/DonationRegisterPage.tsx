import {
  useSearchParams,
} from 'react-router-dom'

import {
  DonationForm,
} from '@/features/donor/DonationForm'

import {
  DonorPage,
} from '@/features/donor/DonorPage'

import {
  getNeededItemErrorMessage,
} from '@/apis/neededItem'

import {
  useNeededItemQuery,
} from '@/hooks/queries/useNeededItemQuery'

import {
  ROUTES,
} from '@/routes/paths'

export function DonationRegisterPage() {
  const [
    params,
  ] =
    useSearchParams()

  const needIdParam =
    params.get('needId')

  const needId =
    parsePositiveId(
      needIdParam,
    )

  const query =
    useNeededItemQuery(
      needId,
    )

  if (!needIdParam) {
    return (
      <DonationForm />
    )
  }

  if (needId === null) {
    return (
      <DonorPage
        title="기부 물품 등록"
        back={
          ROUTES.donor
            .needList
        }
      >
        <p
          role="alert"
          className="text-error"
        >
          올바른 필요 물품
          번호가 아니에요.
        </p>
      </DonorPage>
    )
  }

  if (
    query.isPending
  ) {
    return (
      <DonorPage
        title="기부 물품 등록"
        back={
          ROUTES.donor
            .needList
        }
      >
        <p role="status">
          필요한 물품 정보를
          불러오고 있어요.
        </p>
      </DonorPage>
    )
  }

  if (
    query.isError
  ) {
    return (
      <DonorPage
        title="기부 물품 등록"
        back={
          ROUTES.donor
            .needList
        }
      >
        <p
          role="alert"
          className="text-error"
        >
          {getNeededItemErrorMessage(
            query.error,
            '필요 물품 정보를 불러오지 못했어요.',
          )}
        </p>

        <button
          type="button"
          className="text-primary-700 underline"
          onClick={() =>
            void query.refetch()
          }
        >
          다시 시도
        </button>
      </DonorPage>
    )
  }

  const need =
    query.data

  if (!need) {
    return (
      <DonationForm />
    )
  }

  return (
    <DonationForm
      key={
        need.neededItemId
      }
      preset={{
        name:
          need.itemName,
        category:
          need.categoryName,
      }}
    />
  )
}

function parsePositiveId(
  value: string | null,
) {
  if (
    !value ||
    !/^[1-9]\d*$/.test(
      value,
    )
  ) {
    return null
  }

  const id =
    Number(value)

  return Number.isSafeInteger(
    id,
  )
    ? id
    : null
}