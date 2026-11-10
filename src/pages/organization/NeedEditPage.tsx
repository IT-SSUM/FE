import { useState, type FormEvent, type ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { getNeededItemErrorMessage } from '@/apis/neededItem'
import { Button } from '@/components/common/Button/Button'
import { Input } from '@/components/common/Input/Input'
import { Textarea } from '@/components/common/Textarea/Textarea'
import { PhotoInput } from '@/features/donor/PhotoInput'
import { useUpdateNeededItemMutation } from '@/hooks/mutations/useUpdateNeededItemMutation'
import { useNeededItemQuery } from '@/hooks/queries/useNeededItemQuery'
import { routePath } from '@/routes/paths'
import type { NeededItemDetail } from '@/types/neededItem'

export function NeedEditPage() {
  const navigate = useNavigate()
  const { needId } = useParams()
  const id = needId && /^[1-9]\d*$/.test(needId) ? Number(needId) : null
  const query = useNeededItemQuery(id)

  if (id === null) {
    return <EditPageFrame onBack={() => navigate(-1)}><p role="alert" className="py-12 text-center typography-body-2 text-error">올바른 필요 물품 번호가 필요해요.</p></EditPageFrame>
  }
  if (query.isPending) {
    return <EditPageFrame onBack={() => navigate(-1)}><p role="status" className="py-12 text-center typography-body-2 text-neutral-700">필요 물품을 불러오는 중이에요.</p></EditPageFrame>
  }
  if (query.isError || !query.data) {
    return (
      <EditPageFrame onBack={() => navigate(-1)}>
        <div role="alert" className="py-12 text-center">
          <p className="typography-body-2 text-error">{getNeededItemErrorMessage(query.error, '필요 물품을 불러오지 못했어요.')}</p>
          <Button variant="secondary" className="mt-4 h-10" onClick={() => void query.refetch()}>다시 시도</Button>
        </div>
      </EditPageFrame>
    )
  }
  if (!query.data.mine) {
    return <EditPageFrame onBack={() => navigate(-1)}><p role="alert" className="py-12 text-center typography-body-2 text-error">내 기관이 등록한 필요 물품만 수정할 수 있어요.</p></EditPageFrame>
  }
  return <NeedEditForm key={query.data.neededItemId} need={query.data} />
}

function NeedEditForm({ need }: { need: NeededItemDetail }) {
  const navigate = useNavigate()
  const mutation = useUpdateNeededItemMutation()
  const [description, setDescription] = useState(need.description ?? '')
  const [address, setAddress] = useState(need.receiveAddress ?? '')
  const [photos, setPhotos] = useState<string[]>(need.referenceImageUrl ? [need.referenceImageUrl] : [])
  const [photoBusy, setPhotoBusy] = useState(false)
  const [failure, setFailure] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (photoBusy || mutation.isPending) return
    if (description.length > 1000 || address.length > 255) {
      setFailure('설명은 1,000자, 수령 장소는 255자 이하로 입력해 주세요.')
      return
    }
    setFailure('')
    try {
      await mutation.mutateAsync({
        neededItemId: need.neededItemId,
        description: description.trim(),
        receiveAddress: address.trim(),
        image: photos[0],
        originalImageUrl: need.referenceImageUrl,
        originalImageKey: need.referenceImageKey,
      })
      navigate(routePath.organizationNeedDetail(String(need.neededItemId)), { replace: true })
    } catch (error) {
      setFailure(getNeededItemErrorMessage(error, '필요 물품을 수정하지 못했어요. 다시 시도해 주세요.'))
    }
  }

  return (
    <form className="flex min-h-dvh flex-col bg-surface-canvas" onSubmit={(event) => void handleSubmit(event)}>
      <PageHeader onBack={() => navigate(-1)} />
      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-3">
        <section className="mb-4 rounded-control bg-neutral-100 px-4 py-3">
          <p className="typography-title-3 text-neutral-900">{need.itemName} {need.requiredQuantity}{need.unit}</p>
          <p className="mt-1 typography-label-2 text-neutral-700">카테고리·품목·수량·단위·희망 상태는 수정할 수 없어요.</p>
        </section>
        <Textarea
          label="필요한 이유 (선택)"
          value={description}
          maxLength={1000}
          onChange={(event) => { setDescription(event.target.value); setFailure('') }}
          labelClassName="text-xs font-bold leading-[18px]"
          className="min-h-[112px] resize-none"
        />
        <div className="mt-4">
          <Input
            label="수령 장소"
            value={address}
            maxLength={255}
            onChange={(event) => { setAddress(event.target.value); setFailure('') }}
            labelClassName="text-xs font-bold leading-[18px]"
            className="typography-body-2"
          />
        </div>
        <div className="mt-4">
          <PhotoInput
            label="참고 사진"
            optional
            maxPhotos={1}
            photos={photos}
            onChange={(next) => { setPhotos(next); setFailure('') }}
            onBusyChange={setPhotoBusy}
          />
        </div>
        {failure ? <p role="alert" className="mt-4 typography-body-2 text-error">{failure}</p> : null}
      </main>
      <footer className="shrink-0 px-5 pb-4 pt-2">
        <Button type="submit" className="h-[46px] w-full" disabled={photoBusy || mutation.isPending}>
          {mutation.isPending ? '수정 중...' : '수정 완료'}
        </Button>
      </footer>
    </form>
  )
}

function EditPageFrame({ onBack, children }: { onBack: () => void; children: ReactNode }) {
  return <div className="flex min-h-dvh flex-col bg-surface-canvas"><PageHeader onBack={onBack} /><main className="flex-1 px-5">{children}</main></div>
}

function PageHeader({ onBack }: { onBack: () => void }) {
  return <header className="flex h-14 shrink-0 items-center gap-2 px-5"><button type="button" aria-label="뒤로가기" onClick={onBack} className="flex size-6 items-center justify-center text-primary-700"><ChevronLeft aria-hidden size={24} strokeWidth={2} /></button><h1 className="typography-title-3 text-neutral-900">필요 물품 수정</h1></header>
}
