import {
  lazy,
  type ComponentType,
} from 'react'

import {
  createBrowserRouter,
  Outlet,
} from 'react-router-dom'

import {
  DonorLayout,
} from '@/layouts/DonorLayout'

import {
  OrganizationLayout,
} from '@/layouts/OrganizationLayout'

import {
  SharedLayout,
} from '@/layouts/SharedLayout'

import {
  HomePage,
} from '@/pages/shared/HomePage'

import {
  NotFoundPage,
} from '@/pages/shared/NotFoundPage'

import {
  ProtectedRoute,
} from '@/routes/ProtectedRoute'

import {
  ROUTES,
} from '@/routes/paths'

function lazyNamed<
  TModule extends Record<string, unknown>,
  TKey extends keyof TModule,
>(
  loader: () => Promise<TModule>,
  key: TKey,
) {
  return lazy(async () => {
    const module =
      await loader()

    return {
      default:
        module[key] as unknown as ComponentType,
    }
  })
}

const LoginPage = lazyNamed(
  () =>
    import('@/pages/login/LoginPage'),
  'LoginPage',
)

const SignupPage = lazyNamed(
  () =>
    import('@/pages/onboarding/SignupPage'),
  'SignupPage',
)

const DonationStatementPage = lazyNamed(
  () =>
    import('@/pages/donor/DonationStatementPage'),
  'DonationStatementPage',
)

const DonorHomePage = lazyNamed(
  () =>
    import('@/pages/donor/DonorHomePage'),
  'DonorHomePage',
)

const DonationRegisterPage = lazyNamed(
  () =>
    import('@/pages/donor/DonationRegisterPage'),
  'DonationRegisterPage',
)

const DonorDonationDetailPage = lazyNamed(
  () =>
    import('@/pages/donor/DonationDetailPage'),
  'DonationDetailPage',
)

const DonorDonationEditPage = lazyNamed(
  () =>
    import('@/pages/donor/DonorDonationEditPage'),
  'DonorDonationEditPage',
)

const DonorNeedListPage = lazyNamed(
  () =>
    import('@/pages/donor/NeedListPage'),
  'NeedListPage',
)

const DonorNeedFilterPage = lazyNamed(
  () =>
    import('@/pages/donor/NeedFilterPage'),
  'NeedFilterPage',
)

const DonorNeedDetailPage = lazyNamed(
  () =>
    import('@/pages/donor/NeedDetailPage'),
  'NeedDetailPage',
)

const DonationProposalPage = lazyNamed(
  () =>
    import('@/pages/donor/DonationProposalPage'),
  'DonationProposalPage',
)

const DonationProposalCompletePage = lazyNamed(
  () =>
    import('@/pages/donor/DonationProposalPage'),
  'DonationProposalCompletePage',
)

const DonorRecommendationPage = lazyNamed(
  () =>
    import('@/pages/donor/RecommendationPage'),
  'RecommendationPage',
)

const DonorMyPage = lazyNamed(
  () =>
    import('@/pages/donor/DonorMyPage'),
  'DonorMyPage',
)

const DonorDonationManagePage = lazyNamed(
  () =>
    import('@/pages/donor/DonorDonationManagePage'),
  'DonorDonationManagePage',
)

const DonorRequestListPage = lazyNamed(
  () =>
    import('@/pages/donor/DonorRequestListPage'),
  'DonorRequestListPage',
)

const DonorDonationHistoryPage = lazyNamed(
  () =>
    import('@/pages/donor/DonorDonationHistoryPage'),
  'DonorDonationHistoryPage',
)

const DonorProfileEditPage = lazyNamed(
  () =>
    import('@/pages/donor/DonorProfileEditPage'),
  'DonorProfileEditPage',
)

const DonorRequestDetailPage = lazyNamed(
  () =>
    import('@/pages/donor/DonorRequestDetailPage'),
  'DonorRequestDetailPage',
)

