import { useState, type FormEvent } from 'react'
import { CheckCircle2, ChevronLeft, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button/Button'
import { Dialog } from '@/components/common/Dialog/Dialog'
import { Input } from '@/components/common/Input/Input'
import { Textarea } from '@/components/common/Textarea/Textarea'
import { PhotoInput } from '@/features/donor/PhotoInput'
import { ROUTES, routePath } from '@/routes/paths'
import { cn } from '@/utils/cn'

const categories = [
  '생활용품',
  '의류 · 잡화',
  '가구',
  '주방용품',
  '도서 · 문구',
  '유아 · 아동용품',
  '기타',
] as const

const conditionOptions = ['상 · 미개봉', '중 · 사용감 적음', '하 · 다회 사용'] as const

export function NeedRegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)
  const [categoryPanelOpen, setCategoryPanelOpen] = useState(false)
  const [regionPanelOpen, setRegionPanelOpen] = useState(false)
  const [regionQuery, setRegionQuery] = useState('')
  const [category, setCategory] = useState<(typeof categories)[number]>('생활용품')
  const [draftCategory, setDraftCategory] = useState(category)
  const [itemName, setItemName] = useState('생수')
  const [quantity, setQuantity] = useState('20개')
  const [region, setRegion] = useState('경기도 부천시')
  const [condition, setCondition] =
    useState<(typeof conditionOptions)[number]>('중 · 사용감 적음')
  const [reason, setReason] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [photoBusy, setPhotoBusy] = useState(false)
  const [completeOpen, setCompleteOpen] = useState(false)

  const openCategoryPanel = () => {
    setDraftCategory(category)
    setCategoryPanelOpen(true)
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
      return
    }
    navigate(ROUTES.organization.home)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (step === 1) {
      setStep(2)
      return
    }
    setCompleteOpen(true)
  }

  if (categoryPanelOpen) {
    return (
      <div className="flex min-h-dvh flex-col bg-surface-canvas">
        <PageHeader
          title="카테고리 선택"
          onBack={() => setCategoryPanelOpen(false)}
        />

        <main className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
          <h2 className="typography-heading-3 text-neutral-900">
            어떤 물품인가요?
          </h2>
          <p className="mt-2 typography-label-2 text-neutral-600">
            정확히 카테고리에서 가장 가까운 항목을 골라주세요.
          </p>

          <fieldset className="mt-4 space-y-3">
            <legend className="sr-only">카테고리</legend>
            {categories.map((option) => {
              const selected = option === draftCategory

              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setDraftCategory(option)}
                  style={{ minHeight: 52 }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-control border px-4 text-left typography-body-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700',
                    selected
                      ? 'border-transparent bg-primary-100 text-primary-700'
                      : 'border-neutral-200 bg-white text-neutral-900',
                  )}
                >
                  {selected ? (
                    <CheckCircle2 aria-hidden size={20} strokeWidth={2} />
                  ) : null}
                  <span>{option}</span>
                </button>
              )
            })}
          </fieldset>
        </main>

        <footer className="shrink-0 bg-surface-canvas px-5 pb-4 pt-2">
          <Button
            className="h-[46px] w-full"
            onClick={() => {
              setCategory(draftCategory)
              setCategoryPanelOpen(false)
            }}
          >
            적용
          </Button>
        </footer>
      </div>
    )
  }

  if (regionPanelOpen) {
    const showBucheon =
      !regionQuery.trim() || '경기도 부천시'.includes(regionQuery.trim())

    return (
      <div className="flex min-h-dvh flex-col bg-surface-canvas">
        <PageHeader
          title="지역 선택"
          onBack={() => setRegionPanelOpen(false)}
        />

        <main className="flex-1 overflow-y-auto px-5 pb-6 pt-4">
          <label
            htmlFor="region-search"
            className="text-xs font-bold leading-[18px] text-neutral-900"
          >
            지역 검색
          </label>
          <div className="mt-3 flex gap-2">
            <input
              id="region-search"
              type="search"
              value={regionQuery}
              onChange={(event) => setRegionQuery(event.target.value)}
              placeholder="시·군·구 검색"
              className="h-[52px] min-w-0 flex-1 rounded-input border border-neutral-500 bg-white px-4 typography-body-2 text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-primary-700"
            />
            <button
              type="button"
              className="flex h-[52px] shrink-0 items-center gap-2 rounded-control bg-primary-700 px-4 typography-title-3 text-white transition-colors hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
            >
              <Search aria-hidden size={18} strokeWidth={2} />
              검색
            </button>
          </div>

          <section className="mt-4" aria-label="선택 가능한 지역">
            {showBucheon ? (
              <button
                type="button"
                aria-pressed="true"
                onClick={() => setRegion('경기도 부천시')}
                style={{ minHeight: 52 }}
                className="flex w-full items-center gap-3 rounded-control border border-primary-300 bg-primary-100 px-4 text-left typography-body-2 text-primary-700"
              >
                <CheckCircle2 aria-hidden size={20} strokeWidth={2} />
                경기도 부천시
              </button>
            ) : (
              <div className="rounded-control border border-neutral-200 bg-white px-4 py-8 text-center typography-body-2 text-neutral-600">
                선택할 수 있는 지역은 경기도 부천시예요.
              </div>
            )}
          </section>

          <p className="mt-4 typography-label-2 text-neutral-600">
            시·군·구 단위로 공개돼요. 상세 위치는 채팅에서 협의해요.
          </p>
        </main>

        <footer className="shrink-0 bg-surface-canvas px-5 pb-4 pt-2">
          <Button
            className="h-[46px] w-full"
            onClick={() => {
              setRegion('경기도 부천시')
              setRegionPanelOpen(false)
            }}
          >
            적용
          </Button>
        </footer>
      </div>
    )
  }

  return (
    <form
      className="flex min-h-dvh flex-col bg-surface-canvas"
      onSubmit={handleSubmit}
    >
      <PageHeader title="필요 물품 등록" onBack={handleBack} />

      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
        <p className="typography-label-1 text-primary-700">
          {step} / 2 {step === 1 ? '물품·지역' : '희망상태·참고정보'}
        </p>
        <h2 className="mt-3 typography-heading-3 text-neutral-900">
          {step === 1
            ? '필요한 물품을 알려주세요'
            : '희망 상태와 참고 정보를 알려주세요'}
        </h2>

        {step === 1 ? (
          <div className="mt-5 space-y-4">
            <div className="flex w-full flex-col gap-2">
              <span className="text-xs font-bold leading-[18px] text-neutral-900">
                카테고리
              </span>
              <button
                type="button"
                onClick={openCategoryPanel}
                style={{ height: 54 }}
                className="w-full rounded-input border border-neutral-500 bg-white px-4 text-left typography-body-2 text-neutral-900 outline-none transition-colors hover:border-primary-700 focus-visible:border-primary-700 focus-visible:outline-none"
              >
                {category}
              </button>
            </div>
            <Input
              label="품목"
              value={itemName}
              onChange={(event) => setItemName(event.target.value)}
              labelClassName="text-xs font-bold leading-[18px]"
              className="typography-body-2"
            />
            <Input
              label="필요 수량"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              labelClassName="text-xs font-bold leading-[18px]"
              className="typography-body-2"
              inputMode="numeric"
            />
            <div className="flex w-full flex-col gap-2">
              <span className="text-xs font-bold leading-[18px] text-neutral-900">
                수령 지역
              </span>
              <button
                type="button"
                onClick={() => {
                  setRegionQuery('')
                  setRegionPanelOpen(true)
                }}
                style={{ height: 54 }}
                className="w-full rounded-input border border-neutral-500 bg-white px-4 text-left typography-body-2 text-neutral-900 outline-none transition-colors hover:border-primary-700 focus-visible:border-primary-700 focus-visible:outline-none"
              >
                {region}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <fieldset>
              <legend className="text-xs font-bold leading-[18px] text-neutral-900">
                희망 상태
              </legend>
              <div className="mt-2 space-y-2">
                {conditionOptions.map((option) => {
                  const selected = option === condition
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setCondition(option)}
                      style={{ minHeight: 52 }}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-control border px-4 text-left typography-body-2 transition-colors',
                        selected
                          ? 'border-primary-300 bg-primary-100 font-semibold text-primary-700'
                          : 'border-neutral-200 bg-white text-neutral-900',
                      )}
                    >
                      {selected ? (
                        <CheckCircle2 aria-hidden size={20} strokeWidth={2} />
                      ) : null}
                      {option}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <div className="mt-4">
              <Textarea
                label="필요한 이유 (선택)"
                value={reason}
                placeholder="필요한 이유를 입력해 주세요."
                labelClassName="text-xs font-bold leading-[18px]"
                onChange={(event) => setReason(event.target.value)}
                className="min-h-[112px] resize-none"
              />
            </div>

            <div className="mt-4">
              <PhotoInput
                label="참고 사진"
                optional
                photos={photos}
                onChange={setPhotos}
                onBusyChange={setPhotoBusy}
              />
            </div>
          </div>
        )}
      </main>

      <footer className="shrink-0 bg-surface-canvas px-5 pb-4 pt-2">
        <Button type="submit" className="h-[46px] w-full" disabled={photoBusy}>
          {step === 1 ? '다음' : '등록하기'}
        </Button>
      </footer>

      <Dialog
        open={completeOpen}
        title="필요 물품이 등록됐어요!"
        description="가까운 기부자가 확인할 수 있도록 공개됐어요."
        confirmText="추천 기부자 보기"
        cancelText="홈으로 가기"
        onConfirm={() =>
          navigate(routePath.organizationRecommendation('stationery-30'))
        }
        onCancel={() => navigate(ROUTES.organization.home)}
      />
    </form>
  )
}

type PageHeaderProps = {
  title: string
  onBack: () => void
}

function PageHeader({ title, onBack }: PageHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 px-5">
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={onBack}
        className="flex size-6 shrink-0 items-center justify-center text-primary-700"
      >
        <ChevronLeft aria-hidden size={24} strokeWidth={2} />
      </button>
      <h1 className="typography-title-3 text-neutral-900">{title}</h1>
    </header>
  )
}
