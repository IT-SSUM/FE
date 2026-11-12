import {
  useRef,
  useState,
  type FormEvent,
} from 'react'

import {
  ChevronLeft,
} from 'lucide-react'

import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  matchErrorMessage,
  parseMatchId,
} from '@/apis/match'

import {
  Button,
} from '@/components/common/Button/Button'

import {
  DateField,
} from '@/components/common/DateField/DateField'

import {
  OptionCardGroup,
} from '@/components/common/OptionCardGroup/OptionCardGroup'

import {
  TimeField,
} from '@/components/common/TimeField/TimeField'

import {
  getAuthSession,
} from '@/features/auth/storage'

import {
  useUpdateMatchAppointmentMutation,
} from '@/hooks/mutations/useUpdateMatchAppointmentMutation'

import {
  useMatchQuery,
} from '@/hooks/queries/useMatchQuery'

import {
  routePath,
} from '@/routes/paths'

import type {
  MatchDetail,
} from '@/types/match'

const DELIVERY_OPTIONS = [
  '직접 전달',
  '택배',
] as const

export function TradeAppointmentPage() {
  const navigate =
    useNavigate()

  const {
    tradeId,
  } =
    useParams()

  const id =
    parseMatchId(
      tradeId,
    )

  const query =
    useMatchQuery(
      id,
    )

  if (
    id === null ||
    query.isPending ||
    query.isError ||
    !query.data
  ) {
    return (
      <div className="min-h-dvh bg-surface-canvas p-5">
        <h1 className="typography-title-3">
          전달 약속
        </h1>

        <p
          role={
            query.isError
              ? 'alert'
              : 'status'
          }
          className="mt-4"
        >
          {id === null
            ? '올바른 매칭 번호가 필요해요.'
            : query.isError
              ? matchErrorMessage(
                  query.error,
                )
              : '거래 정보를 불러오고 있어요.'}
        </p>

        {query.isError ? (
          <Button
            className="mt-4"
            onClick={() =>
              void query.refetch()
            }
          >
            다시 시도
          </Button>
        ) : null}

        <Button
          variant="secondary"
          className="mt-2"
          onClick={() =>
            navigate(-1)
          }
        >
          뒤로가기
        </Button>
      </div>
    )
  }

  return (
    <AppointmentForm
      key={
        query.data.matchId
      }
      item={
        query.data
      }
    />
  )
}