const OrganizationHomePage = lazyNamed(
  () =>
    import('@/pages/organization/OrganizationHomePage'),
  'OrganizationHomePage',
)

const OrganizationNotificationPage = lazyNamed(
  () =>
    import('@/pages/organization/OrganizationNotificationPage'),
  'OrganizationNotificationPage',
)

const OrganizationNeedManagePage = lazyNamed(
  () =>
    import('@/pages/organization/NeedManagePage'),
  'NeedManagePage',
)

const OrganizationNeedRegisterPage = lazyNamed(
  () =>
    import('@/pages/organization/NeedRegisterPage'),
  'NeedRegisterPage',
)

const OrganizationNeedEditPage = lazyNamed(
  () =>
    import('@/pages/organization/NeedEditPage'),
  'NeedEditPage',
)

const OrganizationNeedDetailPage = lazyNamed(
  () =>
    import('@/pages/organization/NeedDetailPage'),
  'NeedDetailPage',
)

const OrganizationDonationListPage = lazyNamed(
  () =>
    import('@/pages/organization/DonationListPage'),
  'DonationListPage',
)

const OrganizationDonationDetailPage = lazyNamed(
  () =>
    import('@/pages/organization/DonationDetailPage'),
  'DonationDetailPage',
)

const DonationRequestPage = lazyNamed(
  () =>
    import('@/pages/organization/DonationRequestPage'),
  'DonationRequestPage',
)

const DonationRequestCompletePage = lazyNamed(
  () =>
    import('@/pages/organization/DonationRequestPage'),
  'DonationRequestCompletePage',
)

const OrganizationRecommendationPage = lazyNamed(
  () =>
    import('@/pages/organization/RecommendationPage'),
  'RecommendationPage',
)

const OrganizationMyPage = lazyNamed(
  () =>
    import('@/pages/organization/OrganizationMyPage'),
  'OrganizationMyPage',
)

const OrganizationProfileEditPage = lazyNamed(
  () =>
    import('@/pages/organization/OrganizationProfileEditPage'),
  'OrganizationProfileEditPage',
)

const OrganizationOfferListPage = lazyNamed(
  () =>
    import('@/pages/organization/OfferListPage'),
  'OfferListPage',
)

const OrganizationOfferDetailPage = lazyNamed(
  () =>
    import('@/pages/organization/OfferDetailPage'),
  'OfferDetailPage',
)

const OrganizationTradeStatusPage = lazyNamed(
  () =>
    import('@/pages/organization/OrganizationTradeStatusPage'),
  'OrganizationTradeStatusPage',
)

const IndividualTradeStatusPage = lazyNamed(
  () =>
    import('@/pages/organization/IndividualTradeStatusPage'),
  'IndividualTradeStatusPage',
)

const OrganizationActiveTradeDetailPage = lazyNamed(
  () =>
    import('@/pages/organization/OrganizationActiveTradeDetailPage'),
  'OrganizationActiveTradeDetailPage',
)

const OrganizationTradeQuantityEditPage = lazyNamed(
  () =>
    import('@/pages/organization/TradeQuantityEditPage'),
  'TradeQuantityEditPage',
)

const OrganizationTradeAppointmentPage = lazyNamed(
  () =>
    import('@/pages/organization/TradeAppointmentPage'),
  'TradeAppointmentPage',
)

const TradeDetailPage = lazyNamed(
  () =>
    import('@/pages/shared/TradeDetailPage'),
  'TradeDetailPage',
)

const TradeQuantityEditPage = lazyNamed(
  () =>
    import('@/pages/shared/TradeQuantityEditPage'),
  'TradeQuantityEditPage',
)

const TradeAppointmentPage = lazyNamed(
  () =>
    import('@/pages/shared/TradeAppointmentPage'),
  'TradeAppointmentPage',
)

const ChatListPage = lazyNamed(
  () =>
    import('@/pages/shared/ChatListPage'),
  'ChatListPage',
)

const ChatRoomPage = lazyNamed(
  () =>
    import('@/pages/shared/ChatRoomPage'),
  'ChatRoomPage',
)

