import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Search, X } from 'lucide-react'

type PostcodeResult = {
  zonecode: string
  roadAddress: string
  jibunAddress: string
  buildingName: string
}

type DaumPostcode = {
  embed: (container: HTMLElement) => void
}

type DaumPostcodeConstructor = new (options: {
  oncomplete: (data: PostcodeResult) => void
}) => DaumPostcode

declare global {
  interface Window {
    daum?: {
      Postcode: DaumPostcodeConstructor
    }
  }
}

const POSTCODE_SCRIPT_ID = 'daum-postcode-script'
const POSTCODE_SCRIPT_URL = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'

function loadPostcodeScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.daum?.Postcode) {
      resolve()
      return
    }

    const existingScript = document.getElementById(POSTCODE_SCRIPT_ID) as HTMLScriptElement | null
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('주소 검색을 불러오지 못했어요.')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = POSTCODE_SCRIPT_ID
    script.src = POSTCODE_SCRIPT_URL
    script.async = true
    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener('error', () => reject(new Error('주소 검색을 불러오지 못했어요.')), { once: true })
    document.head.appendChild(script)
  })
}

type AddressSearchFieldProps = {
  id: string
  label: string
  address: string
  detailAddress: string
  onAddressChange: (value: string) => void
  onDetailAddressChange: (value: string) => void
}

export function AddressSearchField({
  id,
  label,
  address,
  detailAddress,
  onAddressChange,
  onDetailAddressChange,
}: AddressSearchFieldProps) {
  const [ready, setReady] = useState(Boolean(window.daum?.Postcode))
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const detailInputRef = useRef<HTMLInputElement>(null)
  const postcodeContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true
    loadPostcodeScript()
      .then(() => {
        if (active) setReady(true)
      })
      .catch(() => {
        if (active) setError('주소 검색을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!open || !ready || !window.daum?.Postcode || !postcodeContainerRef.current) return

    const container = postcodeContainerRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    container.replaceChildren()

    new window.daum.Postcode({
      oncomplete: (data) => {
        const baseAddress = data.roadAddress || data.jibunAddress
        const building = data.buildingName ? ` (${data.buildingName})` : ''
        onAddressChange(`[${data.zonecode}] ${baseAddress}${building}`)
        setOpen(false)
        window.setTimeout(() => detailInputRef.current?.focus(), 0)
      },
    }).embed(container)

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
      container.replaceChildren()
    }
  }, [onAddressChange, open, ready])

  const openAddressSearch = () => {
    if (!ready || !window.daum?.Postcode) return
    setOpen(true)
  }

  return (
    <div className="address-field">
      <label htmlFor={`${id}-base`} className="auth-field-label">{label}</label>
      <div className="address-search-row">
        <input
          id={`${id}-base`}
          className="auth-input"
          value={address}
          placeholder="주소 검색을 눌러 주세요"
          readOnly
          onClick={openAddressSearch}
        />
        <button
          type="button"
          className="address-search-button"
          onClick={openAddressSearch}
          disabled={!ready}
        >
          <Search aria-hidden size={17} />
          <span>{ready ? '주소 검색' : '준비 중'}</span>
        </button>
      </div>
      <input
        ref={detailInputRef}
        id={`${id}-detail`}
        className="auth-input mt-2"
        value={detailAddress}
        placeholder="상세주소를 입력해 주세요"
        onChange={(event) => onDetailAddressChange(event.target.value)}
      />
      {error ? <p className="signup-error">{error}</p> : null}
      {open ? createPortal(
        <div
          className="address-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false)
          }}
        >
          <section
            className="address-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-address-modal-title`}
          >
            <header className="address-modal-header">
              <div>
                <h2 id={`${id}-address-modal-title`}>주소 찾기</h2>
                <p>도로명, 건물명 또는 지번을 검색해 주세요.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="주소 검색 닫기">
                <X aria-hidden size={20} />
              </button>
            </header>
            <div ref={postcodeContainerRef} className="postcode-container" />
          </section>
        </div>,
        document.body,
      ) : null}
    </div>
  )
}
