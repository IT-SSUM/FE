import {
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  useBlocker,
  useNavigate,
} from 'react-router-dom'
import { Input } from '@/components/common/Input/Input'
import { Button } from '@/components/common/Button/Button'
import { Dialog } from '@/components/common/Dialog/Dialog'
import { ROUTES } from '@/routes/paths'
import { today } from '@/features/donor/model'
import { DonorPage } from '@/features/donor/DonorPage'
import { useDonorProfileQuery } from '@/hooks/queries/useDonorProfileQuery'
import { useUpdateDonorProfileMutation } from '@/hooks/mutations/useUpdateDonorProfileMutation'

type ProfileDraft = {
  name: string
  birthDate: string
  phone: string
}

type ProfileErrors = Partial<
  Record<keyof ProfileDraft, string>
>

function validateProfile(
  profile: ProfileDraft,
): ProfileErrors {
  const errors: ProfileErrors = {}

  if (
    !profile.name.trim() ||
    profile.name.length > 50
  ) {
    errors.name =
      '이름을 1~50자로 입력해 주세요.'
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      profile.birthDate,
    ) ||
    Number.isNaN(
      Date.parse(profile.birthDate),
    ) ||
    profile.birthDate > today()
  ) {
    errors.birthDate =
      '올바른 생년월일을 입력해 주세요.'
  }

  if (
    !/^0\d{8,10}$/.test(
      profile.phone.replace(/[- ]/g, ''),
    )
  ) {
    errors.phone =
      '전화번호를 확인해 주세요.'
  }

  return errors
}

export function DonorProfileEditPage() {
  const navigate = useNavigate()

  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useDonorProfileQuery()

  const updateProfile =
    useUpdateDonorProfileMutation()

  const [draft, setDraft] =
    useState<ProfileDraft | null>(null)

  const [errors, setErrors] =
    useState<ProfileErrors>({})

  const [failure, setFailure] =
    useState('')

  const saved = useRef(false)

  useEffect(() => {
    if (!profile) {
      return
    }

    setDraft({
      name: profile.name,
      birthDate: profile.birthDate,
      phone: profile.phone,
    })
  }, [profile])

  const dirty =
    profile !== undefined &&
    draft !== null &&
    (
      draft.name !== profile.name ||
      draft.birthDate !== profile.birthDate ||
      draft.phone !== profile.phone
    )

  const blocker = useBlocker(
    () => dirty && !saved.current,
  )

  useEffect(() => {
    if (!dirty) {
      return
    }

    const warn = (
      event: BeforeUnloadEvent,
    ) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener(
      'beforeunload',
      warn,
    )

    return () => {
      window.removeEventListener(
        'beforeunload',
        warn,
      )
    }
  }, [dirty])

  /*
   * 중요:
   * 에러 / 로딩 / 데이터 없음 상태를
   * 각각 return해서 아래 JSX에서는
   * profile과 draft가 반드시 존재하도록 만듭니다.
   */

  if (isError) {
    return (
      <DonorPage
        title="회원정보 수정"
        back={ROUTES.donor.myPage}
      >
        <section className="rounded-card border border-neutral-200 bg-white p-6 text-center">
          <p className="typography-title-3">
            회원정보를 불러오지 못했어요.
          </p>

          <button
            type="button"
            className="mt-3 text-primary-700"
            onClick={() => {
              void refetch()
            }}
          >
            다시 시도
          </button>
        </section>
      </DonorPage>
    )
  }

  if (
    isLoading ||
    !profile ||
    !draft
  ) {
    return (
      <DonorPage
        title="회원정보 수정"
        back={ROUTES.donor.myPage}
      >
        <p role="status">
          회원정보를 불러오고 있어요.
        </p>
      </DonorPage>
    )
  }

  /*
   * 여기부터는 TypeScript가
   *
   * profile: DonorProfile
   * draft: ProfileDraft
   *
   * 로 확정해서 인식합니다.
   */

  return (
    <DonorPage
      title="회원정보 수정"
      back={ROUTES.donor.myPage}
    >
      <form
        noValidate
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault()

          const checked =
            validateProfile(draft)

          setErrors(checked)

          if (
            Object.keys(checked).length
          ) {
            return
          }

          setFailure('')

          try {
            await updateProfile.mutateAsync({
              name: draft.name,
              birthDate: draft.birthDate,
              phone: draft.phone,
            })

            saved.current = true

            navigate(
              ROUTES.donor.myPage,
              {
                replace: true,
              },
            )
          } catch (cause) {
            setFailure(
              cause instanceof Error
                ? cause.message
                : '저장하지 못했어요.',
            )
          }
        }}
      >
        <Input
          required
          label="이름"
          type="text"
          maxLength={50}
          value={draft.name}
          error={errors.name}
          onChange={(event) => {
            setDraft({
              ...draft,
              name: event.target.value,
            })

            setErrors((previous) => ({
              ...previous,
              name: undefined,
            }))

            setFailure('')
          }}
        />

        <Input
          required
          label="생년월일"
          type="date"
          max={today()}
          value={draft.birthDate}
          error={errors.birthDate}
          onChange={(event) => {
            setDraft({
              ...draft,
              birthDate:
                event.target.value,
            })

            setErrors((previous) => ({
              ...previous,
              birthDate: undefined,
            }))

            setFailure('')
          }}
        />

        <Input
          required
          label="전화번호"
          type="tel"
          maxLength={20}
          value={draft.phone}
          error={errors.phone}
          onChange={(event) => {
            setDraft({
              ...draft,
              phone: event.target.value,
            })

            setErrors((previous) => ({
              ...previous,
              phone: undefined,
            }))

            setFailure('')
          }}
        />

        <Input
          label="이메일"
          type="email"
          value={profile.email}
          disabled
        />

        <Input
          label="활동 지역"
          type="text"
          value={profile.regionName}
          disabled
        />

        <p className="typography-label-2 text-neutral-700">
          이메일과 활동 지역은
          회원정보 수정 화면에서 변경할 수
          없습니다.
        </p>

        {failure ? (
          <p
            role="alert"
            className="text-error"
          >
            {failure}
          </p>
        ) : null}

        <Button
          type="submit"
          className="w-full"
          disabled={
            updateProfile.isPending ||
            !dirty
          }
        >
          {updateProfile.isPending
            ? '저장 중...'
            : '저장하기'}
        </Button>
      </form>

      <Dialog
        open={
          blocker.state === 'blocked'
        }
        title="수정 중인 내용을 버릴까요?"
        confirmText="나가기"
        cancelText="계속 수정하기"
        onConfirm={() => {
          if (
            blocker.state === 'blocked'
          ) {
            blocker.proceed()
          }
        }}
        onCancel={() => {
          if (
            blocker.state === 'blocked'
          ) {
            blocker.reset()
          }
        }}
      />
    </DonorPage>
  )
}