import { useEffect, useRef, useState } from 'react'
import { useBlocker, useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button/Button'
import { Input } from '@/components/common/Input/Input'
import { Textarea } from '@/components/common/Textarea/Textarea'
import { Dialog } from '@/components/common/Dialog/Dialog'
import { ROUTES, routePath } from '@/routes/paths'
import { canEdit, catalog, today, validateDonation, type Donation, type DonationInput } from './model'
import { useDonorStore } from './store'
import { DonorPage, EmptyState } from './DonorPage'
import { PhotoInput } from './PhotoInput'

export function DonationForm({ item, editing = false, preset }: { item?: Donation; editing?: boolean; preset?: { name: string; category: string } }) {
  const navigate = useNavigate()
  const save = useDonorStore((state) => state.save)
  const [draft, setDraft] = useState<DonationInput>(() => item ?? { name: preset?.name ?? '', category: preset?.category ?? '', quantity: 1, condition: '중', location: '', startDate: today(), endDate: today(), description: '', photos: [] })
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Partial<Record<keyof DonationInput, string>>>({})
  const [failure, setFailure] = useState('')
  const [busy, setBusy] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [savedId, setSavedId] = useState('')
  const blocker = useBlocker(dirty && !savedId)
  const submitted = useRef(false)
  const form = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (!dirty || savedId) return
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty, savedId])
  const change = <K extends keyof DonationInput>(key: K, value: DonationInput[K]) => {
    setDraft((previous) => ({ ...previous, [key]: value }))
    setErrors((previous) => ({ ...previous, [key]: undefined }))
    setFailure(''); setDirty(true)
  }
  const back = editing && item ? routePath.donorDonationDetail(item.id) : ROUTES.donor.myItems
  if (editing && (!item || !canEdit(item))) return <DonorPage title="기부 물품 수정" back={back}><EmptyState title={item ? '예약 중이거나 완료된 물품은 수정할 수 없어요' : '물품을 찾을 수 없어요'} to={back} label="돌아가기" /></DonorPage>
  function submit() {
    if (busy || submitted.current) return
    const checked = validateDonation(draft)
    const visibleErrors = step === 1 ? Object.fromEntries(Object.entries(checked).filter(([key]) => !['photos', 'condition', 'description'].includes(key))) : checked
    setErrors(visibleErrors)
    if (Object.keys(visibleErrors).length) { setFailure('필수 입력과 표시된 오류를 확인해 주세요.'); return }
    if (step === 1) { setStep(2); setFailure(''); return }
    submitted.current = true
    try { setSavedId(save(draft, editing ? item?.id : undefined)); setDirty(false) }
    catch (cause) { setFailure(cause instanceof Error ? cause.message : '저장하지 못했어요. 다시 시도해 주세요.'); submitted.current = false }
  }
  const selectClass = 'h-[54px] w-full rounded-input border border-neutral-500 bg-white px-4'
  return <DonorPage title={editing ? '기부 물품 수정' : '기부 물품 등록'} back={back} footer={
    <footer className="flex gap-2 border-t border-neutral-200 px-5 py-4">
      {step === 2 ? <Button variant="secondary" disabled={busy || Boolean(savedId)} onClick={() => setStep(1)}>이전</Button> : null}
      <Button className="flex-1" disabled={busy || Boolean(savedId)} onClick={() => form.current?.requestSubmit()}>{step === 1 ? '다음' : editing ? '수정 완료' : '등록하기'}</Button>
    </footer>
  }>
    <p className="typography-label-1 text-primary-700">{step} / 2 {step === 1 ? '물품·수령 정보' : '상태·사진'}</p>
    <form ref={form} noValidate className="space-y-4" onSubmit={(event) => { event.preventDefault(); submit() }}>
      {step === 1 ? <>
        <label className="block space-y-2"><span>카테고리 *</span><select aria-label="카테고리" value={draft.category} className={selectClass} onChange={(event) => { change('category', event.target.value); change('name', '') }}><option value="">선택해 주세요</option>{Object.keys(catalog).map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="block space-y-2"><span>품목 *</span><select aria-label="품목" aria-invalid={Boolean(errors.name)} value={draft.name} className={selectClass} onChange={(event) => change('name', event.target.value)}><option value="">선택해 주세요</option>{(catalog[draft.category] ?? []).map((value) => <option key={value}>{value}</option>)}</select>{errors.name ? <span className="text-error">{errors.name}</span> : null}</label>
        <Input label="수량 (개)" type="number" min={1} max={9999} step={1} required value={Number.isNaN(draft.quantity) ? '' : draft.quantity} error={errors.quantity} onChange={(event) => change('quantity', event.target.value === '' ? NaN : Number(event.target.value))} />
        <Input label="수령 지역 (시·구 단위)" required maxLength={100} value={draft.location} error={errors.location} onChange={(event) => change('location', event.target.value)} placeholder="서울 구로구" />
        <Input label="수령 시작일" type="date" required value={draft.startDate} error={errors.startDate} onChange={(event) => change('startDate', event.target.value)} />
        <Input label="수령 종료일" type="date" required min={draft.startDate > today() ? draft.startDate : today()} value={draft.endDate} error={errors.endDate} onChange={(event) => change('endDate', event.target.value)} />
      </> : <>
        <fieldset><legend className="mb-2 typography-label-1">물품 상태 *</legend>{[['상', '미개봉'], ['중', '사용했으나 처음 상태와 유사'], ['하', '다회 사용']].map(([value, label]) => <label key={value} className="mb-2 flex items-center gap-2 rounded-input border border-neutral-200 bg-white p-3"><input type="radio" name="condition" value={value} checked={draft.condition === value} onChange={() => change('condition', value)} />{value} · {label}</label>)}</fieldset>
        <Textarea label="상세 설명 (선택)" maxLength={1000} value={draft.description} error={errors.description} onChange={(event) => change('description', event.target.value)} />
        <PhotoInput photos={draft.photos} error={errors.photos} onChange={(photos) => change('photos', photos)} onBusyChange={setBusy} />
      </>}
      {failure ? <p role="alert" className="text-error">{failure}</p> : null}
    </form>
    <Dialog open={Boolean(savedId)} title={editing ? '물품을 수정했어요' : '물품을 등록했어요'} description="현재 브라우저에 저장했어요. 실제 기관에는 공개되지 않습니다." confirmText="내 물품 보기" cancelText="추천 기관 보기" onConfirm={() => navigate(routePath.donorDonationDetail(savedId), { replace: true })} onCancel={() => navigate(routePath.donorRecommendation(savedId), { replace: true })} />
    <Dialog open={blocker.state === 'blocked'} title="작성 중인 내용을 버릴까요?" description="저장하지 않은 입력 내용은 사라집니다." confirmText="나가기" cancelText="계속 작성하기" onConfirm={() => blocker.state === 'blocked' && blocker.proceed()} onCancel={() => blocker.state === 'blocked' && blocker.reset()} />
  </DonorPage>
}
