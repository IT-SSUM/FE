import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <section className="mx-auto max-w-5xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-emerald-700">ISSUM</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          지역사회 물품 나눔 플랫폼
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
          현재 화면은 초기세팅 확인용 임시 홈입니다. 인증, 권한 분기, 실제
          서비스 진입 흐름은 추후 담당 파트에서 연결합니다.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link
            to={ROUTES.donor.home}
            className="rounded-md bg-emerald-700 px-4 py-2 font-medium text-white"
          >
            기부자 홈
          </Link>
          <Link
            to={ROUTES.organization.home}
            className="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700"
          >
            기관 홈
          </Link>
        </div>
      </section>
    </main>
  )
}
