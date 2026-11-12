import { ChevronLeft } from 'lucide-react'
import {
  useRef,
  useState,
} from 'react'
import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  matchErrorMessage,
  parseMatchId,
} from '@/apis/match'
import { Button } from '@/components/common/Button/Button'
import { getAuthSession } from '@/features/auth/storage'
import { useUpdateMatchQuantityMutation } from '@/hooks/mutations/useUpdateMatchQuantityMutation'
import { useMatchQuery } from '@/hooks/queries/useMatchQuery'
import { routePath } from '@/routes/paths'
import type { MatchDetail } from '@/types/match'

export function TradeQuantityEditPage() {
  const navigate = useNavigate()
  const { tradeId } = useParams()
  const id = parseMatchId(tradeId)
  const query = useMatchQuery(id)

  if (
    id === null ||
    query.isPending ||
    query.isError ||
    !query.data
  ) {
    return (
      <div className="min-h-dvh bg-surface-canvas p-5">
        <h1 className="typography-title-3">
          수량 변경
        </h1>

        <p
          role={query.isError ? 'alert' : 'status'}
          className="mt-4"
        >
          {id === null
            ? '올바른 매칭 번호가 필요해요.'
            : query.isError
              ? matchErrorMessage(query.error)
              : '거래 정보를 불러오고 있어요.'}
        </p>

        {query.isError ? (
          <Button
            className="mt-4"
            onClick={() => void query.refetch()}
          >
            다시 시도
          </Button>
        ) : null}

        <Button
          variant="secondary"
          className="mt-2"
          onClick={() => navigate(-1)}
        >
          뒤로가기
        </Button>
      </div>
    )
  }

  return (
    <QuantityForm
      key={query.data.matchId}
      item={query.data}
    />
  )
}

function QuantityForm({
  item,
}: {
  item: MatchDetail
}) {
  const navigate = useNavigate()
  const mutation = useUpdateMatchQuantityMutation()
  const lock = useRef(false)

  const [quantity, setQuantity] =
    useState(String(item.quantity))

  const [error, setError] = useState('')

  const role = getAuthSession()?.role ?? null

  const allowed =
    role === 'DONOR' &&
    item.status === 'TRADING'

  const save = async () => {
    if (!allowed || lock.current) return

    const next = Number(quantity)

    if (
      !Number.isInteger(next) ||
      next < 1
    ) {
      setError(
        '수량은 1 이상의 정수로 입력해 주세요.',
      )
      return
    }

    lock.current = true
    setError('')

    try {
      await mutation.mutateAsync({
        matchId: item.matchId,
        body: {
          quantity: next,
        },
      })

      navigate(
        routePath.tradeDetail(
          String(item.matchId),
        ),
        {
          replace: true,
        },
      )
    } catch (cause) {
      setError(matchErrorMessage(cause))
    } finally {
      lock.current = false
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 shrink-0 items-center gap-2 px-5">
        <button
          type="button"
          aria-label="뒤로가기"
          disabled={mutation.isPending}
          onClick={() => navigate(-1)}
          className="flex size-6 items-center justify-center text-primary-700"
        >
          <ChevronLeft aria-hidden size={24} strokeWidth={2} />
        </button>

        <h1 className="typography-title-3 text-neutral-900">
          수량 변경
        </h1>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-4">
        <section className="rounded-card border border-neutral-200 bg-white p-4">
          <h2 className="typography-title-2 text-neutral-900">
            {item.donationItemName} · {item.quantity}{item.unit}
          </h2>

          <p className="mt-2 typography-label-2 text-neutral-700">
            처음 요청·제안한 수량 {item.initialQuantity}{item.unit}
          </p>
        </section>

        <div className="mt-5">
          <label
            htmlFor="trade-quantity"
            className="typography-label-1 text-neutral-900"
          >
            변경할 수량 *
          </label>

          <div className="relative mt-2">
            <input
              id="trade-quantity"
              inputMode="numeric"
              pattern="[0-9]*"
              value={quantity}
              disabled={!allowed || mutation.isPending}
              aria-invalid={Boolean(error)}
              className="h-[54px] w-full rounded-input border border-neutral-500 bg-white px-4 pr-14 typography-body-1 text-neutral-900 outline-none focus:border-primary-700 disabled:bg-neutral-100"
              onChange={(event) => {
                setQuantity(
                  event.target.value.replace(/\D/g, ''),
                )
                setError('')
              }}
            />

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 typography-body-1 text-neutral-700">
              {item.unit}
            </span>
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-2 typography-label-2 text-error"
            >
              {error}
            </p>
          ) : null}
        </div>

        <section className="mt-5 typography-label-2 leading-5 text-neutral-700">
          <p>
            협의 수량을 저장해도 예약으로 변경되지 않아요.
          </p>
          <p>
            기부자만 예약중으로 변경할 수 있어요.
          </p>
        </section>

        {!allowed ? (
          <p
            role="alert"
            className="mt-4 typography-label-2 text-error"
          >
            거래중인 기부자만 수량을 변경할 수 있어요.
          </p>
        ) : null}
      </main>

      <footer className="shrink-0 bg-surface-canvas px-5 pb-5 pt-3">
        <Button
          className="w-full"
          disabled={!allowed || mutation.isPending}
          onClick={() => void save()}
        >
          {mutation.isPending ? '저장 중...' : '저장'}
        </Button>
      </footer>
    </div>
  )
}