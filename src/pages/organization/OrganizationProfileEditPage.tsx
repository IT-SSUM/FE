import { useState, type FormEvent } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AddressSearchField } from '@/components/common/AddressSearchField/AddressSearchField'
import { Button } from '@/components/common/Button/Button'
import { Input } from '@/components/common/Input/Input'
import { ROUTES } from '@/routes/paths'

export function OrganizationProfileEditPage() {
  const navigate = useNavigate()
  const [organizationName, setOrganizationName] = useState('기관 A')
  const [representativeName, setRepresentativeName] = useState('김수현')
  const [address, setAddress] = useState('경기도 부천시 가마안로 12')
  const [detailAddress, setDetailAddress] = useState('2층')
  const [phone, setPhone] = useState('02-1234-5678')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate(ROUTES.organization.myPage, { replace: true })
  }

  return (
    <form
      className="flex min-h-dvh flex-col bg-surface-canvas"
      onSubmit={handleSubmit}
    >
      <header className="flex h-14 shrink-0 items-center gap-2 px-5">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-6 items-center justify-center text-primary-700"
        >
          <ChevronLeft aria-hidden size={24} strokeWidth={2} />
        </button>
        <h1 className="typography-title-3 text-neutral-900">기관 정보 수정</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-5">
        <div>
          <Input
            label="기관명"
            value={organizationName}
            onChange={(event) => setOrganizationName(event.target.value)}
            labelClassName="text-xs font-bold leading-[18px]"
            className="typography-body-2"
          />
          <div className="mt-6">
            <Input
              label="대표자명"
              value={representativeName}
              onChange={(event) => setRepresentativeName(event.target.value)}
              labelClassName="text-xs font-bold leading-[18px]"
              className="typography-body-2"
            />
          </div>
          <div className="mt-6">
            <AddressSearchField
              id="organization-address"
              label="기관 주소"
              address={address}
              detailAddress={detailAddress}
              onAddressChange={setAddress}
              onDetailAddressChange={setDetailAddress}
              labelClassName="text-xs font-bold leading-[18px]"
            />
          </div>
          <div className="mt-6">
            <Input
              label="연락처"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              labelClassName="text-xs font-bold leading-[18px]"
              className="typography-body-2"
            />
          </div>
        </div>
      </main>

      <footer className="shrink-0 px-5 pb-4 pt-2">
        <Button type="submit" className="h-[46px] w-full">
          저장
        </Button>
      </footer>
    </form>
  )
}
