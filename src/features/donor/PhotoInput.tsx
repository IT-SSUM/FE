import {
  useRef,
  useState,
} from 'react'

import {
  BookOpen,
  Camera,
  Images,
  X,
} from 'lucide-react'

import {
  Button,
} from '@/components/common/Button/Button'

type PhotoInputProps = {
  photos: string[]

  onChange: (
    photos: string[],
  ) => void

  error?: string

  onBusyChange: (
    busy: boolean,
  ) => void

  label?: string

  optional?: boolean

  maxPhotos?: number
}

export function PhotoInput({
  photos,
  onChange,
  error,
  onBusyChange,
  label = '사진',
  optional = false,
  maxPhotos = 3,
}: PhotoInputProps) {
  const [
    message,
    setMessage,
  ] =
    useState('')

  const [
    busy,
    setBusy,
  ] =
    useState(false)

  const [
    pickerOpen,
    setPickerOpen,
  ] =
    useState(false)

  const reading =
    useRef(false)

  const galleryInputRef =
    useRef<HTMLInputElement>(
      null,
    )

  const cameraInputRef =
    useRef<HTMLInputElement>(
      null,
    )

  async function readFiles(
    files: File[],
  ) {
    if (
      reading.current ||
      !files.length
    ) {
      return
    }

    setPickerOpen(
      false,
    )

    setMessage('')

    if (
      files.length +
        photos.length >
      maxPhotos
    ) {
      setMessage(
        `사진은 최대 ${maxPhotos}장까지 추가할 수 있어요.`,
      )

      return
    }

    if (
      files.some(
        (file) =>
          ![
            'image/jpeg',
            'image/png',
            'image/webp',
          ].includes(
            file.type,
          ) ||
          file.size >
            1024 *
              1024,
      )
    ) {
      setMessage(
        'JPG, PNG, WebP 형식의 1MB 이하 사진만 추가해 주세요.',
      )

      return
    }

    reading.current =
      true

    setBusy(true)

    onBusyChange(
      true,
    )

    try {
      const urls =
        await Promise.all(
          files.map(
            (file) =>
              new Promise<string>(
                (
                  resolve,
                  reject,
                ) => {
                  const reader =
                    new FileReader()

                  reader.onerror =
                    () =>
                      reject(
                        new Error(
                          '사진을 읽을 수 없어요.',
                        ),
                      )

                  reader.onload =
                    () => {
                      const url =
                        String(
                          reader.result,
                        )

                      const image =
                        new Image()

                      image.onload =
                        () =>
                          resolve(
                            url,
                          )

                      image.onerror =
                        () =>
                          reject(
                            new Error(
                              '올바른 이미지 파일을 선택해 주세요.',
                            ),
                          )

                      image.src =
                        url
                    }

                  reader.readAsDataURL(
                    file,
                  )
                },
              ),
          ),
        )

      onChange([
        ...photos,
        ...urls,
      ])
    } catch (
      cause
    ) {
      setMessage(
        cause instanceof
          Error
          ? cause.message
          : '사진 추가에 실패했어요.',
      )
    } finally {
      reading.current =
        false

      setBusy(false)

      onBusyChange(
        false,
      )
    }
  }

  return (
    <>
      <fieldset
        className="space-y-3"
        disabled={
          busy
        }
      >
        <legend className="typography-label-1 text-neutral-900">
          {label}

          {optional
            ? ' (선택)'
            : ' (최소 1장)'}
        </legend>

        <div className="flex flex-wrap gap-3">
          {photos.map(
            (
              photo,
              index,
            ) => (
              <div
                className="relative size-[120px] shrink-0"
                key={`${index}-${photo.slice(-20)}`}
              >
                <img
                  src={
                    photo
                  }
                  alt={`${label} ${index + 1}`}
                  className="size-[120px] rounded-input object-cover"
                />

                <button
                  type="button"
                  onClick={() =>
                    onChange(
                      photos.filter(
                        (
                          _,
                          i,
                        ) =>
                          i !==
                          index,
                      ),
                    )
                  }
                  aria-label={`${label} ${index + 1} 삭제`}
                  className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-neutral-900/70 text-white"
                >
                  <X
                    aria-hidden
                    size={15}
                  />
                </button>
              </div>
            ),
          )}

          {photos.length <
          maxPhotos ? (
            <button
              type="button"
              aria-label="물품 사진 추가"
              className="flex size-[120px] shrink-0 items-center justify-center rounded-input bg-error-bg text-primary-700 transition-colors hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
              onClick={() =>
                setPickerOpen(
                  true,
                )
              }
            >
              <BookOpen
                aria-hidden
                size={44}
                strokeWidth={2}
              />
            </button>
          ) : null}
        </div>

        {busy ? (
          <p
            role="status"
            className="typography-label-2 text-neutral-700"
          >
            사진을 확인하고
            있어요.
          </p>
        ) : null}

        {message ||
        error ? (
          <p
            role="alert"
            className="typography-label-2 text-error"
          >
            {message ||
              error}
          </p>
        ) : null}
      </fieldset>

      <input
        ref={
          galleryInputRef
        }
        aria-label="사진 보관함에서 선택"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        disabled={
          busy ||
          photos.length >=
            maxPhotos
        }
        onChange={(
          event,
        ) => {
          const files =
            Array.from(
              event.target
                .files ??
                [],
            )

          event.target.value =
            ''

          void readFiles(
            files,
          )
        }}
      />

      <input
        ref={
          cameraInputRef
        }
        aria-label="사진 촬영"
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        disabled={
          busy ||
          photos.length >=
            maxPhotos
        }
        onChange={(
          event,
        ) => {
          const files =
            Array.from(
              event.target
                .files ??
                [],
            )

          event.target.value =
            ''

          void readFiles(
            files,
          )
        }}
      />

      {pickerOpen ? (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/30 px-5"
          role="presentation"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setPickerOpen(
                false,
              )
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="photo-picker-title"
            className="w-full max-w-[332px] rounded-card bg-white p-6 shadow-xl"
          >
            <h2
              id="photo-picker-title"
              className="typography-title-1 text-neutral-900"
            >
              물품 사진을 추가해요
            </h2>

            <p className="mt-2 typography-body-2 text-neutral-700">
              전체 모습이 보이도록 밝은 곳에서 촬영해 주세요.
            </p>

            <div className="mt-5 space-y-2">
              <Button
                className="w-full gap-2"
                onClick={() =>
                  galleryInputRef.current?.click()
                }
              >
                <Images
                  aria-hidden
                  size={18}
                />

                사진 보관함에서 선택
              </Button>

              <Button
                variant="secondary"
                className="w-full gap-2"
                onClick={() =>
                  cameraInputRef.current?.click()
                }
              >
                <Camera
                  aria-hidden
                  size={18}
                />

                사진 촬영
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}