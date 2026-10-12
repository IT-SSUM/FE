import { useState } from 'react'
import { Check, ChevronLeft, ImagePlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { Button } from '@/components/common/Button/Button'
import { Dialog } from '@/components/common/Dialog/Dialog'
import { Input } from '@/components/common/Input/Input'
import { Textarea } from '@/components/common/Textarea/Textarea'
import { ROUTES, routePath } from '@/routes/paths'
import { cn } from '@/utils/cn'

type RegisterStep = 'details' | 'condition' | 'complete'

const conditionOptions = [
  '상 · 미개봉',
  '중 · 사용감 적음',
  '하 · 다회 사용',
] as const

export function DonationRegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<RegisterStep>('details')
  const [condition, setCondition] =
    useState<(typeof conditionOptions)[number]>('중 · 사용감 적음')
  const [photoSelected, setPhotoSelected] = useState(false)

  const isComplete = step === 'complete'

  const handleBack = () => {
    if (step === 'condition') {
      setStep('details')
      return
    }

    navigate(ROUTES.donor.home)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 items-center gap-2 bg-surface-canvas px-5">
        <button
          type="button"
          onClick={handleBack}
          aria-label="뒤로가기"
          className="flex size-6 items-center justify-center text-primary-700"
        >
          <ChevronLeft aria-hidden size={24} strokeWidth={2} />
        </button>
        <h1 className="typography-title-3 text-neutral-900">
          {isComplete ? '등록 완료' : '기부 물품 등록'}
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
        {step === 'details' ? (
          <DetailsStep onNext={() => setStep('condition')} />
        ) : null}
        {step === 'condition' ? (
          <ConditionStep
            condition={condition}
            onConditionChange={setCondition}
            photoSelected={photoSelected}
            onPhotoToggle={() => setPhotoSelected((selected) => !selected)}
          />
        ) : null}
        {isComplete ? <CompleteStep /> : null}
      </main>

      <footer className="border border-neutral-200 bg-surface-canvas px-5 py-5">
        <Button
          className="w-full"
          disabled={step === 'condition' && !photoSelected}
          onClick={() => {
            if (step === 'details') {
              setStep('condition')
              return
            }

            if (isComplete) {
              navigate(routePath.donorRecommendation('mock-donation-1'))
              return
            }

            setStep('complete')
          }}
        >
          {step === 'details'
            ? '다음'
            : isComplete
              ? '추천 기관 보기'
              : '등록하기'}
        </Button>
      </footer>

      {isComplete ? null : (
        <BottomNavigation activeItem="register" className="shrink-0" />
      )}

      <Dialog
        open={isComplete}
        title="물품이 등록됐어요!"
        confirmText="추천 기관 보기"
        cancelText="내 물품 보기"
        onConfirm={() => navigate(routePath.donorRecommendation('mock-donation-1'))}
        onCancel={() => navigate(routePath.donorDonationDetail('mock-donation-1'))}
        className="rounded-card text-center"
      />
    </div>
  )
}

type DetailsStepProps = {
  onNext: () => void
}

function DetailsStep({ onNext }: DetailsStepProps) {
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        onNext()
      }}
    >
      <p className="typography-label-1 text-primary-700">1 / 2 물품·지역</p>
      <h2 className="typography-heading-2 text-neutral-900">
        기부할 물품을 알려주세요
      </h2>

      <Input label="카테고리" required defaultValue="도서·문구" />
      <Input label="품목" required defaultValue="어린이 도서" />
      <Input label="수량" required defaultValue="30  권" inputMode="numeric" />
      <Input label="지역 (구 단위)" required defaultValue="서울 구로구" />
    </form>
  )
}

type ConditionStepProps = {
  condition: (typeof conditionOptions)[number]
  onConditionChange: (condition: (typeof conditionOptions)[number]) => void
  photoSelected: boolean
  onPhotoToggle: () => void
}

function ConditionStep({
  condition,
  onConditionChange,
  photoSelected,
  onPhotoToggle,
}: ConditionStepProps) {
  return (
    <section className="flex flex-col gap-4">
      <p className="typography-label-1 text-primary-700">2 / 2 상태·사진</p>
      <h2 className="typography-heading-2 text-neutral-900">물품 상태와 사진</h2>

      <fieldset className="flex flex-col gap-2">
        <legend className="typography-label-1 text-neutral-900">
          물품 상태 <span aria-hidden>*</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {conditionOptions.map((option) => {
            const selected = option === condition

            return (
              <button
                key={option}
                type="button"
                onClick={() => onConditionChange(option)}
                className={cn(
                  'shrink-0 rounded-pill px-3 py-2 typography-label-1 transition-colors',
                  selected
                    ? 'bg-primary-700 text-white'
                    : 'border border-neutral-200 bg-white text-neutral-700',
                )}
              >
                {option}
              </button>
            )
          })}
        </div>
      </fieldset>

      <Textarea
        label="설명 (선택)"
        defaultValue={
          '초등학생이 읽기 좋은 도서예요.\n큰 낙서나 찢어진 부분 없이 보관했어요.'
        }
        className="min-h-[120px] resize-none typography-body-1"
      />

      <div className="flex flex-col gap-2">
        <p className="typography-label-1 text-neutral-900">사진 (최소 1장)</p>
        <button
          type="button"
          onClick={onPhotoToggle}
          className={cn(
            'flex h-[120px] w-full flex-col items-center justify-center gap-2 rounded-card border border-dashed bg-white text-primary-700 transition-colors',
            photoSelected
              ? 'border-primary-700 bg-primary-100'
              : 'border-neutral-500 hover:border-primary-700',
          )}
        >
          {photoSelected ? (
            <Check aria-hidden size={32} strokeWidth={2.5} />
          ) : (
            <ImagePlus aria-hidden size={32} strokeWidth={2} />
          )}
          <span className="typography-label-1">
            {photoSelected ? '사진 1장 등록 완료' : '사진 1장 추가하기'}
          </span>
        </button>
        {!photoSelected ? (
          <p className="typography-label-2 text-error">
            등록하려면 물품 사진을 1장 이상 추가해 주세요.
          </p>
        ) : null}
      </div>
    </section>
  )
}

function CompleteStep() {
  return (
    <section className="pt-3">
      <div className="rounded-card border border-neutral-200 bg-white p-4">
        <h2 className="typography-title-2 text-neutral-900">어린이 도서</h2>
        <dl className="mt-2 flex flex-col gap-2 typography-body-2">
          <div className="grid grid-cols-[88px_1fr] gap-2">
            <dt className="text-neutral-700">품목 · 수량</dt>
            <dd className="text-neutral-900">도서 · 30권</dd>
          </div>
          <div className="grid grid-cols-[88px_1fr] gap-2">
            <dt className="text-neutral-700">물품 상태</dt>
            <dd className="text-neutral-900">중 · 처음 상태와 유사</dd>
          </div>
          <div className="grid grid-cols-[88px_1fr] gap-2">
            <dt className="text-neutral-700">물품 위치</dt>
            <dd className="text-neutral-900">서울 구로구</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
