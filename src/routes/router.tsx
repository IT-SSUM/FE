import {
  createBrowserRouter,
} from 'react-router-dom'

import {
  ProtectedRoute,
} from '@/routes/ProtectedRoute'

import {
  ROUTES,
} from '@/routes/paths'

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
  DonorHomePage,
} from '@/pages/donor/DonorHomePage'

import {
  DonorDonationEditPage,
} from '@/pages/donor/DonorDonationEditPage'

import {
  DonorDonationHistoryPage,
} from '@/pages/donor/DonorDonationHistoryPage'

import {
  DonorDonationManagePage,
} from '@/pages/donor/DonorDonationManagePage'

import {
  DonorMyPage,
} from '@/pages/donor/DonorMyPage'

import {
  DonorProfileEditPage,
} from '@/pages/donor/DonorProfileEditPage'

import {
  DonorRequestDetailPage,
} from '@/pages/donor/DonorRequestDetailPage'

import {
  DonorRequestListPage,
} from '@/pages/donor/DonorRequestListPage'

import {
  DonationDetailPage as DonorDonationDetailPage,
} from '@/pages/donor/DonationDetailPage'

import {
  DonationRegisterPage,
} from '@/pages/donor/DonationRegisterPage'

import {
  DonationProposalCompletePage,
  DonationProposalPage,
} from '@/pages/donor/DonationProposalPage'

import {
  NeedDetailPage as DonorNeedDetailPage,
} from '@/pages/donor/NeedDetailPage'

import {
  NeedFilterPage,
} from '@/pages/donor/NeedFilterPage'

import {
  NeedListPage,
} from '@/pages/donor/NeedListPage'

import {
  RecommendationPage as DonorRecommendationPage,
} from '@/pages/donor/RecommendationPage'

import {
  DonationDetailPage as OrganizationDonationDetailPage,
} from '@/pages/organization/DonationDetailPage'

import {
  DonationListPage,
} from '@/pages/organization/DonationListPage'

import {
  NeedDetailPage as OrganizationNeedDetailPage,
} from '@/pages/organization/NeedDetailPage'

import {
  NeedEditPage,
} from '@/pages/organization/NeedEditPage'

import {
  NeedManagePage,
} from '@/pages/organization/NeedManagePage'

import {
  NeedRegisterPage,
} from '@/pages/organization/NeedRegisterPage'

import {
  OrganizationHomePage,
} from '@/pages/organization/OrganizationHomePage'

import {
  OrganizationNotificationPage,
} from '@/pages/organization/OrganizationNotificationPage'

import {
  OrganizationMyPage,
} from '@/pages/organization/OrganizationMyPage'

import {
  OrganizationProfileEditPage,
} from '@/pages/organization/OrganizationProfileEditPage'

import {
  OfferDetailPage,
} from '@/pages/organization/OfferDetailPage'

import {
  OfferListPage,
} from '@/pages/organization/OfferListPage'

import {
  OrganizationTradeStatusPage,
} from '@/pages/organization/OrganizationTradeStatusPage'

import {
  IndividualTradeStatusPage,
} from '@/pages/organization/IndividualTradeStatusPage'

import {
  OrganizationActiveTradeDetailPage,
} from '@/pages/organization/OrganizationActiveTradeDetailPage'

import {
  TradeQuantityEditPage as OrganizationTradeQuantityEditPage,
} from '@/pages/organization/TradeQuantityEditPage'

import {
  TradeAppointmentPage as OrganizationTradeAppointmentPage,
} from '@/pages/organization/TradeAppointmentPage'

import {
  DonationRequestCompletePage,
  DonationRequestPage,
} from '@/pages/organization/DonationRequestPage'

import {
  RecommendationPage as OrganizationRecommendationPage,
} from '@/pages/organization/RecommendationPage'

import {
  ChatListPage,
} from '@/pages/shared/ChatListPage'

import {
  ChatRoomPage,
} from '@/pages/shared/ChatRoomPage'

import {
  HomePage,
} from '@/pages/shared/HomePage'

import {
  NotFoundPage,
} from '@/pages/shared/NotFoundPage'

import {
  NotificationPage,
} from '@/pages/shared/NotificationPage'

import {
  TradeAppointmentPage,
} from '@/pages/shared/TradeAppointmentPage'

import {
  TradeDetailPage,
} from '@/pages/shared/TradeDetailPage'

import {
  TradeQuantityEditPage,
} from '@/pages/shared/TradeQuantityEditPage'

