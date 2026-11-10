import {
  ClipboardList,
} from 'lucide-react'

import {
  useNavigate,
} from 'react-router-dom'

import { BottomNavigation } from '@/components/common/BottomNavigation/BottomNavigation'
import { Button } from '@/components/common/Button/Button'

import {
  DonorPage,
} from '@/features/donor/DonorPage'

import {
  ROUTES,
} from '@/routes/paths'

export function NeedListPage() {
  const navigate =
    useNavigate()

  return (
    <DonorPage
      title="필요 물품 탐색"
      back={
        ROUTES.donor.home
      }
      footer={
        <BottomNavigation
          activeItem="explore"
        />
      }
    >
      <section className="rounded-card border border-neutral-200 bg-white p-6 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary-100 text-primary-700">
          <ClipboardList
            aria-hidden
            size={30}
          />
        </span>

        <h2 className="mt-5 typography-title-2 text-neutral-900">
          필요 물품 목록을
          준비하고 있어요
        </h2>

        <p className="mt-2 typography-body-2 text-neutral-700">
          기관에서 보낸 실제
          요청과 매칭 정보는
          제안·요청 화면에서
          확인할 수 있어요.
        </p>

        <Button
          variant="secondary"
          className="mt-5 w-full"
          onClick={() =>
            navigate(
              ROUTES.donor
                .myRequests,
            )
          }
        >
          제안·요청 보기
        </Button>
      </section>
    </DonorPage>
  )
}