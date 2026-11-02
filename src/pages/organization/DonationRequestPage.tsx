import { useState, type FormEvent } from 'react'
import { CheckCircle2, ChevronLeft } from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import excitedMascot from '@/assets/images/mascot/excited.svg'
import { Button } from '@/components/common/Button/Button'
import { Input } from '@/components/common/Input/Input'
import { ROUTES, routePath } from '@/routes/paths'

const requestDonationMap = {
  'water-20': {
    donor: '기부자 A',
    itemName: '생수',
    availableQuantity: 20,
    unit: '개',
    condition: '상',
    location: '경기도 부천시',
    conditionDescription: '처음 상태와 유사',
  },
  'books-10': {
    donor: '기부자 B',
    itemName: '도서',
    availableQuantity: 10,
    unit: '권',
    condition: '중',
    location: '경기도 부천시',
    conditionDescription: '사용감이 적어요',
  },
  'clothes-5': {
    donor: '기부자 C',
    itemName: '의류',
    availableQuantity: 5,
    unit: '벌',
    condition: '하',
    location: '경기도 부천시',
    conditionDescription: '사용감이 있어요',
  },
} as const

function getDonation(donationId?: string) {
  return (
    requestDonationMap[donationId as keyof typeof requestDonationMap] ??
    requestDonationMap['water-20']
  )
}

export function DonationRequestPage() {
  const navigate = useNavigate()
  const { donationId } = useParams()
  const donation = getDonation(donationId)
  const initialQuantity = Math.min(10, donation.availableQuantity)
  const [quantity, setQuantity] = useState(`${initialQuantity}${donation.unit}`)
  const [message, setMessage] = useState('금요일 오후에 수령할 수 있어요.')
  const [quantityError, setQuantityError] = useState('')

  const handleQuantityChange = (value: string) => {
    const digits = value.replace(/\D/g, '')
    setQuantity(digits ? `${Number(digits)}${donation.unit}` : '')
    setQuantityError('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const requestedQuantity = Number.parseInt(quantity, 10)

    if (!requestedQuantity || requestedQuantity < 1) {
      setQuantityError('요청 수량을 입력해 주세요.')
      return
    }
    if (requestedQuantity > donation.availableQuantity) {
      setQuantityError(
        `최대 ${donation.availableQuantity}${donation.unit}까지 요청할 수 있어요.`,
      )
      return
    }

    navigate(
      `${routePath.organizationDonationRequestComplete(donationId ?? 'water-20')}?quantity=${requestedQuantity}`,
    )
  }

  return (
    <form
      className="flex min-h-dvh flex-col bg-surface-canvas"
      onSubmit={handleSubmit}
    >
      <PageHeader title="기부 요청" onBack={() => navigate(-1)} />

      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
        <p className="typography-body-2 text-neutral-700">
          {donation.donor}
        </p>

        <div
          role="img"
          aria-label={`${donation.itemName} 사진 영역`}
          className="mt-4 h-40 rounded-card bg-error-bg"
        />

        <section className="mt-3 rounded-control bg-primary-100 p-4">
          <h2 className="text-sm font-bold leading-5 text-primary-700">
            {donation.itemName} · 신청 가능 수량 {donation.availableQuantity}
            {donation.unit}
          </h2>
          <p className="mt-2 typography-label-2 text-neutral-700">
            물품 상태 {donation.condition} · {donation.location}
          </p>
        </section>

        <div className="mt-4 space-y-4">
          <Input
            label="지원받을 물품"
            value={`${donation.itemName} · 신청 가능 수량 ${donation.availableQuantity}${donation.unit}`}
            readOnly
            labelClassName="text-xs font-bold leading-[18px]"
            className="typography-body-2 text-neutral-700"
          />
          <Input
            label="요청 수량"
            value={quantity}
            inputMode="numeric"
            error={quantityError}
            labelClassName="text-xs font-bold leading-[18px]"
            className="typography-body-2 text-neutral-700"
            onChange={(event) => handleQuantityChange(event.target.value)}
          />
          <Input
            label="기부자에게 전할 메시지 (선택)"
            value={message}
            labelClassName="text-xs font-bold leading-[18px]"
            className="typography-body-2 text-neutral-700"
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>
      </main>

      <footer className="shrink-0 bg-surface-canvas px-5 pb-4 pt-2">
        <Button type="submit" className="h-[46px] w-full">
          요청 보내기
        </Button>
      </footer>
    </form>
  )
}

export function DonationRequestCompletePage() {
  const navigate = useNavigate()
  const { donationId } = useParams()
  const [searchParams] = useSearchParams()
  const donation = getDonation(donationId)
  const requestedQuantity = Math.min(
    Math.max(Number(searchParams.get('quantity')) || 1, 1),
    donation.availableQuantity,
  )

  return (
    <div className="flex min-h-dvh flex-col bg-surface-canvas">
      <PageHeader
        title="기부 요청 전송 완료"
        onBack={() => navigate(routePath.organizationDonationDetail(donationId ?? 'water-20'))}
      />

      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-5">
        <section className="text-center">
          <img
            src={excitedMascot}
            alt=""
            className="mx-auto size-20 object-contain"
          />
          <h2 className="mt-3 typography-title-2 text-neutral-900">
            요청을 보냈어요
          </h2>
          <p className="mt-2 typography-label-2 text-neutral-700">
            {donation.donor}가 {donation.itemName} {requestedQuantity}
            {donation.unit} 요청을 확인하고 있어요.
          </p>
        </section>

        <section className="mt-8 rounded-card border border-neutral-200 bg-white p-4">
          <h3 className="typography-title-3 text-neutral-900">
            {donation.itemName} {requestedQuantity}{donation.unit}
          </h3>
          <dl className="mt-3 space-y-2 typography-body-2">
            <InfoRow
              label="물품 상태"
              value={`${donation.condition} · ${donation.conditionDescription}`}
            />
            <InfoRow label="기부자" value={donation.donor} />
            <InfoRow label="물품 위치" value={donation.location} />
          </dl>
        </section>

        <section className="mt-3 rounded-control bg-primary-100 p-4">
          <div className="flex items-center gap-2 text-primary-700">
            <CheckCircle2 aria-hidden size={20} strokeWidth={2} />
            <h3 className="typography-title-3">응답 대기 · 신청 가능 수량 유지</h3>
          </div>
          <p className="mt-2 typography-label-2 leading-5 text-neutral-700">
            수락 후 거래중에는 수량을 확보하지 않아요.
            <br />
            기부자만 예약중으로 변경할 수 있어요.
          </p>
        </section>
      </main>

      <footer className="shrink-0 bg-surface-canvas px-5 pb-4 pt-2">
        <Button
          className="h-[46px] w-full"
          onClick={() => navigate(ROUTES.organization.myPage)}
        >
          보낸 요청 보기
        </Button>
      </footer>
    </div>
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

type InfoRowProps = {
  label: string
  value: string
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="grid grid-cols-[72px_1fr] gap-2">
      <dt className="text-neutral-700">{label}</dt>
      <dd className="font-medium text-neutral-900">{value}</dd>
    </div>
  )
}
