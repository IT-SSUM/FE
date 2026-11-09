import axiosInstance from '@/apis/axios'

import type {
  ApiFieldError,
  ApiResponse,
} from '@/types/api'

import type {
  CreateDonationItemRequest,
  DonationItemDetail,
  DonationItemListParams,
  DonationItemListResponse,
  PresignedDonationImage,
  UpdateDonationItemRequest,
} from '@/types/donationItem'

export class DonationItemApiError extends Error {
  readonly code: string
  readonly fieldErrors: ApiFieldError[]

  constructor(
    response: ApiResponse<unknown>,
  ) {
    super(
      response.message ||
        '기부 물품 요청을 처리하지 못했어요.',
    )

    this.name =
      'DonationItemApiError'

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
    throw new DonationItemApiError(
      response,
    )
  }

  return response.data
}

function itemPath(
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

  return `/api/donation-items/${donationItemId}`
}

export async function getDonationItem(
  donationItemId: number,
  signal?: AbortSignal,
): Promise<DonationItemDetail> {
  const response =
    await axiosInstance.get<
      ApiResponse<DonationItemDetail>
    >(
      itemPath(
        donationItemId,
      ),
      {
        signal,
      },
    )

  return unwrap(
    response.data,
  )
}

export async function updateDonationItem(
  donationItemId: number,
  body: UpdateDonationItemRequest,
): Promise<DonationItemDetail> {
  const {
    description,
    pickupAddress,
    pickupAddressDetail,
    imageKeys,
  } = body

  const response =
    await axiosInstance.patch<
      ApiResponse<DonationItemDetail>
    >(
      itemPath(
        donationItemId,
      ),
      {
        description,
        pickupAddress,
        pickupAddressDetail,
        imageKeys,
      },
    )

  return unwrap(
    response.data,
  )
}

export async function deleteDonationItem(
  donationItemId: number,
): Promise<void> {
  const response =
    await axiosInstance.delete<
      ApiResponse<
        string | null
      >
    >(
      itemPath(
        donationItemId,
      ),
    )

  unwrap(
    response.data,
  )
}

export async function createDonationItem(
  body: CreateDonationItemRequest,
): Promise<DonationItemDetail> {
  const response =
    await axiosInstance.post<
      ApiResponse<DonationItemDetail>
    >(
      '/api/donation-items',
      body,
    )

  return unwrap(
    response.data,
  )
}

export async function createDonationItemImagePresign(
  contentType: string,
): Promise<PresignedDonationImage> {
  const allowedContentTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ]

  if (
    !allowedContentTypes.includes(
      contentType,
    )
  ) {
    throw new Error(
      'JPG, PNG, WebP 형식의 사진만 등록할 수 있어요.',
    )
  }

  const response =
    await axiosInstance.post<
      ApiResponse<PresignedDonationImage>
    >(
      '/api/donation-items/images/presign',
      {
        contentType,
      },
    )

  return unwrap(
    response.data,
  )
}

export async function uploadDonationItemImages(
  images: string[],
) {
  return Promise.all(
    images.map(
      async (
        dataUrl,
      ) => {
        const image =
          await (
            await fetch(
              dataUrl,
            )
          ).blob()

        if (
          ![
            'image/jpeg',
            'image/png',
            'image/webp',
          ].includes(
            image.type,
          )
        ) {
          throw new Error(
            'JPG, PNG, WebP 형식의 사진만 등록할 수 있어요.',
          )
        }

        const presigned =
          await createDonationItemImagePresign(
            image.type,
          )

        const uploadResponse =
          await fetch(
            presigned.uploadUrl,
            {
              method: 'PUT',

              headers:
                presigned.requiredHeaders,

              body: image,
            },
          )

        if (
          !uploadResponse.ok
        ) {
          throw new Error(
            '기부 물품 사진을 업로드하지 못했어요. 다시 시도해 주세요.',
          )
        }

        return presigned.objectKey
      },
    ),
  )
}

export async function getDonationItems(
  params: DonationItemListParams = {},
): Promise<DonationItemListResponse> {
  const response =
    await axiosInstance.get<
      ApiResponse<DonationItemListResponse>
    >(
      '/api/donation-items',
      {
        params,
      },
    )

  return unwrap(
    response.data,
  )
}