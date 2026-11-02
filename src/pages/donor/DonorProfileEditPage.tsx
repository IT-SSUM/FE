import { useEffect, useRef, useState } from 'react'
import { useBlocker, useNavigate } from 'react-router-dom'
import { Input } from '@/components/common/Input/Input'
import { Button } from '@/components/common/Button/Button'
import { Dialog } from '@/components/common/Dialog/Dialog'
import { ROUTES } from '@/routes/paths'
import { useDonorStore } from '@/features/donor/store'
import { today, validateProfile, type Profile } from '@/features/donor/model'
import { DonorPage } from '@/features/donor/DonorPage'
export function DonorProfileEditPage() {
  const profile = useDonorStore((state) => state.data.profile)
  const save = useDonorStore((state) => state.saveProfile)
  const [draft, setDraft] = useState(profile)
  const [errors, setErrors] = useState<Partial<Record<keyof Profile, string>>>({})
  const [failure, setFailure] = useState('')
  const saved = useRef(false)
  const dirty = JSON.stringify(draft) !== JSON.stringify(profile)
  const blocker = useBlocker(() => dirty && !saved.current)
  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  const navigate = useNavigate()
  return <DonorPage title="회원정보 수정" back={ROUTES.donor.myPage}>
    <form noValidate className="space-y-4" onSubmit={(event) => {
      event.preventDefault()
      const checked = validateProfile(draft); setErrors(checked)
      if (Object.keys(checked).length) return
      try { save(draft); saved.current = true; navigate(ROUTES.donor.myPage, { replace: true }) }
      catch (cause) { setFailure(cause instanceof Error ? cause.message : '저장하지 못했어요.') }
    }}>
      {([['name', '이름', 'text'], ['birthDate', '생년월일', 'date'], ['email', '이메일', 'email'], ['phone', '전화번호', 'tel'], ['address', '주소 (시·구 단위)', 'text']] as const).map(([key, label, type]) => <Input key={key} required label={label} type={type} max={key === 'birthDate' ? today() : undefined} maxLength={100} value={draft[key]} error={errors[key]} onChange={(event) => { setDraft({ ...draft, [key]: event.target.value }); setFailure('') }} />)}
      {failure ? <p role="alert" className="text-error">{failure}</p> : null}
      <Button type="submit" className="w-full">저장하기</Button>
    </form>
    <Dialog open={blocker.state === 'blocked'} title="수정 중인 내용을 버릴까요?" confirmText="나가기" cancelText="계속 수정하기" onConfirm={() => blocker.state === 'blocked' && blocker.proceed()} onCancel={() => blocker.state === 'blocked' && blocker.reset()} />
  </DonorPage>
}
