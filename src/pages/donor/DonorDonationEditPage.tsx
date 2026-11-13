import { useParams } from 'react-router-dom'

import { Button } from '@/components/common/Button/Button'
import {
  DonorPage,
  EmptyState,
} from '@/features/donor/DonorPage'
import {
  DonationItemEditForm,
} from '@/features/donor/DonationItemEditForm'
import {
  getDonationItemFailure,
  parseDonationItemId,
} from '@/features/donor/donationItemApiState'
import { useDonationItemQuery } from '@/hooks/queries/useDonationItemQuery'
import { ROUTES, routePath } from '@/routes/paths'

export function DonorDonationEditPage() {
  const { donationId } = useParams()
  const id = parseDonationItemId(donationId)
  const query = useDonationItemQuery(id)

  const back =
    id === null
      ? ROUTES.donor.myItems
      : routePath.donorDonationDetail(
          String(id),
        )

  const frame = {
    title: '물품 수정',
    back,
    mode: 'server' as const,
  }

  if (id === null) {
    return (
      <DonorPage {...frame}>
        <EmptyState
          title="올바른 서버 물품 번호가 필요해요"
          to={back}
          label="내 물품 보기"
        />
      </DonorPage>
    )
  }

  if (query.isError) {
    return (
      <DonorPage {...frame}>
        <p role="alert" className="text-error">
          {getDonationItemFailure(query.error).message}
        </p>

        <Button
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          다시 시도
        </Button>
      </DonorPage>
    )
  }

  if (query.isPending) {
    return (
      <DonorPage {...frame}>
        <p role="status">
          {query.isPaused
            ? '네트워크 연결을 기다리고 있어요.'
            : '물품 정보를 불러오고 있어요.'}
        </p>
      </DonorPage>
    )
  }

  if (!query.data) {
    return (
      <DonorPage {...frame}>
        <EmptyState
          title="물품 정보를 찾을 수 없어요"
          to={back}
          label="돌아가기"
        />
      </DonorPage>
    )
  }

  if (!query.data.mine) {
    return (
      <DonorPage {...frame}>
        <EmptyState
          title="등록한 기부자만 수정할 수 있어요"
          to={back}
          label="물품 상세 보기"
        />
      </DonorPage>
    )
  }

  return (
    <DonationItemEditForm
      key={id}
      item={query.data}
    />
  )
}