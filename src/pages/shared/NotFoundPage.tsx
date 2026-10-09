import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export function NotFoundPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-emerald-700">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">
          페이지를 찾을 수 없습니다
        </h1>
        <Link
          to={ROUTES.root}
          className="mt-6 inline-block rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white"
        >
          홈으로 이동
        </Link>
      </section>
    </main>
  )
}
