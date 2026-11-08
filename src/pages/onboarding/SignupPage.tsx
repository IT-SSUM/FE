import { ArrowLeft } from 'lucide-react'
import { Navigate, useParams } from 'react-router-dom'
import { BusinessVerificationStep } from '@/components/onboarding/signup/BusinessVerificationStep'
import { OrganizationEligibilityStep } from '@/components/onboarding/signup/OrganizationEligibilityStep'
import { SignupAccountStep } from '@/components/onboarding/signup/SignupAccountStep'
import { SignupAgreementStep } from '@/components/onboarding/signup/SignupAgreementStep'
import { SignupProfileStep } from '@/components/onboarding/signup/SignupProfileStep'
import { SignupRoleSelection } from '@/components/onboarding/signup/SignupRoleSelection'
import { stepLabels } from '@/features/auth/signup/constants'
import type { SignupRole } from '@/features/auth/signup/types'
import { useSignupController } from '@/hooks/onboarding/useSignupController'
import { ROUTES } from '@/routes/paths'

export function SignupPage() {
  const { role: roleParam } = useParams()
  const role = roleParam as SignupRole | undefined
  const signup = useSignupController(role)

  if (roleParam && roleParam !== 'donor' && roleParam !== 'organization') {
    return <Navigate to={ROUTES.signup} replace />
  }
  if (!role) return <SignupRoleSelection />

  return (
    <main className="min-h-dvh bg-[#eaf2ed]">
      <section className="mx-auto flex min-h-dvh w-full max-w-[393px] flex-col bg-surface-canvas min-[394px]:shadow-[0_0_0_1px_rgb(31_122_96/6%),0_18px_48px_rgb(18_61_49/10%)]">
        <header className="flex min-h-[72px] items-center px-5 [&_h1]:ml-2 [&_h1]:text-base [&_h1]:font-semibold [&_h1]:leading-6">
          <button type="button" onClick={signup.goBack} className="inline-flex size-10 items-center justify-center rounded-full border-0 bg-transparent text-primary-700 hover:bg-primary-100" aria-label="이전 단계로 돌아가기">
            <ArrowLeft aria-hidden size={21} strokeWidth={1.8} />
          </button>
          <h1>{signup.step === 'profile' ? `${signup.roleLabel} 회원가입` : '회원가입'}</h1>
        </header>

        <form className="flex flex-1 flex-col" onSubmit={signup.submit}>
          <div className="px-5 pb-7 pt-3 [&_h2]:mt-2 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-8 [&_h2]:tracking-[-0.02em]">
            <p className="m-0 text-sm font-bold leading-5 text-primary-600">
              {signup.stepIndex + 1} / {signup.steps.length} · {stepLabels[signup.step]}
            </p>

            {signup.step === 'profile' ? (
              <SignupProfileStep
                role={role}
                fields={signup.fields}
                values={signup.values}
                onChange={signup.updateValue}
              />
            ) : null}

            {signup.step === 'account' ? (
              <SignupAccountStep
                role={role}
                values={signup.values}
                showPassword={signup.showPassword}
                showPasswordConfirm={signup.showPasswordConfirm}
                onChange={signup.updateValue}
                onTogglePassword={() => signup.setShowPassword((current) => !current)}
                onTogglePasswordConfirm={() => signup.setShowPasswordConfirm((current) => !current)}
                verificationSent={signup.emailVerificationSent}
                verified={signup.emailVerified}
                verificationLoading={signup.emailVerificationLoading}
                verificationError={signup.emailVerificationError}
                verificationExpiresIn={signup.emailVerificationExpiresIn}
                resendCooldown={signup.emailResendCooldown}
                onSendVerification={signup.sendVerification}
                onConfirmVerification={signup.confirmVerification}
              />
            ) : null}

            {signup.step === 'business' ? (
              <BusinessVerificationStep
                values={signup.values}
                verified={signup.businessVerified}
                canVerify={signup.businessFieldsComplete}
                onChange={signup.updateValue}
                loading={signup.businessVerificationLoading}
                error={signup.businessVerificationError}
                onVerify={signup.verifyOrganizationBusiness}
              />
            ) : null}

            {signup.step === 'eligibility' ? (
              <OrganizationEligibilityStep
                confirmed={signup.eligibilityConfirmed}
                onChange={signup.setEligibilityConfirmed}
              />
            ) : null}

            {signup.step === 'agreements' ? (
              <SignupAgreementStep agreements={signup.agreements} onChange={signup.setAgreements} />
            ) : null}
          </div>

          <div className="sticky bottom-0 z-2 mt-auto border-t border-neutral-200 bg-surface-canvas px-5 py-4">
            {signup.submitError ? <p className="mb-3 text-center text-xs leading-[18px] text-error" role="alert">{signup.submitError}</p> : null}
            <button type="submit" className="inline-flex h-[52px] w-full items-center justify-center rounded-[14px] border border-primary-700 bg-primary-700 px-5 text-sm font-bold text-white transition-colors hover:border-primary-800 hover:bg-primary-800 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-200 disabled:text-neutral-500" disabled={!signup.canContinue || signup.isSubmitting}>
              {signup.isSubmitting ? '가입 중...' : signup.step === 'agreements' ? '가입하기' : '다음'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
