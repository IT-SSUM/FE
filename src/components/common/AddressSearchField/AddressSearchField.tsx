import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  createPortal,
} from 'react-dom'

import {
  Search,
  X,
} from 'lucide-react'

import {
  cn,
} from '@/utils/cn'

type PostcodeResult = {
  zonecode: string
  roadAddress: string
  jibunAddress: string
  buildingName: string
}

type DaumPostcode = {
  embed: (
    container: HTMLElement,
  ) => void
}

type DaumPostcodeConstructor =
  new (
    options: {
      oncomplete: (
        data: PostcodeResult,
      ) => void
    },
  ) => DaumPostcode

declare global {
  interface Window {
    daum?: {
      Postcode:
        DaumPostcodeConstructor
    }
  }
}

const POSTCODE_SCRIPT_ID =
  'daum-postcode-script'

const POSTCODE_SCRIPT_URL =
  'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'

function loadPostcodeScript() {
  return new Promise<void>(
    (
      resolve,
      reject,
    ) => {
      if (
        window.daum
          ?.Postcode
      ) {
        resolve()
        return
      }

      const existingScript =
        document.getElementById(
          POSTCODE_SCRIPT_ID,
        ) as
          | HTMLScriptElement
          | null

      if (
        existingScript
      ) {
        existingScript.addEventListener(
          'load',
          () =>
            resolve(),
          {
            once: true,
          },
        )

        existingScript.addEventListener(
          'error',
          () =>
            reject(
              new Error(
                '주소 검색을 불러오지 못했어요.',
              ),
            ),
          {
            once: true,
          },
        )

        return
      }

      const script =
        document.createElement(
          'script',
        )

      script.id =
        POSTCODE_SCRIPT_ID

      script.src =
        POSTCODE_SCRIPT_URL

      script.async = true

      script.addEventListener(
        'load',
        () =>
          resolve(),
        {
          once: true,
        },
      )

      script.addEventListener(
        'error',
        () =>
          reject(
            new Error(
              '주소 검색을 불러오지 못했어요.',
            ),
          ),
        {
          once: true,
        },
      )

      document.head.appendChild(
        script,
      )
    },
  )
}

type AddressSearchFieldProps = {
  id: string
  label: string

  address: string

  detailAddress: string

  onAddressChange: (
    value: string,
  ) => void

  onDetailAddressChange: (
    value: string,
  ) => void

  labelClassName?: string

  stacked?: boolean
}