function AppointmentForm({
  item,
}: {
  item:
    MatchDetail
}) {
  const navigate =
    useNavigate()

  const mutation =
    useUpdateMatchAppointmentMutation()

  const lock =
    useRef(false)

  const [
    initial,
  ] =
    useState(() =>
      kstFields(
        item.scheduledAt,
      ),
    )

  const [
    date,
    setDate,
  ] =
    useState(
      initial.date,
    )

  const [
    time,
    setTime,
  ] =
    useState(
      initial.time,
    )

  const [
    place,
    setPlace,
  ] =
    useState(
      item.deliveryPlace ??
        '',
    )

  const [
    method,
    setMethod,
  ] =
    useState(
      item.deliveryMethod ===
        'PARCEL'
        ? '택배'
        : '직접 전달',
    )

  const [
    error,
    setError,
  ] =
    useState('')

  const role =
    getAuthSession()?.role ??
    null

  const allowed =
    item.status ===
      'RESERVED' &&
    role ===
      'DONOR'

  const receiverName =
    item.receiverName?.trim() ||
    item.organizationName

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      lock.current ||
      !allowed
    ) {
      return
    }

    setError('')

    if (
      !date ||
      !time ||
      !place.trim()
    ) {
      setError(
        '날짜·시간과 전달 장소를 입력해 주세요.',
      )

      return
    }

    lock.current =
      true

    try {
      await mutation.mutateAsync(
        {
          matchId:
            item.matchId,

          body: {
            deliveryMethod:
              method ===
              '택배'
                ? 'PARCEL'
                : 'DIRECT',

            scheduledAt:
              `${date}T${time}:00+09:00`,

            deliveryPlace:
              place.trim(),

            receiverName,
          },
        },
      )

      navigate(
        routePath.tradeDetail(
          String(
            item.matchId,
          ),
        ),

        {
          replace:
            true,
        },
      )
    } catch (
      cause
    ) {
      setError(
        matchErrorMessage(
          cause,
        ),
      )
    } finally {
      lock.current =
        false
    }
  }

  return (
    <form
      className="flex min-h-dvh flex-col bg-surface-canvas"
      onSubmit={
        handleSubmit
      }
    >
      <header className="flex h-14 shrink-0 items-center gap-2 px-5">
        <button
          type="button"
          aria-label="뒤로가기"
          disabled={
            mutation.isPending
          }
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
          전달 약속
        </h1>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-5">
        <fieldset
          disabled={
            !allowed ||
            mutation.isPending
          }
          className="space-y-5"
        >
          <DateField
            id="appointment-date"
            label="날짜"
            value={
              date
            }
            onChange={
              setDate
            }
            yearOrder="ascending"
            labelClassName="typography-label-1"
          />

          <TimeField
            id="appointment-time"
            label="시간"
            value={
              time
            }
            onChange={
              setTime
            }
            labelClassName="typography-label-1"
          />

          <div>
            <label
              htmlFor="appointment-place"
              className="mb-2 block typography-label-1 text-neutral-900"
            >
              {method ===
              '택배'
                ? '택배 수령 주소 *'
                : '전달 장소 *'}
            </label>

            <input
              id="appointment-place"
              type="text"
              value={
                place
              }
              placeholder={
                method ===
                '택배'
                  ? '택배 수령 주소를 입력해 주세요'
                  : '전달 장소를 입력해 주세요'
              }
              className="h-[54px] w-full rounded-input border border-neutral-500 bg-white px-4 typography-body-1 text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-primary-700"
              onChange={(
                event,
              ) =>
                setPlace(
                  event.target
                    .value,
                )
              }
            />
          </div>

          <OptionCardGroup
            label="전달 방법"
            columns={2}
            options={
              DELIVERY_OPTIONS
            }
            value={
              method
            }
            onChange={
              setMethod
            }
          />
        </fieldset>

        {!allowed ? (
          <p
            role="alert"
            className="mt-4 typography-label-2 text-error"
          >
            예약중인 기부자만
            전달 약속을 저장할 수
            있어요.
          </p>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="mt-4 typography-label-2 text-error"
          >
            {
              error
            }
          </p>
        ) : null}
      </main>

      <footer className="shrink-0 bg-surface-canvas px-5 pb-5 pt-3">
        <Button
          type="submit"
          className="w-full"
          disabled={
            !allowed ||
            mutation.isPending
          }
        >
          {mutation.isPending
            ? '저장 중...'
            : '약속 저장'}
        </Button>
      </footer>
    </form>
  )
}

function kstFields(
  value:
    string | null,
) {
  if (
    !value ||
    !Number.isFinite(
      Date.parse(
        value,
      ),
    )
  ) {
    return {
      date: '',
      time: '14:00',
    }
  }

  const parts =
    new Intl.DateTimeFormat(
      'en-CA',
      {
        timeZone:
          'Asia/Seoul',

        year:
          'numeric',

        month:
          '2-digit',

        day:
          '2-digit',

        hour:
          '2-digit',

        minute:
          '2-digit',

        hourCycle:
          'h23',
      },
    ).formatToParts(
      new Date(
        value,
      ),
    )

  const part =
    (
      type:
        string,
    ) =>
      parts.find(
        (item) =>
          item.type ===
          type,
      )?.value ??
      ''

  return {
    date:
      `${part('year')}-${part('month')}-${part('day')}`,

    time:
      `${part('hour')}:${part('minute')}`,
  }
}