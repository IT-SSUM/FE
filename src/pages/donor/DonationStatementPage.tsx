import {
  Check,
  ChevronLeft,
  Download,
  FileCheck2,
  Package,
} from 'lucide-react'

import {
  useMemo,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  matchErrorMessage,
} from '@/apis/match'

import wordmarkLogo from '@/assets/logo/itssum-wordmark.svg'

import {
  BottomNavigation,
} from '@/components/common/BottomNavigation/BottomNavigation'

import {
  Button,
} from '@/components/common/Button/Button'

import {
  KakaoBrowserGuideDialog,
} from '@/components/common/KakaoBrowserGuideDialog/KakaoBrowserGuideDialog'

import {
  useMatchesQuery,
} from '@/hooks/queries/useMatchesQuery'

import type {
  MatchListItem,
} from '@/types/match'

import {
  isKakaoTalkInAppBrowser,
} from '@/utils/inAppBrowser'

import '@/styles/donation-statement.css'

export function DonationStatementPage() {
  const navigate =
    useNavigate()

  const matchesQuery =
    useMatchesQuery()

  const [
    browserGuideOpen,
    setBrowserGuideOpen,
  ] =
    useState(false)

  const [
    selectedIds,
    setSelectedIds,
  ] =
    useState<
      Set<number>
    >(
      () =>
        new Set(),
    )

  const completedMatches =
    useMemo(
      () =>
        (
          matchesQuery.data ??
          []
        )
          .filter(
            (match) =>
              match.status ===
              'COMPLETED',
          )
          .sort(
            (
              first,
              second,
            ) =>
              completedTime(
                second.completedAt,
              ) -
              completedTime(
                first.completedAt,
              ),
          ),
      [
        matchesQuery.data,
      ],
    )

  const selectedMatches =
    useMemo(
      () =>
        completedMatches.filter(
          (match) =>
            selectedIds.has(
              match.matchId,
            ),
        ),
      [
        completedMatches,
        selectedIds,
      ],
    )

  const allSelected =
    completedMatches.length >
      0 &&
    completedMatches.every(
      (match) =>
        selectedIds.has(
          match.matchId,
        ),
    )

  const donorName =
    selectedMatches[0]
      ?.donorName ??
    completedMatches[0]
      ?.donorName ??
    '기부자'

  const toggleMatch =
    (
      matchId:
        number,
    ) => {
      setSelectedIds(
        (
          current,
        ) => {
          const next =
            new Set(
              current,
            )

          if (
            next.has(
              matchId,
            )
          ) {
            next.delete(
              matchId,
            )
          } else {
            next.add(
              matchId,
            )
          }

          return next
        },
      )
    }

  const toggleAll =
    () => {
      if (
        allSelected
      ) {
        setSelectedIds(
          new Set(),
        )

        return
      }

      setSelectedIds(
        new Set(
          completedMatches.map(
            (match) =>
              match.matchId,
          ),
        ),
      )
    }

  const printStatement =
    () => {
      if (
        selectedMatches.length ===
        0
      ) {
        return
      }

      if (
        isKakaoTalkInAppBrowser()
      ) {
        setBrowserGuideOpen(
          true,
        )

        return
      }

      const previousTitle =
        document.title

      document.title =
        `ISSUM_기부내역확인서_${formatFileDate(
          new Date(),
        )}`

      window.addEventListener(
        'afterprint',
        () => {
          document.title =
            previousTitle
        },
        {
          once:
            true,
        },
      )

      window.print()
    }

  return (
    <div className="donation-statement-root">
      <div className="statement-screen">
        <div className="statement-mobile-shell">
          <header className="flex h-14 shrink-0 items-center gap-2 px-5">
            <button
              type="button"
              aria-label="뒤로가기"
              onClick={() =>
                navigate(-1)
              }
              className="flex size-6 items-center justify-center text-primary-700"
            >
              <ChevronLeft
                aria-hidden
                size={24}
                strokeWidth={2}
              />
            </button>

            <h1 className="typography-title-3 text-neutral-900">
              기부 내역서 발급
            </h1>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-32 pt-3">
            <section className="rounded-card bg-primary-100 p-4">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-primary-700">
                  <FileCheck2
                    aria-hidden
                    size={22}
                    strokeWidth={2}
                  />
                </span>

                <div>
                  <h2 className="typography-title-3 text-neutral-900">
                    기부 내역을 선택해 주세요
                  </h2>

                  <p className="mt-1 typography-body-2 leading-5 text-neutral-700">
                    전달 완료된 기부 중 필요한
                    내역만 선택해 하나의 PDF로
                    발급할 수 있어요.
                  </p>
                </div>
              </div>
            </section>

            {matchesQuery.isPending ? (
              <p
                role="status"
                className="py-12 text-center typography-body-2 text-neutral-700"
              >
                기부 내역을 불러오고 있어요.
              </p>
            ) : null}

            {matchesQuery.isError ? (
              <section
                role="alert"
                className="mt-4 rounded-card border border-neutral-200 bg-white p-5 text-center"
              >
                <p className="typography-body-2 text-error">
                  {matchErrorMessage(
                    matchesQuery.error,
                  )}
                </p>

                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={() =>
                    void matchesQuery.refetch()
                  }
                >
                  다시 시도
                </Button>
              </section>
            ) : null}

            {!matchesQuery.isPending &&
            !matchesQuery.isError ? (
              <>
                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <h2 className="typography-title-2 text-neutral-900">
                      전달 완료 내역
                    </h2>

                    <p className="mt-1 typography-label-2 text-neutral-600">
                      총{' '}
                      {
                        completedMatches.length
                      }
                      건
                    </p>
                  </div>

                  {completedMatches.length >
                  0 ? (
                    <button
                      type="button"
                      onClick={
                        toggleAll
                      }
                      className="typography-label-1 text-primary-700"
                    >
                      {allSelected
                        ? '전체 해제'
                        : '전체 선택'}
                    </button>
                  ) : null}
                </div>

                {completedMatches.length ===
                0 ? (
                  <section className="mt-4 rounded-card border border-neutral-200 bg-white px-5 py-10 text-center">
                    <FileCheck2
                      aria-hidden
                      size={36}
                      className="mx-auto text-neutral-500"
                    />

                    <p className="mt-3 typography-title-3 text-neutral-900">
                      발급 가능한 내역이 없어요.
                    </p>

                    <p className="mt-2 typography-body-2 text-neutral-700">
                      기관이 수령을 확인한
                      전달 완료 기부가 이곳에
                      표시돼요.
                    </p>
                  </section>
                ) : (
                  <section className="mt-4 space-y-3">
                    {completedMatches.map(
                      (
                        match,
                      ) => (
                        <DonationSelectCard
                          key={
                            match.matchId
                          }
                          match={
                            match
                          }
                          selected={
                            selectedIds.has(
                              match.matchId,
                            )
                          }
                          onClick={() =>
                            toggleMatch(
                              match.matchId,
                            )
                          }
                        />
                      ),
                    )}
                  </section>
                )}
              </>
            ) : null}
          </main>

          <div className="statement-action-bar">
            <div className="mb-2 flex items-center justify-between">
              <span className="typography-label-2 text-neutral-700">
                선택한 기부
              </span>

              <strong className="typography-title-3 text-primary-700">
                {
                  selectedMatches.length
                }
                건
              </strong>
            </div>

            <Button
              className="w-full"
              disabled={
                selectedMatches.length ===
                0
              }
              onClick={
                printStatement
              }
            >
              <Download
                aria-hidden
                size={18}
                strokeWidth={2}
              />

              선택 내역 PDF 발급
            </Button>
          </div>

          <BottomNavigation
            activeItem="my"
            className="shrink-0"
          />
        </div>
      </div>

      <section className="statement-print">
        <header className="statement-print-header">
          <img
            src={
              wordmarkLogo
            }
            alt="IT:SSUM"
            className="statement-print-logo"
          />

          <div className="statement-print-brand">
            <strong>
              기부 내역 확인서
            </strong>

            <span>
              DONATION HISTORY STATEMENT
            </span>
          </div>
        </header>

        <section className="statement-print-intro">
          <p>
            <strong>
              {donorName}
            </strong>
            님께서 ISSUM을 통해 아래와
            같이 물품을 기부하였음을
            확인합니다.
          </p>
        </section>

        <section className="statement-print-summary">
          <div>
            <span>
              기부자
            </span>

            <strong>
              {donorName}
            </strong>
          </div>

          <div>
            <span>
              선택 기부 건수
            </span>

            <strong>
              {
                selectedMatches.length
              }
              건
            </strong>
          </div>

          <div>
            <span>
              발급일
            </span>

            <strong>
              {formatKoreanDate(
                new Date(),
              )}
            </strong>
          </div>
        </section>

        <table className="statement-print-table">
          <thead>
            <tr>
              <th>
                No.
              </th>

              <th>
                기부 완료일
              </th>

              <th>
                수령 기관
              </th>

              <th>
                기부 물품
              </th>

              <th>
                수량
              </th>

              <th>
                거래번호
              </th>
            </tr>
          </thead>

          <tbody>
            {selectedMatches.map(
              (
                match,
                index,
              ) => (
                <tr
                  key={
                    match.matchId
                  }
                >
                  <td>
                    {
                      index +
                      1
                    }
                  </td>

                  <td>
                    {formatCompletedDate(
                      match.completedAt,
                    )}
                  </td>

                  <td>
                    {
                      match.organizationName
                    }
                  </td>

                  <td>
                    {
                      match.donationItemName
                    }
                  </td>

                  <td>
                    {
                      match.quantity
                    }
                    {
                      match.unit
                    }
                  </td>

                  <td>
                    ISSUM-
                    {
                      match.matchId
                    }
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>

        <section className="statement-print-confirm">
          위 기부 내역은 각 수령 기관의
          수령 확인을 통해 전달 완료 처리된
          기록입니다.
        </section>

        <footer className="statement-print-footer">
          <div>
            <strong>
              ISSUM
            </strong>

            <span>
              나눔을 잇는 자원순환 플랫폼
            </span>
          </div>

          <p>
            본 문서는 ISSUM 서비스 내
            전달 완료 기록을 바탕으로
            생성된 활동 확인용 내역서입니다.
            <br />
            세액공제용 공식 기부금영수증으로
            사용할 수 없습니다.
          </p>
        </footer>
      </section>

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

function DonationSelectCard({
  match,
  selected,
  onClick,
}: {
  match:
    MatchListItem

  selected:
    boolean

  onClick:
    () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={
        selected
      }
      onClick={
        onClick
      }
      className={
        selected
          ? 'flex w-full items-start gap-3 rounded-card border border-primary-700 bg-primary-100 p-4 text-left'
          : 'flex w-full items-start gap-3 rounded-card border border-neutral-200 bg-white p-4 text-left transition-colors hover:bg-neutral-100'
      }
    >
      <span
        className={
          selected
            ? 'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-primary-700 text-white'
            : 'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border border-neutral-400 bg-white'
        }
      >
        {selected ? (
          <Check
            aria-hidden
            size={16}
            strokeWidth={3}
          />
        ) : null}
      </span>

      <span className="flex size-12 shrink-0 items-center justify-center rounded-input bg-error-bg text-primary-700">
        <Package
          aria-hidden
          size={24}
          strokeWidth={2}
        />
      </span>

      <span className="min-w-0 flex-1">
        <strong className="block truncate typography-title-3 text-neutral-900">
          {
            match.donationItemName
          }{' '}
          {
            match.quantity
          }
          {
            match.unit
          }
        </strong>

        <span className="mt-1 block truncate typography-body-2 text-neutral-700">
          {
            match.organizationName
          }
        </span>

        <span className="mt-1 block typography-label-2 text-neutral-600">
          {formatCompletedDate(
            match.completedAt,
          )}{' '}
          전달 완료
        </span>
      </span>
    </button>
  )
}

function completedTime(
  value:
    string | null,
) {
  if (
    !value
  ) {
    return 0
  }

  const time =
    Date.parse(
      value,
    )

  return Number.isNaN(
    time,
  )
    ? 0
    : time
}

function formatCompletedDate(
  value:
    string | null,
) {
  if (
    !value
  ) {
    return '-'
  }

  const date =
    new Date(
      value,
    )

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value
  }

  return formatKoreanDate(
    date,
  )
}

function formatKoreanDate(
  date:
    Date,
) {
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
    date,
  )
}

function formatFileDate(
  date:
    Date,
) {
  return new Intl.DateTimeFormat(
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
    .format(
      date,
    )
    .replace(
      /-/g,
      '',
    )
}