export function AddressSearchField({
  id,
  label,
  address,
  detailAddress,
  onAddressChange,
  onDetailAddressChange,
  labelClassName,
  stacked = false,
}: AddressSearchFieldProps) {
  const [
    ready,
    setReady,
  ] =
    useState(
      Boolean(
        window.daum
          ?.Postcode,
      ),
    )

  const [
    error,
    setError,
  ] =
    useState('')

  const [
    open,
    setOpen,
  ] =
    useState(false)

  const detailInputRef =
    useRef<HTMLInputElement>(
      null,
    )

  const postcodeContainerRef =
    useRef<HTMLDivElement>(
      null,
    )

  useEffect(() => {
    let active =
      true

    loadPostcodeScript()
      .then(() => {
        if (active) {
          setReady(
            true,
          )
        }
      })
      .catch(() => {
        if (active) {
          setError(
            '주소 검색을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
          )
        }
      })

    return () => {
      active =
        false
    }
  }, [])

  useEffect(() => {
    if (
      !open ||
      !ready ||
      !window.daum
        ?.Postcode ||
      !postcodeContainerRef.current
    ) {
      return
    }

    const container =
      postcodeContainerRef.current

    const previousOverflow =
      document.body.style
        .overflow

    document.body.style.overflow =
      'hidden'

    container.replaceChildren()

    new window.daum.Postcode(
      {
        oncomplete: (
          data,
        ) => {
          const baseAddress =
            data.roadAddress ||
            data.jibunAddress

          const building =
            data.buildingName
              ? ` (${data.buildingName})`
              : ''

          onAddressChange(
            `[${data.zonecode}] ${baseAddress}${building}`,
          )

          setOpen(
            false,
          )

          window.setTimeout(
            () =>
              detailInputRef.current?.focus(),
            0,
          )
        },
      },
    ).embed(
      container,
    )

    const closeOnEscape =
      (
        event:
          KeyboardEvent,
      ) => {
        if (
          event.key ===
          'Escape'
        ) {
          setOpen(
            false,
          )
        }
      }

    document.addEventListener(
      'keydown',
      closeOnEscape,
    )

    return () => {
      document.body.style.overflow =
        previousOverflow

      document.removeEventListener(
        'keydown',
        closeOnEscape,
      )

      container.replaceChildren()
    }
  }, [
    onAddressChange,
    open,
    ready,
  ])

  const openAddressSearch =
    () => {
      if (
        !ready ||
        !window.daum
          ?.Postcode
      ) {
        return
      }

      setOpen(true)
    }

  return (
    <div>
      <label
        htmlFor={`${id}-base`}
        className={cn(
          'mb-2 block text-neutral-900',
          labelClassName ??
            'typography-label-1',
        )}
      >
        {label}
      </label>

      {stacked ? (
        <div className="space-y-2">
          <input
            id={`${id}-base`}
            className="h-[54px] w-full cursor-pointer rounded-input border border-neutral-500 bg-white px-4 typography-body-1 text-neutral-900 outline-none transition-colors placeholder:text-neutral-600 focus:border-primary-700"
            value={
              address
            }
            placeholder="주소를 검색해 주세요"
            readOnly
            onClick={
              openAddressSearch
            }
          />

          <button
            type="button"
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-input border border-neutral-500 bg-white typography-title-3 text-primary-700 transition-colors hover:border-primary-700 hover:bg-primary-100 disabled:cursor-wait disabled:border-neutral-300 disabled:bg-neutral-100 disabled:text-neutral-500"
            onClick={
              openAddressSearch
            }
            disabled={
              !ready
            }
          >
            <Search
              aria-hidden
              size={18}
            />

            {ready
              ? '주소 검색'
              : '준비 중'}
          </button>

          <label
            htmlFor={`${id}-detail`}
            className="block pt-2 typography-label-1 text-neutral-900"
          >
            상세 주소
          </label>

          <input
            ref={
              detailInputRef
            }
            id={`${id}-detail`}
            className="h-[54px] w-full rounded-input border border-neutral-500 bg-white px-4 typography-body-1 text-neutral-900 outline-none transition-colors placeholder:text-neutral-600 focus:border-primary-700"
            value={
              detailAddress
            }
            placeholder="상세 주소를 입력해 주세요"
            onChange={(
              event,
            ) =>
              onDetailAddressChange(
                event.target
                  .value,
              )
            }
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <input
              id={`${id}-base`}
              className="h-[52px] w-full cursor-pointer rounded-input border border-neutral-500 bg-white px-4 text-sm text-neutral-900 outline-none"
              value={
                address
              }
              placeholder="주소 검색을 눌러 주세요"
              readOnly
              onClick={
                openAddressSearch
              }
            />

            <button
              type="button"
              className="inline-flex h-[52px] min-w-24 items-center justify-center gap-1.5 rounded-input border border-neutral-500 bg-white px-3 text-[13px] font-semibold text-primary-700"
              onClick={
                openAddressSearch
              }
              disabled={
                !ready
              }
            >
              <Search
                aria-hidden
                size={17}
              />

              <span>
                {ready
                  ? '주소 검색'
                  : '준비 중'}
              </span>
            </button>
          </div>

          <input
            ref={
              detailInputRef
            }
            id={`${id}-detail`}
            className="mt-2 h-[52px] w-full rounded-input border border-neutral-500 bg-white px-4 text-sm text-neutral-900 outline-none"
            value={
              detailAddress
            }
            placeholder="상세주소를 입력해 주세요"
            onChange={(
              event,
            ) =>
              onDetailAddressChange(
                event.target
                  .value,
              )
            }
          />
        </>
      )}

      {error ? (
        <p className="mt-2 typography-label-2 text-error">
          {error}
        </p>
      ) : null}

      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-200 flex items-center justify-center bg-primary-900/35 p-4 backdrop-blur-[3px]"
              role="presentation"
              onMouseDown={(
                event,
              ) => {
                if (
                  event.target ===
                  event.currentTarget
                ) {
                  setOpen(
                    false,
                  )
                }
              }}
            >
              <section
                className="flex h-[min(620px,calc(100dvh-32px))] min-h-[420px] w-full max-w-[393px] flex-col overflow-hidden rounded-card border border-neutral-300 bg-white shadow-[0_24px_64px_rgb(18_61_49/24%)]"
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${id}-address-modal-title`}
              >
                <header className="flex shrink-0 items-start justify-between gap-4 border-b border-neutral-200 px-[18px] py-4">
                  <div>
                    <h2
                      id={`${id}-address-modal-title`}
                      className="typography-title-2 text-neutral-900"
                    >
                      주소 찾기
                    </h2>

                    <p className="mt-1 typography-label-2 text-neutral-600">
                      도로명, 건물명 또는
                      지번을 검색해 주세요.
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label="주소 검색 닫기"
                    className="flex size-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-800"
                    onClick={() =>
                      setOpen(
                        false,
                      )
                    }
                  >
                    <X
                      aria-hidden
                      size={20}
                    />
                  </button>
                </header>

                <div
                  ref={
                    postcodeContainerRef
                  }
                  className="min-h-0 w-full flex-1 bg-white [&>div]:!h-full [&>div]:!w-full [&_iframe]:!h-full [&_iframe]:!w-full"
                />
              </section>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}