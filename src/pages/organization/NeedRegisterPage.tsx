import { useState } from 'react'
import { BookOpen, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { Button } from '@/components/common/Button/Button'
import { DateField } from '@/components/common/DateField/DateField'
import { Dialog } from '@/components/common/Dialog/Dialog'
import { Input } from '@/components/common/Input/Input'
import { RegionSelect } from '@/components/common/RegionSelect/RegionSelect'
import { Textarea } from '@/components/common/Textarea/Textarea'
import { ROUTES, routePath } from '@/routes/paths'
import { cn } from '@/utils/cn'

const conditionOptions = ['상 · 미개봉', '중 · 사용감 적음', '하 · 다회 사용'] as const

export function NeedRegisterPage() {
  const navigate = useNavigate()
  const [condition, setCondition] =
    useState<(typeof conditionOptions)[number]>('중 · 사용감 적음')
  const [region, setRegion] = useState('서울특별시 구로구')
  const [deadline, setDeadline] = useState('2026-10-18')
  const [completeOpen, setCompleteOpen] = useState(false)

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 items-center gap-2 bg-surface-canvas px-5">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(ROUTES.organization.home)}
          className="flex size-6 shrink-0 items-center justify-center text-primary-700"
        >
          <ChevronLeft aria-hidden size={24} strokeWidth={2} />
        </button>
        <h1 className="typography-title-3 text-neutral-900">필요 물품 등록</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-8 pt-2">
        <section>
          <p className="typography-label-1 text-primary-700">기관 필요 물품</p>
          <h2 className="mt-2 typography-heading-2 text-neutral-900">
            필요한 물품을 알려주세요
          </h2>
        </section>

        <div className="mt-5 space-y-4">
          <Input label="카테고리" required defaultValue="도서·문구" />
          <Input label="필요 품목" required defaultValue="학용품 30세트" />
          <Input label="필요 수량" required defaultValue="30" inputMode="numeric" />
          <RegionSelect
            id="organization-need-region"
            label="기관 위치"
            value={region}
            onChange={setRegion}
          />
          <DateField
            id="organization-need-deadline"
            label="희망 수령일"
            value={deadline}
            onChange={setDeadline}
          />
        </div>

        <fieldset className="mt-5 flex flex-col gap-2">
          <legend className="typography-label-1 text-neutral-900">
            희망 상태 <span aria-hidden>*</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {conditionOptions.map((option) => {
              const selected = option === condition

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCondition(option)}
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

        <div className="mt-5">
          <Textarea
            label="필요 사유"
            defaultValue="이번 주 아동 학습 활동에 사용할 학용품 세트가 필요해요."
            className="min-h-[120px] resize-none typography-body-1"
          />
        </div>

        <section className="mt-5 rounded-card bg-primary-100 p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-input bg-white text-primary-700">
              <BookOpen aria-hidden size={22} strokeWidth={2} />
            </span>
            <p className="typography-body-2 text-neutral-700">
              등록한 필요 물품은 기부자 탐색과 AI 추천 대상에 공개돼요.
            </p>
          </div>
        </section>
      </main>

      <footer className="shrink-0 border-t border-neutral-200 bg-surface-canvas px-5 py-4">
        <Button className="w-full" onClick={() => setCompleteOpen(true)}>
          등록하기
        </Button>
      </footer>

      <BottomNavigation
        audience="organization"
        activeItem="register"
        className="shrink-0"
      />

      <Dialog
        open={completeOpen}
        title="필요 물품이 등록됐어요!"
        description="가까운 기부자가 확인할 수 있도록 공개됐어요."
        confirmText="추천 기부자 보기"
        cancelText="홈으로 가기"
        onConfirm={() => navigate(routePath.organizationRecommendation('stationery-30'))}
        onCancel={() => navigate(ROUTES.organization.home)}
      />
    </div>
  )
}
