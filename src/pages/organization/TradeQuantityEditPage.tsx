import { useState, type FormEvent } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button/Button'
import { Input } from '@/components/common/Input/Input'
import { routePath } from '@/routes/paths'
import { organizationTrades } from './organizationTrades'

export function TradeQuantityEditPage() {
  const navigate = useNavigate()
  const { tradeId } = useParams()
  const trade =
    organizationTrades.find((item) => item.id === tradeId) ?? organizationTrades[0]
  const [itemName, currentQuantity = '10개'] = splitItem(trade.itemName)
  const [quantity, setQuantity] = useState(currentQuantity)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate(routePath.organizationActiveTradeDetail(trade.id), { replace: true })
  }

  return (
    <form
      className="flex min-h-dvh flex-col bg-surface-canvas"
      onSubmit={handleSubmit}
    >
      <header className="flex h-14 shrink-0 items-center gap-2 px-5">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-6 items-center justify-center text-primary-700"
        >
          <ChevronLeft aria-hidden size={24} strokeWidth={2} />
        </button>
        <h1 className="typography-title-3 text-neutral-900">수량 변경</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-5">
        <section className="rounded-card border border-neutral-200 bg-white p-4">
          <h2 className="text-base font-semibold leading-6 text-neutral-900">
            {itemName} · 현재 {currentQuantity}
          </h2>
          <p className="mt-3 text-xs font-normal leading-[18px] text-neutral-700">
            처음 요청한 수량 {currentQuantity}
          </p>
        </section>

        <div className="mt-5">
          <Input
            label="변경할 수량"
            required
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            labelClassName="text-xs font-bold leading-[18px]"
            className="typography-body-2"
          />
        </div>
      </main>

      <footer className="shrink-0 px-5 pb-4 pt-2">
        <Button type="submit" className="h-[46px] w-full">
          저장
        </Button>
      </footer>
    </form>
  )
}

function splitItem(itemName: string) {
  const match = itemName.match(/^(.+?)\s+(\d+(?:개|권|벌|세트))$/)
  return match ? [match[1], match[2]] : [itemName, '10개']
}
