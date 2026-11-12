import {
  type InfiniteData,
  useInfiniteQuery,
} from '@tanstack/react-query'

import {
  getNeededItems,
} from '@/apis/neededItem'

import type {
  NeededItemListParams,
  NeededItemListResponse,
} from '@/types/neededItem'

type NeededItemBrowseParams =
  Omit<
    NeededItemListParams,
    'beforeId' | 'size'
  >

type NeededItemInfiniteData =
  InfiniteData<
    NeededItemListResponse,
    number | null
  >

export const neededItemListKeys = {
  all: [
    'needed-items',
  ] as const,

  lists: () =>
    [
      ...neededItemListKeys.all,
      'list',
    ] as const,

  infinite: (
    params:
      NeededItemBrowseParams,
  ) =>
    [
      ...neededItemListKeys.lists(),
      'infinite',
      params,
    ] as const,
}

export function useInfiniteNeededItemsQuery(
  params:
    NeededItemBrowseParams = {},
) {
  return useInfiniteQuery<
    NeededItemListResponse,
    Error,
    NeededItemInfiniteData,
    ReturnType<
      typeof neededItemListKeys.infinite
    >,
    number | null
  >({
    queryKey:
      neededItemListKeys.infinite(
        params,
      ),

    queryFn: ({
      pageParam,
      signal,
    }) =>
      getNeededItems(
        {
          ...params,

          beforeId:
            pageParam ??
            undefined,

          size: 20,
        },
        signal,
      ),

    initialPageParam:
      null,

    getNextPageParam: (
      lastPage,
      _allPages,
      lastPageParam,
    ) => {
      if (
        !lastPage.hasNext ||
        lastPage.nextCursor ===
          null
      ) {
        return undefined
      }

      if (
        lastPage.nextCursor ===
        lastPageParam
      ) {
        return undefined
      }

      return lastPage.nextCursor
    },

    staleTime:
      1000 * 60,
  })
}