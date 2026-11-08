import { Link } from 'react-router-dom'
import mascot from '@/assets/images/mascot/mascot.svg'
import { ROUTES, routePath } from '@/routes/paths'

export function SignupRoleSelection() {
  return (
    <main className="min-h-dvh bg-[#eaf2ed]">
      <section className="mx-auto min-h-dvh w-full max-w-[393px] bg-surface-canvas px-5 pb-10 pt-[68px] min-[394px]:shadow-[0_0_0_1px_rgb(31_122_96/6%),0_18px_48px_rgb(18_61_49/10%)]">
        <div className="[&_h1]:m-0 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:leading-[34px] [&_h1]:tracking-[-0.02em] [&_p]:mt-5 [&_p]:text-sm [&_p]:leading-5 [&_p]:text-neutral-600">
          <h1>작은 나눔이<br />큰 연결이 되는 곳</h1>
          <p>쓸 수 있는 물품을, 가까운 복지기관과 나눠요.</p>
        </div>

        <div className="mt-6 flex h-[150px] w-full items-center justify-center rounded-[18px] bg-error-bg [&_img]:w-[126px]">
          <img src={mascot} alt="IT:SSUM 상자 마스코트" />
        </div>

        <div className="mt-5 grid gap-4">
          <Link to={routePath.signup('donor')} className="flex min-h-[84px] flex-col justify-center rounded-[18px] border border-primary-200 bg-primary-100 p-4 [&_strong]:text-base [&_strong]:leading-6 [&_span]:mt-1.5 [&_span]:text-[13px] [&_span]:leading-5 [&_span]:text-neutral-600">
            <strong>물품을 기부하고 싶어요</strong>
            <span>개인 · 학교 · 기업 · 단체</span>
          </Link>
          <Link to={routePath.signup('organization')} className="flex min-h-[84px] flex-col justify-center rounded-[18px] border border-neutral-300 bg-white p-4 [&_strong]:text-base [&_strong]:leading-6 [&_span]:mt-1.5 [&_span]:text-[13px] [&_span]:leading-5 [&_span]:text-neutral-600">
            <strong>물품이 필요한 기관이에요</strong>
            <span>사업자 확인과 필수 동의 후 필요 물품을 등록해요.</span>
          </Link>
        </div>

        <p className="mt-5 text-[13px] leading-5 text-primary-700 [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-3">이미 계정이 있나요? <Link to={ROUTES.login}>로그인</Link></p>
      </section>
    </main>
  )
}
