import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
export function TradeQuantityEditPage() {
  const navigate = useNavigate()
  return <div className="flex min-h-dvh flex-col bg-surface-canvas">
    <header className="flex h-14 shrink-0 items-center gap-2 px-5">
      <button type="button" aria-label="뒤로가기" onClick={() => navigate(-1)} className="flex size-6 items-center justify-center text-primary-700"><ChevronLeft aria-hidden size={24} /></button>
      <h1 className="typography-title-3 text-neutral-900">수량 변경</h1>
    </header>
    <main className="flex-1 px-5 pb-6 pt-5"><p role="status">거래중 합의 수량은 기부자만 변경할 수 있어요. 기부자와 수량을 협의해 주세요.</p></main>
  </div>
}