const NotificationPage = lazyNamed(
  () =>
    import('@/pages/shared/NotificationPage'),
  'NotificationPage',
)

export const router =
  createBrowserRouter([
    {
      element:
        <Outlet />,

      errorElement:
        <RouteErrorFallback />,

      children: [
        {
          path:
            ROUTES.root,

          element:
            <HomePage />,

          errorElement:
            <NotFoundPage />,
        },

        {
          path:
            ROUTES.start,

          element:
            <HomePage />,
        },

        {
          path:
            ROUTES.login,

          element:
            <LoginPage />,
        },

        {
          path:
            ROUTES.signup,

          element:
            <SignupPage />,
        },

        {
          path:
            ROUTES.signupRole,

          element:
            <SignupPage />,
        },

        {
          element:
            <ProtectedRoute />,

          children: [
            {
              path:
                ROUTES.donor
                  .donationStatement,

              element:
                <DonationStatementPage />,
            },

            {
              element:
                <DonorLayout />,

              children: [
                {
                  path:
                    ROUTES.donor
                      .home,

                  element:
                    <DonorHomePage />,
                },

                {
                  path:
                    ROUTES.donor
                      .donationNew,

                  element:
                    <DonationRegisterPage />,
                },

                {
                  path:
                    ROUTES.donor
                      .donationDetail,

                  element:
                    <DonorDonationDetailPage />,
                },

                {
                  path:
                    ROUTES.donor
                      .donationEdit,

                  element:
                    <DonorDonationEditPage />,
                },

                {
                  path:
                    ROUTES.donor
                      .needList,

                  element:
                    <DonorNeedListPage />,
                },

                {
                  path:
                    ROUTES.donor
                      .needFilter,

                  element:
                    <DonorNeedFilterPage />,
                },

                {
                  path:
                    ROUTES.donor
                      .needDetail,

                  element:
                    <DonorNeedDetailPage />,
                },

                {
                  path:
                    ROUTES.donor
                      .donationProposal,

                  element:
                    <DonationProposalPage />,
                },

                {
                  path:
                    ROUTES.donor
                      .donationProposalComplete,

                  element:
                    <DonationProposalCompletePage />,
                },

                {
                  path:
                    ROUTES.donor
                      .recommendation,

                  element:
                    <DonorRecommendationPage />,
                },

                {
                  path:
                    ROUTES.donor
                      .recommendedOrganization,

                  element:
                    <DonorRecommendationPage />,
                },

                {
                  path:
                    ROUTES.donor
                      .myPage,

                  element:
                    <DonorMyPage />,
                },

                {
                  path:
                    ROUTES.donor
                      .myItems,

                  element:
                    <DonorDonationManagePage />,
                },

                {
                  path:
                    ROUTES.donor
                      .myRequests,

                  element:
                    <DonorRequestListPage />,
                },

                {
                  path:
                    ROUTES.donor
                      .myHistory,

                  element:
                    <DonorDonationHistoryPage />,
                },

                {
                  path:
                    ROUTES.donor
                      .myProfile,

                  element:
                    <DonorProfileEditPage />,
                },

                {
                  path:
                    ROUTES.donor
                      .requestDetail,

                  element:
                    <DonorRequestDetailPage />,
                },
              ],
            },
          ],
        },

        {
          element:
            <ProtectedRoute />,

          children: [
            {
              element:
                <OrganizationLayout />,

              children: [
                {
                  path:
                    ROUTES.organization
                      .home,

                  element:
                    <OrganizationHomePage />,
                },

                {
                  path:
                    ROUTES.organization
                      .notifications,

                  element:
                    <OrganizationNotificationPage />,
                },

                {
                  path:
                    ROUTES.organization
                      .needManage,

                  element:
                    <OrganizationNeedManagePage />,
                },

                {
                  path:
                    ROUTES.organization
                      .needNew,

                  element:
                    <OrganizationNeedRegisterPage />,
                },

                {
                  path:
                    ROUTES.organization
                      .needEdit,

                  element:
                    <OrganizationNeedEditPage />,
                },

                {
                  path:
                    ROUTES.organization
                      .needDetail,

                  element:
                    <OrganizationNeedDetailPage />,
                },

                {
                  path:
                    ROUTES.organization
                      .donationList,

                  element:
                    <OrganizationDonationListPage />,
                },

                {
                  path:
                    ROUTES.organization
                      .donationDetail,

                  element:
                    <OrganizationDonationDetailPage />,
                },

                {
                  path:
                    ROUTES.organization
                      .donationRequest,

                  element:
                    <DonationRequestPage />,
                },

                {
                  path:
                    ROUTES.organization
                      .donationRequestComplete,

                  element:
                    <DonationRequestCompletePage />,
                },

                {
                  path:
                    ROUTES.organization
                      .recommendation,

                  element:
                    <OrganizationRecommendationPage />,
                },

                {
                  path:
                    ROUTES.organization
                      .myPage,

                  element:
                    <OrganizationMyPage />,
                },

                {
                  path:
                    ROUTES.organization
                      .myProfile,

                  element:
                    <OrganizationProfileEditPage />,
                },

                {
                  path:
                    ROUTES.organization
                      .offerList,

                  element:
                    <OrganizationOfferListPage />,
                },

                {
                  path:
                    ROUTES.organization
                      .offerDetail,

                  element:
                    <OrganizationOfferDetailPage />,
                },

                {
                  path:
                    ROUTES.organization
                      .tradeStatus,

                  element:
                    <OrganizationTradeStatusPage />,
                },

                {
                  path:
                    ROUTES.organization
                      .individualTradeStatus,

                  element:
                    <IndividualTradeStatusPage />,
                },

                {
                  path:
                    ROUTES.organization
                      .activeTradeDetail,

                  element:
                    <OrganizationActiveTradeDetailPage />,
                },

                {
                  path:
                    ROUTES.organization
                      .tradeQuantityEdit,

                  element:
                    <OrganizationTradeQuantityEditPage />,
                },

                {
                  path:
                    ROUTES.organization
                      .tradeAppointment,

                  element:
                    <OrganizationTradeAppointmentPage />,
                },
              ],
            },
          ],
        },

        {
          element:
            <ProtectedRoute />,

          children: [
            {
              element:
                <SharedLayout />,

              children: [
                {
                  path:
                    ROUTES.tradeDetail,

                  element:
                    <TradeDetailPage />,
                },

                {
                  path:
                    ROUTES.tradeQuantityEdit,

                  element:
                    <TradeQuantityEditPage />,
                },

                {
                  path:
                    ROUTES.tradeAppointment,

                  element:
                    <TradeAppointmentPage />,
                },

                {
                  path:
                    ROUTES.chatList,

                  element:
                    <ChatListPage />,
                },

                {
                  path:
                    ROUTES.chatRoom,

                  element:
                    <ChatRoomPage />,
                },

                {
                  path:
                    ROUTES.notifications,

                  element:
                    <NotificationPage />,
                },
              ],
            },
          ],
        },

        {
          path:
            '*',

          element:
            <NotFoundPage />,
        },
      ],
    },
  ])

function RouteErrorFallback() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface-canvas px-5">
      <section className="w-full max-w-[393px] rounded-card border border-neutral-200 bg-white p-6 text-center">
        <h1 className="typography-title-2 text-neutral-900">
          화면을 불러오지 못했어요.
        </h1>

        <p className="mt-2 typography-body-2 text-neutral-700">
          네트워크 상태를 확인한 뒤 다시
          시도해 주세요.
        </p>

        <button
          type="button"
          className="mt-5 h-12 w-full rounded-input bg-primary-700 px-4 typography-label-1 text-white"
          onClick={() =>
            window.location.reload()
          }
        >
          다시 불러오기
        </button>
      </section>
    </main>
  )
}