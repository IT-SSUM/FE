import { useState } from 'react'
import { ChevronLeft, ImagePlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button/Button'
import { DateField } from '@/components/common/DateField/DateField'
import { Input } from '@/components/common/Input/Input'
import { RegionSelect } from '@/components/common/RegionSelect/RegionSelect'
import { Textarea } from '@/components/common/Textarea/Textarea'

export function DonorDonationEditPage() {
  const navigate = useNavigate()
  const [region, setRegion] = useState('서울특별시 구로구')
  const [availableDate, setAvailableDate] = useState('2026-10-18')

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 items-center gap-2 bg-surface-canvas px-5">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-6 shrink-0 items-center justify-center text-primary-700"
        >
          <ChevronLeft aria-hidden size={24} strokeWidth={2} />
        </button>
        <h1 className="typography-title-3 text-neutral-900">기부 물품 수정</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-8 pt-2">
        <div className="space-y-4">
          <Input label="물품명" defaultValue="수건 30장" required />
          <Input label="카테고리" defaultValue="생활용품" required />
          <Input label="수량" defaultValue="30" required />
          <Input label="상태" defaultValue="중" required />
          <RegionSelect
            id="donation-edit-region"
            label="수령 위치"
            value={region}
            onChange={setRegion}
          />
          <DateField
            id="donation-edit-date"
            label="수령 가능 기간"
            value={availableDate}
            onChange={setAvailableDate}
          />
          <Textarea
            label="상세 설명"
            defaultValue="세탁 완료한 수건 30장입니다. 기관 A와 10장 예약되어 있고 남은 20장은 추가 매칭이 가능해요."
          />
        </div>

        <section className="mt-5">
          <h2 className="typography-label-1 text-neutral-900">사진</h2>
          <button
            type="button"
            className="mt-2 flex h-[120px] w-full flex-col items-center justify-center gap-2 rounded-card border border-dashed border-neutral-500 bg-white text-primary-700"
          >
            <ImagePlus aria-hidden size={28} strokeWidth={2} />
            <span className="typography-label-1">사진 다시 선택</span>
          </button>
        </section>
      </main>

      <footer className="shrink-0 border-t border-neutral-200 bg-surface-canvas px-5 py-4">
        <Button className="w-full" onClick={() => navigate(-1)}>
          수정 완료
        </Button>
      </footer>
    </div>
  )
}
