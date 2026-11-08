import { useState, type FormEvent } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getOrganizationErrorMessage } from '@/apis/organization'
import { AddressSearchField } from '@/components/common/AddressSearchField/AddressSearchField'
import { Button } from '@/components/common/Button/Button'
import { Input } from '@/components/common/Input/Input'
import {
  useOrganizationProfile,
  useUpdateOrganizationProfile,
} from '@/hooks/organization/useOrganizationProfile'
import { ROUTES } from '@/routes/paths'

type ProfileDraft = {
  name: string
  representativeName: string
  address: string
  addressDetail: string
  phone: string
}

const emptyDraft: ProfileDraft = {
  name: '',
  representativeName: '',
  address: '',
  addressDetail: '',
  phone: '',
}

export function OrganizationProfileEditPage() {
  const navigate = useNavigate()
  const profileQuery = useOrganizationProfile()
  const updateProfile = useUpdateOrganizationProfile()
  const [changes, setChanges] = useState<Partial<ProfileDraft>>({})
  const initialDraft = profileQuery.data
    ? {
      name: profileQuery.data.name,
      representativeName: profileQuery.data.representativeName,
      address: profileQuery.data.address,
      addressDetail: profileQuery.data.addressDetail ?? '',
      phone: profileQuery.data.phone,
    }
    : emptyDraft
  const draft = { ...initialDraft, ...changes }

  const updateDraft = (field: keyof ProfileDraft, value: string) => {
    setChanges((current) => ({ ...current, [field]: value }))
    updateProfile.reset()
  }
  const phoneValid = /^(0\d{1,2}-?\d{3,4}-?\d{4}|1\d{3}-?\d{4})$/.test(draft.phone)
  const canSubmit = Boolean(draft.name.trim() && draft.address.trim() && phoneValid)
  const saveError = updateProfile.error
    ? getOrganizationErrorMessage(updateProfile.error, '기관 정보를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.')
    : ''

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit || updateProfile.isPending) return

    try {
      await updateProfile.mutateAsync({
        name: draft.name.trim(),
        phone: draft.phone.trim(),
        address: draft.address.trim(),
        addressDetail: draft.addressDetail.trim(),
      })
      navigate(ROUTES.organization.myPage, { replace: true })
    } catch {
      // mutation 상태의 오류 메시지를 폼 하단에 표시합니다.
    }
  }

  return (
    <form className="flex min-h-dvh flex-col bg-surface-canvas" onSubmit={handleSubmit}>
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
        {profileQuery.isLoading ? (
          <p className="py-12 text-center typography-body-2 text-neutral-700" role="status">기관 정보를 불러오는 중이에요.</p>
        ) : profileQuery.isError ? (
          <div className="py-12 text-center" role="alert">
            <p className="typography-body-2 text-error">기관 정보를 불러오지 못했어요.</p>
            <Button variant="secondary" className="mt-4 h-10" onClick={() => void profileQuery.refetch()}>다시 시도</Button>
          </div>
        ) : (
          <div>
            <Input
              label="기관명"
              required
              value={draft.name}
              maxLength={100}
              onChange={(event) => updateDraft('name', event.target.value)}
              labelClassName="text-xs font-bold leading-[18px]"
              className="typography-body-2"
            />
            <div className="mt-6">
              <Input
                label="대표자명"
                value={draft.representativeName}
                disabled
                labelClassName="text-xs font-bold leading-[18px]"
                className="typography-body-2"
              />
              <p className="mt-2 typography-label-2 text-neutral-600">대표자명은 변경할 수 없어요.</p>
            </div>
            <div className="mt-6">
              <AddressSearchField
                id="organization-address"
                label="기관 주소"
                address={draft.address}
                detailAddress={draft.addressDetail}
                onAddressChange={(value) => updateDraft('address', value)}
                onDetailAddressChange={(value) => updateDraft('addressDetail', value)}
                labelClassName="text-xs font-bold leading-[18px]"
              />
            </div>
            <div className="mt-6">
              <Input
                label="연락처"
                type="tel"
                required
                value={draft.phone}
                error={draft.phone && !phoneValid ? '지역번호를 포함한 기관 연락처를 입력해 주세요.' : undefined}
                onChange={(event) => updateDraft('phone', event.target.value)}
                labelClassName="text-xs font-bold leading-[18px]"
                className="typography-body-2"
              />
            </div>
          </div>
        )}
      </main>

      <footer className="shrink-0 px-5 pb-4 pt-2">
        {saveError ? <p className="mb-3 text-center typography-label-2 text-error" role="alert">{saveError}</p> : null}
        <Button
          type="submit"
          className="h-[46px] w-full"
          disabled={!profileQuery.data || !canSubmit || updateProfile.isPending}
        >
          {updateProfile.isPending ? '저장 중...' : '저장'}
        </Button>
      </footer>
    </form>
  )
}
