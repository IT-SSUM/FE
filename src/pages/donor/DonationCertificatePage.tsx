import {
  ChevronLeft,
  Download,
  FileCheck2,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'

import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  matchErrorMessage,
  parseMatchId,
} from '@/apis/match'

import itssumWordmark from '@/assets/logo/itssum-wordmark.svg'

import {
  Button,
} from '@/components/common/Button/Button'

import {
  KakaoBrowserGuideDialog,
} from '@/components/common/KakaoBrowserGuideDialog/KakaoBrowserGuideDialog'

import {
  useMatchQuery,
} from '@/hooks/queries/useMatchQuery'

import {
  ROUTES,
} from '@/routes/paths'

import {
  isKakaoTalkInAppBrowser,
} from '@/utils/inAppBrowser'

import '@/styles/donation-certificate.css'

export function DonationCertificatePage() {
  const navigate =
    useNavigate()

  const [
    browserGuideOpen,
    setBrowserGuideOpen,
  ] =
    useState(false)

  const {
    matchId,
  } =
    useParams()

  const id =
    parseMatchId(
      matchId,
    )

  const query =
    useMatchQuery(
      id,
    )

  const match =
    query.data

  const certificateNumber =
    match?.completedAt
      ? createCertificateNumber(
          match.matchId,
          match.completedAt,
        )
      : null

  useEffect(() => {
    if (
      !certificateNumber
    ) {
      return
    }

    const previousTitle =
      document.title

    document.title =
      `ISSUM_기부확인서_${certificateNumber}`

    return () => {
      document.title =
        previousTitle
    }
  }, [
    certificateNumber,
  ])

  if (
    id === null
  ) {
    return (
      <CertificateError
        message="올바른 거래 번호가 필요해요."
        onBack={() =>
          navigate(
            ROUTES.donor
              .myHistory,
          )
        }
      />
    )
  }

  if (
    query.isPending
  ) {
    return (
      <CertificateState>
        기부 내역을 불러오고 있어요.
      </CertificateState>
    )
  }

  if (
    query.isError
  ) {
    return (
      <CertificateError
        message={matchErrorMessage(
          query.error,
        )}
        onBack={() =>
          navigate(
            ROUTES.donor
              .myHistory,
          )
        }
        onRetry={() =>
          void query.refetch()
        }
      />
    )
  }

  if (
    !match
  ) {
    return (
      <CertificateError
        message="기부 내역을 찾을 수 없어요."
        onBack={() =>
          navigate(
            ROUTES.donor
              .myHistory,
          )
        }
      />
    )
  }

  if (
    match.status !==
      'COMPLETED' ||
    !match.completedAt
  ) {
    return (
      <CertificateError
        message="전달 완료된 기부만 확인서를 발급할 수 있어요."
        onBack={() =>
          navigate(
            ROUTES.donor
              .myHistory,
          )
        }
      />
    )
  }

  const number =
    createCertificateNumber(
      match.matchId,
      match.completedAt,
    )

  const handlePrint =
    () => {
      if (
        isKakaoTalkInAppBrowser()
      ) {
        setBrowserGuideOpen(
          true,
        )

        return
      }

      window.print()
    }

  return (
    <div className="donation-certificate-page">
      <header className="certificate-toolbar certificate-no-print">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() =>
            navigate(-1)
          }
          className="certificate-back-button"
        >
          <ChevronLeft
            aria-hidden
            size={24}
            strokeWidth={2}
          />

          <span>
            기부 확인서
          </span>
        </button>

        <button
          type="button"
          onClick={
            handlePrint
          }
          className="certificate-print-button"
        >
          <Download
            aria-hidden
            size={18}
            strokeWidth={2}
          />

          PDF 저장
        </button>
      </header>

      <main className="certificate-preview">
        <article className="donation-certificate-sheet">
          <header className="certificate-header">
            <img
              src={
                itssumWordmark
              }
              alt="ISSUM"
              className="certificate-logo"
            />

            <p className="certificate-service-name">
              나눔을 잇는 자원순환 플랫폼
            </p>
          </header>

          <section className="certificate-title-section">
            <div className="certificate-title-icon">
              <FileCheck2
                aria-hidden
                size={32}
                strokeWidth={1.8}
              />
            </div>

            <h1 className="certificate-title">
              기부 확인서
            </h1>

            <p className="certificate-subtitle">
              DONATION CONFIRMATION
            </p>
          </section>

          <section className="certificate-number">
            확인서 번호
            <strong>
              {number}
            </strong>
          </section>

          <section className="certificate-statement">
            <strong>
              {match.donorName}
            </strong>
            님께서 ISSUM을 통해 아래와 같이
            물품을 기부하였음을 확인합니다.
          </section>

          <section className="certificate-information">
            <CertificateRow
              label="기부자"
              value={
                match.donorName
              }
            />

            <CertificateRow
              label="수령 기관"
              value={
                match.organizationName
              }
            />

            <CertificateRow
              label="기부 물품"
              value={
                match.donationItemName
              }
            />

            <CertificateRow
              label="기부 수량"
              value={`${match.quantity}${match.unit}`}
            />

            <CertificateRow
              label="기부 완료일"
              value={formatKoreanDate(
                match.completedAt,
              )}
            />

            <CertificateRow
              label="거래 번호"
              value={`#${match.matchId}`}
            />

            {match.deliveryMethod ? (
              <CertificateRow
                label="전달 방법"
                value={deliveryMethodLabel(
                  match.deliveryMethod,
                )}
              />
            ) : null}

            {match.deliveryPlace ? (
              <CertificateRow
                label="전달 장소"
                value={
                  match.deliveryPlace
                }
              />
            ) : null}
          </section>

          <section className="certificate-completion">
            <p>
              위 기부는 수령 기관의 확인을 통해
              정상적으로 전달 완료 처리되었습니다.
            </p>
          </section>

          <footer className="certificate-footer">
            <p className="certificate-issued-date">
              발급일{' '}
              {formatToday()}
            </p>

            <div className="certificate-brand">
              <strong>
                ISSUM
              </strong>

              <span>
                기부 완료 기록 확인
              </span>
            </div>

            <p className="certificate-disclaimer">
              본 확인서는 ISSUM 서비스 내 기부 완료
              내역을 바탕으로 발급되는 활동 확인용
              문서입니다.
              <br />
              세액공제용 공식 기부금영수증으로 사용할
              수 없습니다.
            </p>
          </footer>
        </article>
      </main>

      <footer className="certificate-mobile-footer certificate-no-print">
        <p>
          버튼을 누른 뒤 인쇄 창에서
          <strong> PDF로 저장</strong>을 선택해 주세요.
        </p>

        <Button
          className="w-full"
          onClick={
            handlePrint
          }
        >
          <Download
            aria-hidden
            size={18}
          />

          PDF로 저장
        </Button>
      </footer>

      <KakaoBrowserGuideDialog
        open={
          browserGuideOpen
        }
        onClose={() =>
          setBrowserGuideOpen(
            false,
          )
        }
      />
    </div>
  )
}

function CertificateRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="certificate-row">
      <dt>
        {label}
      </dt>

      <dd>
        {value}
      </dd>
    </div>
  )
}

function CertificateState({
  children,
}: {
  children:
    React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#eaf2ed] px-5">
      <p className="typography-body-2 text-neutral-700">
        {children}
      </p>
    </div>
  )
}

function CertificateError({
  message,
  onBack,
  onRetry,
}: {
  message: string
  onBack: () => void
  onRetry?: () => void
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#eaf2ed] px-5">
      <section className="w-full max-w-[393px] rounded-card border border-neutral-200 bg-white p-6 text-center">
        <p className="typography-title-3 text-neutral-900">
          {message}
        </p>

        {onRetry ? (
          <Button
            className="mt-5 w-full"
            onClick={
              onRetry
            }
          >
            다시 시도
          </Button>
        ) : null}

        <Button
          variant="secondary"
          className="mt-2 w-full"
          onClick={
            onBack
          }
        >
          거래 내역으로
        </Button>
      </section>
    </div>
  )
}

function createCertificateNumber(
  matchId: number,
  completedAt: string,
) {
  const date =
    new Date(
      completedAt,
    )

  const datePart =
    Number.isNaN(
      date.getTime(),
    )
      ? '00000000'
      : new Intl.DateTimeFormat(
          'en-CA',
          {
            timeZone:
              'Asia/Seoul',
            year:
              'numeric',
            month:
              '2-digit',
            day:
              '2-digit',
          },
        )
          .format(date)
          .replace(
            /-/g,
            '',
          )

  return `ISSUM-${datePart}-${String(
    matchId,
  ).padStart(6, '0')}`
}

function formatKoreanDate(
  value: string,
) {
  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    'ko-KR',
    {
      timeZone:
        'Asia/Seoul',
      year:
        'numeric',
      month:
        'long',
      day:
        'numeric',
    },
  ).format(date)
}

function formatToday() {
  return new Intl.DateTimeFormat(
    'ko-KR',
    {
      timeZone:
        'Asia/Seoul',
      year:
        'numeric',
      month:
        'long',
      day:
        'numeric',
    },
  ).format(
    new Date(),
  )
}

function deliveryMethodLabel(
  value: string,
) {
  switch (
    value
  ) {
    case 'DIRECT':
      return '직접 전달'

    case 'PARCEL':
      return '택배'

    default:
      return value
  }
}