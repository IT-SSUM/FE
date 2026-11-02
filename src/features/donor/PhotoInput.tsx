import { useRef, useState } from 'react'

export function PhotoInput({ photos, onChange, error, onBusyChange }: { photos: string[]; onChange: (photos: string[]) => void; error?: string; onBusyChange: (busy: boolean) => void }) {
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const reading = useRef(false)
  async function readFiles(files: File[]) {
    if (reading.current || !files.length) return
    setMessage('')
    if (files.length + photos.length > 3) { setMessage('사진은 최대 3장까지 추가할 수 있어요.'); return }
    if (files.some((file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 1024 * 1024)) {
      setMessage('JPG, PNG, WebP 형식의 1MB 이하 사진만 추가해 주세요.'); return
    }
    reading.current = true
    setBusy(true)
    onBusyChange(true)
    try {
      const urls = await Promise.all(files.map((file) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = () => reject(new Error('사진을 읽을 수 없어요.'))
        reader.onload = () => {
          const url = String(reader.result)
          const image = new Image()
          image.onload = () => resolve(url)
          image.onerror = () => reject(new Error('올바른 이미지 파일을 선택해 주세요.'))
          image.src = url
        }
        reader.readAsDataURL(file)
      })))
      onChange([...photos, ...urls])
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : '사진 추가에 실패했어요.') }
    finally { reading.current = false; setBusy(false); onBusyChange(false) }
  }
  return <fieldset className="space-y-2" disabled={busy}>
    <legend className="typography-label-1">사진 (1~3장)</legend>
    <p className="typography-label-2 text-neutral-700">JPG·PNG·WebP, 장당 최대 1MB</p>
    <input aria-label="물품 사진 추가" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy || photos.length >= 3}
      onChange={(event) => { const files = Array.from(event.target.files ?? []); event.target.value = ''; void readFiles(files) }} className="w-full text-sm" />
    <div className="grid grid-cols-3 gap-2">
      {photos.map((photo, index) => <div key={`${index}-${photo.slice(-20)}`}>
        <img src={photo} alt={`물품 사진 ${index + 1}`} className="aspect-square w-full rounded-input object-cover" />
        <button type="button" onClick={() => onChange(photos.filter((_, i) => i !== index))} aria-label={`물품 사진 ${index + 1} 삭제`} className="w-full py-2 text-error">삭제</button>
      </div>)}
    </div>
    {busy ? <p role="status">사진을 확인하고 있어요.</p> : null}
    {message || error ? <p role="alert" className="typography-label-2 text-error">{message || error}</p> : null}
  </fieldset>
}
