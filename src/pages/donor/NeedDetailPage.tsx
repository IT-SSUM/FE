import { BookOpen, ChevronLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button/Button'
import { routePath } from '@/routes/paths'

const needDetailMap = {
  'water-20': {
    title: '생수 20개가 필요해요',
    organization: '기관 A',
    verifiedText: '사업자 확인 완료',
    itemName: '생수',
    quantity: '20개',
    condition: '상',
    location: '서울 구로구 ○○로 12',
    description:
      '초등학생 아이들이 함께 읽을 책이 필요해요. 깨끗한 동화책과 학습 도서를 기다리고 있어요. 초등학생 아이들이 함께 읽을 책이 필요해요. 깨끗한 동화책과 학습 도서를 기다리고 있어요.',
    organizationIntro:
      '아이들의 일상과 성장을 함께하는 지역 돌봄 기관이에요. 아이들의 일상과 성장을 함께하는 지역 돌봄 기관이에요.',
  },
  'clothes-10': {
    title: '의류 10벌이 필요해요',
    organization: '기관 B',
    verifiedText: '사업자 확인 완료',
    itemName: '여름 의류',
    quantity: '10벌',
    condition: '중 이상',
    location: '서울 관악구 ○○로 8',
    description:
      '계절에 맞는 깨끗한 의류가 필요한 아이들에게 전달할 예정이에요. 바로 입을 수 있는 상태의 의류를 기다리고 있어요.',
    organizationIntro:
      '지역 청소년의 생활 지원과 돌봄을 함께하는 복지 기관이에요.',
  },
  'books-10': {
    title: '도서 10권이 필요해요',
    organization: '기관 C',
    verifiedText: '사업자 확인 완료',
    itemName: '도서',
    quantity: '10권',
    condition: '중 이상',
    location: '서울 영등포구 ○○로 21',
    description:
      '아이들이 자유롭게 읽을 수 있는 동화책과 학습 도서가 필요해요. 깨끗하게 보관된 책이면 좋아요.',
    organizationIntro:
      '아이들의 독서 습관과 방과 후 활동을 지원하는 지역 기관이에요.',
  },
} as const

export function NeedDetailPage() {
  const navigate = useNavigate()
  const { needId } = useParams()
  const need =
    needDetailMap[needId as keyof typeof needDetailMap] ??
    needDetailMap['water-20']

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <header className="flex h-14 items-center gap-2 bg-surface-canvas px-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="flex size-6 shrink-0 items-center justify-center text-primary-700"
        >
          <ChevronLeft aria-hidden size={24} strokeWidth={2} />
        </button>
        <h1 className="typography-title-3 text-neutral-900">
          필요 물품 상세
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
        <h2 className="typography-heading-2 text-neutral-900">{need.title}</h2>
        <p className="mt-3 typography-body-2 text-neutral-700">
          {need.organization} · {need.verifiedText}
        </p>

        <div className="mt-4 flex h-[216px] items-center justify-center rounded-card bg-error-bg text-primary-700">
          <BookOpen aria-hidden size={88} strokeWidth={2} />
        </div>

        <section className="mt-4 rounded-card border border-neutral-200 bg-white p-4">
          <dl className="space-y-2 typography-body-2">
            <NeedInfoRow label="필요 품목" value={need.itemName} />
            <NeedInfoRow label="필요 수량" value={need.quantity} />
            <NeedInfoRow label="희망 상태" value={need.condition} />
            <NeedInfoRow label="기관 위치" value={need.location} />
          </dl>
        </section>

        <p className="mt-4 typography-body-1 text-neutral-900">
          {need.description}
        </p>

        <section className="mt-4">
          <h3 className="typography-title-2 text-neutral-900">기관 소개</h3>
          <p className="mt-4 typography-body-1 text-neutral-900">
            {need.organizationIntro}
          </p>
        </section>
      </main>

      <footer className="shrink-0 border border-neutral-200 bg-surface-canvas px-5 py-4">
        <Button
          className="w-full"
          onClick={() => navigate(routePath.chatRoom('mock-need-chat'))}
        >
          기부 제안 · 채팅 시작
        </Button>
      </footer>
    </div>
  )
}

type NeedInfoRowProps = {
  label: string
  value: string
}

function NeedInfoRow({ label, value }: NeedInfoRowProps) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-2">
      <dt className="text-neutral-700">{label}</dt>
      <dd className="text-neutral-900">{value}</dd>
    </div>
  )
}
