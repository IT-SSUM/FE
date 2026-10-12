import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button/Button'
import { Input } from '@/components/common/Input/Input'

export function DonorProfileEditPage() {
  const navigate = useNavigate()

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
        <h1 className="typography-title-3 text-neutral-900">회원정보 수정</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-8 pt-2">
        <section className="rounded-card border border-neutral-200 bg-white p-4">
          <h2 className="typography-title-2 text-neutral-900">기본 정보</h2>
          <div className="mt-4 space-y-4">
            <Input label="이름" defaultValue="최윤서" />
            <Input label="생년월일" defaultValue="2002.04.12" />
            <Input label="이메일" defaultValue="yoonseo@example.com" />
            <Input label="전화번호" defaultValue="010-1234-5678" />
            <Input label="주소" defaultValue="서울 구로구" />
          </div>
        </section>
      </main>

      <footer className="shrink-0 border-t border-neutral-200 bg-surface-canvas px-5 py-4">
        <Button className="w-full" onClick={() => navigate(-1)}>
          저장하기
        </Button>
      </footer>
    </div>
  )
}
