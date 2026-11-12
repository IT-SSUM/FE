import {
  Package,
} from 'lucide-react'

import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  useBlocker,
  useNavigate,
} from 'react-router-dom'

import { Button } from '@/components/common/Button/Button'
import { Dialog } from '@/components/common/Dialog/Dialog'
import { Input } from '@/components/common/Input/Input'
import { Textarea } from '@/components/common/Textarea/Textarea'

import {
  useUpdateDonationItemMutation,
} from '@/hooks/mutations/useUpdateDonationItemMutation'

import {
  routePath,
} from '@/routes/paths'

import type {
  DonationItemDetail,
} from '@/types/donationItem'

import {
  DonorPage,
} from './DonorPage'

import {
  donationItemDraft,
  donationItemPatch,
  getDonationItemFailure,
  type DonationItemEditDraft,
} from './donationItemApiState'

export function DonationItemEditForm({
  item,
}: {
  item:
    DonationItemDetail
}) {
  const navigate =
    useNavigate()

  const update =
    useUpdateDonationItemMutation()

  const [
    original,
  ] =
    useState(() =>
      donationItemDraft(
        item,
      ),
    )

  const [
    draft,
    setDraft,
  ] =
    useState(
      original,
    )

  const [
    errors,
    setErrors,
  ] =
    useState<
      Partial<
        Record<
          keyof DonationItemEditDraft,
          string
        >
      >
    >({})

  const [
    failure,
    setFailure,
  ] =
    useState('')

  const submitting =
    useRef(false)

  const saved =
    useRef(false)

  const patch =
    donationItemPatch(
      original,
      draft,
    )

  const dirty =
    Object.keys(
      patch,
    ).length >
    0

  const blocker =
    useBlocker(
      () =>
        dirty &&
        !saved.current,
    )

  const back =
    routePath.donorDonationDetail(
      String(
        item.donationItemId,
      ),
    )

  useEffect(() => {
    if (!dirty) {
      return
    }

    const warn =
      (
        event:
          BeforeUnloadEvent,
      ) => {
        if (
          !saved.current
        ) {
          event.preventDefault()

          event.returnValue =
            ''
        }
      }

    window.addEventListener(
      'beforeunload',
      warn,
    )

    return () =>
      window.removeEventListener(
        'beforeunload',
        warn,
      )
  }, [
    dirty,
  ])

  function change(
    key:
      keyof DonationItemEditDraft,

    value:
      string,
  ) {
    setDraft(
      (
        previous,
      ) => ({
        ...previous,

        [key]:
          value,
      }),
    )

    setErrors(
      (
        previous,
      ) => ({
        ...previous,

        [key]:
          undefined,
      }),
    )

    setFailure('')
  }

  return (
    <DonorPage
      title="물품 수정"
      back={
        back
      }
      mode="server"
      footer={
        <footer className="shrink-0 bg-surface-canvas px-5 pb-5 pt-3">
          <Button
            type="submit"
            form="donation-item-edit"
            className="w-full"
            disabled={
              !dirty ||
              update.isPending ||
              !item.mine
            }
          >
            {update.isPending
              ? '저장 중...'
              : '저장'}
          </Button>
        </footer>
      }
    >
      <form
        id="donation-item-edit"
        noValidate
        className="space-y-4 pt-3"
        onSubmit={async (
          event,
        ) => {
          event.preventDefault()

          if (
            !dirty ||
            !item.mine ||
            submitting.current
          ) {
            return
          }

          const checked:
            typeof errors = {}

          if (
            'pickupAddress' in
              patch &&
            !draft.pickupAddress.trim()
          ) {
            checked.pickupAddress =
              '물품 위치를 입력해 주세요.'
          }

          if (
            draft.description.length >
            1000
          ) {
            checked.description =
              '설명은 1000자 이하로 입력해 주세요.'
          }

          setErrors(
            checked,
          )

          setFailure('')

          if (
            Object.keys(
              checked,
            ).length
          ) {
            return
          }

          submitting.current =
            true

          try {
            await update.mutateAsync(
              {
                donationItemId:
                  item.donationItemId,

                body:
                  patch,
              },
            )

            saved.current =
              true

            navigate(
              back,
              {
                replace:
                  true,
              },
            )
          } catch (
            cause
          ) {
            const result =
              getDonationItemFailure(
                cause,
              )

            setFailure(
              result.message,
            )

            const serverErrors:
              typeof errors = {}

            for (
              const field
              of result.fieldErrors
            ) {
              if (
                field.field ===
                  'description' ||
                field.field ===
                  'pickupAddress'
              ) {
                serverErrors[
                  field.field
                ] =
                  field.reason
              }
            }

            setErrors(
              serverErrors,
            )
          } finally {
            submitting.current =
              false
          }
        }}
      >
        <Textarea
          label="설명 (선택)"
          value={
            draft.description
          }
          maxLength={
            1000
          }
          showMaxLength={
            false
          }
          error={
            errors.description
          }
          className="min-h-[128px] resize-none"
          onChange={(
            event,
          ) =>
            change(
              'description',
              event.target
                .value,
            )
          }
        />

        <Input
          label="물품 위치"
          required
          value={
            draft.pickupAddress
          }
          error={
            errors.pickupAddress
          }
          onChange={(
            event,
          ) =>
            change(
              'pickupAddress',
              event.target
                .value,
            )
          }
        />

        <section className="space-y-3">
          <h2 className="typography-label-1 text-neutral-900">
            물품 사진
          </h2>

          {item.imageUrls.length >
          0 ? (
            <div className="flex gap-3 overflow-x-auto">
              {item.imageUrls.map(
                (
                  url,
                  index,
                ) => (
                  <img
                    key={`${url}-${index}`}
                    src={
                      url
                    }
                    alt={`등록된 물품 사진 ${index + 1}`}
                    className="size-[104px] shrink-0 rounded-input bg-error-bg object-cover"
                  />
                ),
              )}
            </div>
          ) : (
            <div className="flex size-[104px] items-center justify-center rounded-input bg-error-bg text-primary-700">
              <Package
                aria-hidden
                size={38}
              />
            </div>
          )}
        </section>

        {failure ? (
          <p
            role="alert"
            className="typography-body-2 text-error"
          >
            {
              failure
            }
          </p>
        ) : null}
      </form>

      <Dialog
        open={
          blocker.state ===
          'blocked'
        }
        title={
          update.isPending
            ? '저장 중입니다'
            : '수정 중인 내용을 버릴까요?'
        }
        description={
          update.isPending
            ? '저장이 끝날 때까지 기다려 주세요.'
            : '저장하지 않은 입력 내용은 사라집니다.'
        }
        confirmText={
          update.isPending
            ? '계속 기다리기'
            : '나가기'
        }
        cancelText="계속 수정하기"
        onConfirm={() => {
          if (
            blocker.state !==
            'blocked'
          ) {
            return
          }

          if (
            submitting.current
          ) {
            blocker.reset()
          } else {
            blocker.proceed()
          }
        }}
        onCancel={() => {
          if (
            blocker.state ===
            'blocked'
          ) {
            blocker.reset()
          }
        }}
      />
    </DonorPage>
  )
}