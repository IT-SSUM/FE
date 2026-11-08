import { LoginForm } from '@/components/onboarding/login/LoginForm'
import { useLoginController } from '@/hooks/onboarding/useLoginController'

export function LoginPage() {
  const login = useLoginController()

  return (
    <LoginForm
      email={login.email}
      password={login.password}
      showPassword={login.showPassword}
      isSubmitting={login.isSubmitting}
      isFormComplete={login.isFormComplete}
      error={login.error}
      onEmailChange={login.setEmail}
      onPasswordChange={login.setPassword}
      onTogglePassword={() => login.setShowPassword((current) => !current)}
      onSubmit={login.submit}
    />
  )
}
