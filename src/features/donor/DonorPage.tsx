import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDonorStore } from './store'

export function DonorPage({ title, back, children, footer, mode = 'demo' }: { title: string; back: string; children: ReactNode; footer?: ReactNode; mode?: 'demo' | 'server' }) {
  const warning = useDonorStore((state) => state.storageWarning)
  return <div className="flex min-h-dvh flex-col bg-surface-canvas">
    <header className="flex min-h-14 items-center gap-2 px-5">
      <Link to={back} aria-label="뒤로가기" className="p-2 text-primary-700"><ChevronLeft aria-hidden size={24} /></Link>
      <h1 className="typography-title-3">{title}</h1>
    </header>
    <main className="flex-1 space-y-4 px-5 pb-6 pt-2">
      {mode === 'demo' ? <p className="typography-label-2 text-neutral-700">데모 모드 · 변경 내용은 현재 브라우저 세션에 저장됩니다.</p> : null}
      {mode === 'demo' && warning ? <p role="alert" className="text-error">{warning}</p> : null}
      {children}
    </main>
    {footer}
  </div>
}
export function EmptyState({ title, to, label }: { title: string; to: string; label: string }) {
  return <section className="rounded-card border border-neutral-200 bg-white p-6 text-center">
    <h2 className="typography-title-3">{title}</h2>
    <Link to={to} className="mt-3 inline-block py-2 text-primary-700">{label}</Link>
  </section>
}
