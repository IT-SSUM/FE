import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

type DonorPageProps = {
  title: string
  back: string
  children: ReactNode
  footer?: ReactNode

  // 기존 호출부 호환용입니다.
  // 더 이상 demo UI를 표시하지 않습니다.
  mode?: 'demo' | 'server'
}

export function DonorPage({
  title,
  back,
  children,
  footer,
}: DonorPageProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex min-h-14 items-center gap-2 px-5">
        <Link
          to={back}
          aria-label="뒤로가기"
          className="p-2 text-primary-700"
        >
          <ChevronLeft
            aria-hidden
            size={24}
          />
        </Link>

        <h1 className="typography-title-3">
          {title}
        </h1>
      </header>

      <main className="flex-1 space-y-4 px-5 pb-6 pt-2">
        {children}
      </main>

      {footer}
    </div>
  )
}

export function EmptyState({
  title,
  to,
  label,
}: {
  title: string
  to: string
  label: string
}) {
  return (
    <section className="rounded-card border border-neutral-200 bg-white p-6 text-center">
      <h2 className="typography-title-3">
        {title}
      </h2>

      <Link
        to={to}
        className="mt-3 inline-block py-2 text-primary-700"
      >
        {label}
      </Link>
    </section>
  )
}