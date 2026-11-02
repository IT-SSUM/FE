import { useState, type FormEvent } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button/Button'
import { Input } from '@/components/common/Input/Input'
import { Textarea } from '@/components/common/Textarea/Textarea'
import { PhotoInput } from '@/features/donor/PhotoInput'
import { routePath } from '@/routes/paths'
import { organizationNeeds } from './organizationNeeds'

export function NeedEditPage() {
  const navigate = useNavigate()
  const { needId } = useParams()
  const need =
    organizationNeeds.find((item) => item.id === needId) ?? organizationNeeds[0]
  const [description, setDescription] = useState(
    '평일 오후에 물품을 수령할 수 있어요.',
  )
  const [address, setAddress] = useState('경기도 부천시 가마안로 12')
  const [photos, setPhotos] = useState<string[]>([])
  const [photoBusy, setPhotoBusy] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate(routePath.organizationNeedDetail(need.id), { replace: true })
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
        <h1 className="typography-title-3 text-neutral-900">필요 물품</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-6 pt-3">
        <Textarea
          label="설명 (선택)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          labelClassName="text-xs font-bold leading-[18px]"
          className="min-h-[112px] resize-none"
        />

        <div className="mt-4">
          <Input
            label="수령 장소"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            labelClassName="text-xs font-bold leading-[18px]"
            className="typography-body-2"
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
      </main>

      <footer className="shrink-0 px-5 pb-4 pt-2">
        <Button
          type="submit"
          className="h-[46px] w-full"
          disabled={photoBusy}
        >
          수정
        </Button>
      </footer>
    </form>
  )
}
