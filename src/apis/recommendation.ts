import { isAxiosError } from 'axios'

import axiosInstance from '@/apis/axios'

import type {
  ApiFieldError,
  ApiResponse,
} from '@/types/api'

import type {
  DonationRecommendation,
} from '@/types/recommendation'

export class RecommendationApiError extends Error {
  readonly code: string
  readonly fieldErrors: ApiFieldError[]

  constructor(
    response: ApiResponse<unknown>,
  ) {
    super(
      response.message ||
        '추천 기관 요청을 처리하지 못했어요.',
    )

    this.name =
      'RecommendationApiError'

    this.code =
      response.code

    this.fieldErrors =
      response.fieldErrors ?? []
  }
}

function unwrap<T>(
  response: ApiResponse<T>,
): T {
  if (!response.success) {
    throw new RecommendationApiError(
      response,
    )
  }

  return response.data
}

function recommendationPath(
  donationItemId: number,
) {
  if (
    !Number.isSafeInteger(
      donationItemId,
    ) ||
    donationItemId <= 0
  ) {
    throw new Error(
      '올바른 기부 물품 번호가 필요합니다.',
    )
  }

  return `/api/donation-items/${donationItemId}/recommendations`
}

export async function getDonationRecommendations(
  donationItemId: number,
  signal?: AbortSignal,
): Promise<
  DonationRecommendation[]
> {
  const response =
    await axiosInstance.get<
      ApiResponse<
        DonationRecommendation[]
      >
    >(
      recommendationPath(
        donationItemId,
      ),
      {
        signal,
      },
    )

  return unwrap(response.data)
}

export async function recalculateDonationRecommendations(
  donationItemId: number,
): Promise<
  DonationRecommendation[]
> {
  const response =
    await axiosInstance.post<
      ApiResponse<
        DonationRecommendation[]
      >
    >(
      recommendationPath(
        donationItemId,
      ),
    )

  return unwrap(response.data)
}

export function getRecommendationErrorMessage(
  error: unknown,
) {
  const response =
    isAxiosError<
      ApiResponse<unknown>
    >(error)
      ? error.response
      : undefined

  const body =
    error instanceof
    RecommendationApiError
      ? error
      : response?.data

  const status =
    response?.status

  const code =
    body?.code ?? ''

  if (status === 401) {
    return '로그인이 필요하거나 인증이 만료됐어요.'
  }

  if (
    status === 403 ||
    code === 'COMMON_403'
  ) {
    return '기부자 계정에서만 기관 추천을 이용할 수 있어요.'
  }

  if (
    code ===
    'RECOMMENDATION_403'
  ) {
    return '본인이 등록한 기부 물품의 추천만 확인할 수 있어요.'
  }

  if (
    status === 404 ||
    code === 'ITEM_404'
  ) {
    return '삭제되었거나 존재하지 않는 기부 물품이에요.'
  }

  if (
    body?.message
  ) {
    return body.message
  }

  return '추천 기관 정보를 불러오지 못했어요. 다시 시도해 주세요.'
}