import {
  LoginPage,
} from '@/pages/login/LoginPage'

import {
  SignupPage,
} from '@/pages/onboarding/SignupPage'

export const router =
  createBrowserRouter([
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
          element:
            <DonorLayout />,

          children: [
            {
              path:
                ROUTES.donor.home,

              element:
                <DonorHomePage />,
            },

            {
              path:
                ROUTES.donor.donationNew,

              element:
                <DonationRegisterPage />,
            },

            {
              path:
                ROUTES.donor.donationDetail,

              element:
                <DonorDonationDetailPage />,
            },

            {
              path:
                ROUTES.donor.donationEdit,

              element:
                <DonorDonationEditPage />,
            },

            {
              path:
                ROUTES.donor.needList,

              element:
                <NeedListPage />,
            },

            {
              path:
                ROUTES.donor.needFilter,

              element:
                <NeedFilterPage />,
            },

            {
              path:
                ROUTES.donor.needDetail,

              element:
                <DonorNeedDetailPage />,
            },

            {
              path:
                ROUTES.donor.donationProposal,

              element:
                <DonationProposalPage />,
            },

            {
              path:
                ROUTES.donor.donationProposalComplete,

              element:
                <DonationProposalCompletePage />,
            },

            {
              path:
                ROUTES.donor.recommendation,

              element:
                <DonorRecommendationPage />,
            },

            {
              path:
                ROUTES.donor.recommendedOrganization,

              element:
                <DonorRecommendationPage />,
            },

            {
              path:
                ROUTES.donor.myPage,

              element:
                <DonorMyPage />,
            },

            {
              path:
                ROUTES.donor.myItems,

              element:
                <DonorDonationManagePage />,
            },

            {
              path:
                ROUTES.donor.myRequests,

              element:
                <DonorRequestListPage />,
            },

            {
              path:
                ROUTES.donor.myHistory,

              element:
                <DonorDonationHistoryPage />,
            },

            {
              path:
                ROUTES.donor.myProfile,

              element:
                <DonorProfileEditPage />,
            },

            {
              path:
                ROUTES.donor.requestDetail,

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
                ROUTES.organization.home,

              element:
                <OrganizationHomePage />,
            },

            {
              path:
                ROUTES.organization.notifications,

              element:
                <OrganizationNotificationPage />,
            },

            {
              path:
                ROUTES.organization.needManage,

              element:
                <NeedManagePage />,
            },

            {
              path:
                ROUTES.organization.needNew,

              element:
                <NeedRegisterPage />,
            },

            {
              path:
                ROUTES.organization.needEdit,

              element:
                <NeedEditPage />,
            },

            {
              path:
                ROUTES.organization.needDetail,

              element:
                <OrganizationNeedDetailPage />,
            },

            {
              path:
                ROUTES.organization.donationList,

              element:
                <DonationListPage />,
            },

            {
              path:
                ROUTES.organization.donationDetail,

              element:
                <OrganizationDonationDetailPage />,
            },

            {
              path:
                ROUTES.organization.donationRequest,

              element:
                <DonationRequestPage />,
            },

            {
              path:
                ROUTES.organization.donationRequestComplete,

              element:
                <DonationRequestCompletePage />,
            },

            {
              path:
                ROUTES.organization.recommendation,

              element:
                <OrganizationRecommendationPage />,
            },

            {
              path:
                ROUTES.organization.myPage,

              element:
                <OrganizationMyPage />,
            },

            {
              path:
                ROUTES.organization.myProfile,

              element:
                <OrganizationProfileEditPage />,
            },

            {
              path:
                ROUTES.organization.offerList,

              element:
                <OfferListPage />,
            },

            {
              path:
                ROUTES.organization.offerDetail,

              element:
                <OfferDetailPage />,
            },

            {
              path:
                ROUTES.organization.tradeStatus,

              element:
                <OrganizationTradeStatusPage />,
            },

            {
              path:
                ROUTES.organization.individualTradeStatus,

              element:
                <IndividualTradeStatusPage />,
            },

            {
              path:
                ROUTES.organization.activeTradeDetail,

              element:
                <OrganizationActiveTradeDetailPage />,
            },

            {
              path:
                ROUTES.organization.tradeQuantityEdit,

              element:
                <OrganizationTradeQuantityEditPage />,
            },

            {
              path:
                ROUTES.organization.tradeAppointment,

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
  ])
