import {
  useRef,
  useState,
} from 'react'

import {
  ImagePlus,
  X,
} from 'lucide-react'

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

  flowStyle?: boolean
}

export function PhotoInput({
  photos,
  onChange,
  error,
  onBusyChange,
  label = '사진',
  optional = false,
  maxPhotos = 3,
  flowStyle = false,
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

  const reading =
    useRef(false)

  async function readFiles(
    files: File[],
  ) {
    if (
      reading.current ||
      !files.length
    ) {
      return
    }

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

  if (flowStyle) {
    return (
      <fieldset
        className="space-y-2"
        disabled={busy}
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
                key={`${index}-${photo.slice(-20)}`}
                className="relative size-[120px] shrink-0"
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
                  aria-label={`${label} ${index + 1} 삭제`}
                  className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-neutral-900/70 text-white"
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
            <label className="flex size-[120px] shrink-0 cursor-pointer flex-col items-center justify-center rounded-input border border-dashed border-neutral-400 bg-white text-primary-700 transition-colors hover:border-primary-700 hover:bg-primary-100">
              <ImagePlus
                aria-hidden
                size={28}
                strokeWidth={2}
              />

              <span className="mt-2 typography-label-1">
                사진 추가
              </span>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={
                  busy
                }
                className="sr-only"
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
            </label>
          ) : null}
        </div>

        <p className="typography-label-2 text-neutral-600">
          전체 모습이
          보이도록 밝은 곳에서
          촬영해 주세요.
        </p>

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
    )
  }

  return (
    <fieldset
      className="space-y-2"
      disabled={busy}
    >
      <legend className="typography-label-1 text-neutral-900">
        {label}
        {optional
          ? ' (선택)'
          : ` (1~${maxPhotos}장)`}
      </legend>

      <label className="flex min-h-[72px] cursor-pointer items-center gap-3 rounded-input border border-dashed border-neutral-400 bg-white px-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
          <ImagePlus
            aria-hidden
            size={21}
          />
        </span>

        <span>
          <strong className="block typography-body-2 text-neutral-900">
            사진 추가하기
          </strong>

          <span className="mt-1 block typography-label-2 text-neutral-600">
            JPG·PNG·WebP
          </span>
        </span>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
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
      </label>

      {error ? (
        <p className="typography-label-2 text-error">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}