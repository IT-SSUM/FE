import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  confirmEmailVerification,
  getAuthErrorMessage,
  sendEmailVerification,
  signUpDonor,
  signUpOrganization,
  verifyBusiness,
} from '@/apis/auth'
import { clearAuthSession } from '@/features/auth/storage'
import { ROUTES } from '@/routes/paths'
import {
  agreementItems,
  donorFields,
  donorSteps,
  organizationFields,
  organizationSteps,
} from '@/features/auth/signup/constants'
import type { SignupAgreements, SignupRole, SignupValues } from '@/features/auth/signup/types'

export function useSignupController(role: SignupRole | undefined) {
  const navigate = useNavigate()
  const [stepIndex, setStepIndex] = useState(0)
  const [values, setValues] = useState<SignupValues>({})
  const [agreements, setAgreements] = useState<SignupAgreements>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [businessVerified, setBusinessVerified] = useState(false)
  const [businessVerificationToken, setBusinessVerificationToken] = useState('')
  const [eligibilityConfirmed, setEligibilityConfirmed] = useState(false)
  const [emailVerificationToken, setEmailVerificationToken] = useState('')
  const [emailVerificationSent, setEmailVerificationSent] = useState(false)
  const [emailVerificationLoading, setEmailVerificationLoading] = useState<'send' | 'confirm' | null>(null)
  const [emailVerificationError, setEmailVerificationError] = useState('')
  const [emailVerificationExpiresIn, setEmailVerificationExpiresIn] = useState(0)
  const [emailResendCooldown, setEmailResendCooldown] = useState(0)
  const [businessVerificationLoading, setBusinessVerificationLoading] = useState(false)
  const [businessVerificationError, setBusinessVerificationError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const fields = role === 'organization' ? organizationFields : donorFields
  const steps = role === 'organization' ? organizationSteps : donorSteps
  const step = steps[stepIndex]
  const roleLabel = role === 'organization' ? '기관' : '기부자'

  useEffect(() => {
    if (emailVerificationExpiresIn <= 0 && emailResendCooldown <= 0) return
    const timer = window.setInterval(() => {
      setEmailVerificationExpiresIn((current) => Math.max(0, current - 1))
      setEmailResendCooldown((current) => Math.max(0, current - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [emailVerificationExpiresIn, emailResendCooldown])

  const requiredFieldsComplete = fields
    .filter((field) => field.required)
    .every((field) => values[field.name]?.trim())
  const accountComplete =
    Boolean(values.email?.trim()) &&
    Boolean(emailVerificationToken) &&
    Boolean(values.password) &&
    Boolean(values.passwordConfirm) &&
    values.password === values.passwordConfirm &&
    /^(?=.*[A-Za-z])(?=.*\d)\S{8,20}$/.test(values.password)
  const businessFieldsComplete =
    values.businessNumber?.replace(/\D/g, '').length === 10 &&
    Boolean(values.openingDate?.trim())
  const agreementsComplete = agreementItems.every((item) => agreements[item.name])
  const canContinue = {
    profile: requiredFieldsComplete,
    account: accountComplete,
    business: businessVerified,
    eligibility: eligibilityConfirmed,
    agreements: agreementsComplete,
  }[step]

  const updateValue = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }))
    if (name === 'email') {
      setEmailVerificationToken('')
      setEmailVerificationSent(false)
      setEmailVerificationError('')
      setEmailVerificationExpiresIn(0)
      setEmailResendCooldown(0)
      setValues((current) => ({ ...current, email: value, emailCode: '' }))
    }
    if (['businessNumber', 'openingDate', 'representative'].includes(name)) {
      setBusinessVerified(false)
      setBusinessVerificationToken('')
      setBusinessVerificationError('')
    }
  }

  const sendVerification = async () => {
    const email = values.email?.trim() ?? ''
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailVerificationError('이메일 형식을 확인해 주세요.')
      return
    }
    setEmailVerificationLoading('send')
    setEmailVerificationError('')
    setEmailVerificationToken('')
    try {
      const result = await sendEmailVerification(email)
      setValues((current) => ({ ...current, emailCode: '' }))
      setEmailVerificationSent(true)
      setEmailVerificationExpiresIn(result.expiresInSeconds)
      setEmailResendCooldown(60)
    } catch (error) {
      setEmailVerificationError(getAuthErrorMessage(error, '인증번호를 보내지 못했어요. 잠시 후 다시 시도해 주세요.'))
    } finally {
      setEmailVerificationLoading(null)
    }
  }

  const confirmVerification = async () => {
    const code = values.emailCode?.trim() ?? ''
    if (!/^\d{6}$/.test(code)) {
      setEmailVerificationError('메일로 받은 6자리 인증번호를 입력해 주세요.')
      return
    }
    setEmailVerificationLoading('confirm')
    setEmailVerificationError('')
    try {
      const result = await confirmEmailVerification(values.email.trim(), code)
      setEmailVerificationToken(result.emailVerificationToken)
      setEmailVerificationExpiresIn(0)
    } catch (error) {
      setEmailVerificationError(getAuthErrorMessage(error, '인증번호를 확인하지 못했어요.'))
    } finally {
      setEmailVerificationLoading(null)
    }
  }

  const verifyOrganizationBusiness = async () => {
    setBusinessVerificationLoading(true)
    setBusinessVerificationError('')
    try {
      const result = await verifyBusiness({
        businessNumber: values.businessNumber.trim(),
        openingDate: values.openingDate,
        representativeName: values.representative.trim(),
      })
      setBusinessVerificationToken(result.businessVerificationToken)
      setBusinessVerified(true)
    } catch (error) {
      setBusinessVerificationError(getAuthErrorMessage(error, '사업자 정보를 확인하지 못했어요.'))
    } finally {
      setBusinessVerificationLoading(false)
    }
  }

  const goBack = () => {
    if (stepIndex === 0) navigate(ROUTES.signup)
    else setStepIndex((current) => current - 1)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!role || !canContinue) return
    if (stepIndex < steps.length - 1) {
      setStepIndex((current) => current + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setIsSubmitting(true)
    setSubmitError('')
    try {
      if (role === 'donor') {
        await signUpDonor({
          emailVerificationToken,
          email: values.email.trim(),
          password: values.password,
          name: values.name.trim(),
          birthDate: values.birthDate,
          phone: values.phone.trim(),
          ...(values.region === '경기도 부천시' ? { regionId: 1 } : {}),
          agreedTerms: ['SERVICE', 'PRIVACY'],
        })
      } else {
        await signUpOrganization({
          emailVerificationToken,
          businessVerificationToken,
          email: values.email.trim(),
          password: values.password,
          name: values.organizationName.trim(),
          representativeName: values.representative.trim(),
          businessNumber: values.businessNumber.trim(),
          openingDate: values.openingDate,
          phone: values.phone.trim(),
          address: values.address.trim(),
          addressDetail: values.addressDetail?.trim() || undefined,
          agreedTerms: ['SERVICE', 'PRIVACY', 'ORG_ELIGIBILITY'],
        })
      }
      clearAuthSession()
      navigate(ROUTES.root, { replace: true })
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error, '회원가입을 완료하지 못했어요. 입력 정보를 확인해 주세요.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    agreements,
    businessFieldsComplete,
    businessVerificationError,
    businessVerificationLoading,
    businessVerified,
    canContinue,
    confirmVerification,
    eligibilityConfirmed,
    emailResendCooldown,
    emailVerificationError,
    emailVerificationExpiresIn,
    emailVerificationLoading,
    emailVerificationSent,
    fields,
    goBack,
    isSubmitting,
    roleLabel,
    sendVerification,
    setAgreements,
    setEligibilityConfirmed,
    setShowPassword,
    setShowPasswordConfirm,
    showPassword,
    showPasswordConfirm,
    step,
    stepIndex,
    steps,
    submit,
    submitError,
    updateValue,
    values,
    verifyOrganizationBusiness,
    emailVerified: Boolean(emailVerificationToken),
  }
}
