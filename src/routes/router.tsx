import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { ROUTES } from '@/routes/paths'
import { DonorLayout } from '@/layouts/DonorLayout'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { SharedLayout } from '@/layouts/SharedLayout'
import { DonorHomePage } from '@/pages/donor/DonorHomePage'
import { DonorMyPage } from '@/pages/donor/DonorMyPage'
import { DonationDetailPage as DonorDonationDetailPage } from '@/pages/donor/DonationDetailPage'
import { DonationRegisterPage } from '@/pages/donor/DonationRegisterPage'
import { NeedDetailPage as DonorNeedDetailPage } from '@/pages/donor/NeedDetailPage'
import { NeedListPage } from '@/pages/donor/NeedListPage'
import { RecommendationPage as DonorRecommendationPage } from '@/pages/donor/RecommendationPage'
import { DonationDetailPage as OrganizationDonationDetailPage } from '@/pages/organization/DonationDetailPage'
import { DonationListPage } from '@/pages/organization/DonationListPage'
import { NeedDetailPage as OrganizationNeedDetailPage } from '@/pages/organization/NeedDetailPage'
import { NeedRegisterPage } from '@/pages/organization/NeedRegisterPage'
import { OrganizationHomePage } from '@/pages/organization/OrganizationHomePage'
import { OrganizationMyPage } from '@/pages/organization/OrganizationMyPage'
import { RecommendationPage as OrganizationRecommendationPage } from '@/pages/organization/RecommendationPage'
import { ChatListPage } from '@/pages/shared/ChatListPage'
import { ChatRoomPage } from '@/pages/shared/ChatRoomPage'
import { HomePage } from '@/pages/shared/HomePage'
import { LoginPage } from '@/pages/login/LoginPage'
import { NotFoundPage } from '@/pages/shared/NotFoundPage'
import { NotificationPage } from '@/pages/shared/NotificationPage'
import { SignupPage } from '@/pages/onboarding/SignupPage'
import { TradeDetailPage } from '@/pages/shared/TradeDetailPage'

export const router = createBrowserRouter([
  {
    path: ROUTES.root,
    element: <Navigate to={ROUTES.start} replace />,
    errorElement: <NotFoundPage />,
  },
  { path: ROUTES.start, element: <HomePage /> },
  { path: ROUTES.login, element: <LoginPage /> },
  { path: ROUTES.signup, element: <SignupPage /> },
  { path: ROUTES.signupRole, element: <SignupPage /> },
  {
    element: <ProtectedRoute allowedRoles={['DONOR']} />,
    children: [
      {
        element: <DonorLayout />,
        children: [
          { path: ROUTES.donor.home, element: <DonorHomePage /> },
          { path: ROUTES.donor.donationNew, element: <DonationRegisterPage /> },
          { path: ROUTES.donor.donationDetail, element: <DonorDonationDetailPage /> },
          { path: ROUTES.donor.needList, element: <NeedListPage /> },
          { path: ROUTES.donor.needDetail, element: <DonorNeedDetailPage /> },
          { path: ROUTES.donor.recommendation, element: <DonorRecommendationPage /> },
          { path: ROUTES.donor.myPage, element: <DonorMyPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['ORGANIZATION']} />,
    children: [
      {
        element: <OrganizationLayout />,
        children: [
          { path: ROUTES.organization.home, element: <OrganizationHomePage /> },
          { path: ROUTES.organization.needNew, element: <NeedRegisterPage /> },
          { path: ROUTES.organization.needDetail, element: <OrganizationNeedDetailPage /> },
          { path: ROUTES.organization.donationList, element: <DonationListPage /> },
          { path: ROUTES.organization.donationDetail, element: <OrganizationDonationDetailPage /> },
          { path: ROUTES.organization.recommendation, element: <OrganizationRecommendationPage /> },
          { path: ROUTES.organization.myPage, element: <OrganizationMyPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <SharedLayout />,
        children: [
          { path: ROUTES.tradeDetail, element: <TradeDetailPage /> },
          { path: ROUTES.chatList, element: <ChatListPage /> },
          { path: ROUTES.chatRoom, element: <ChatRoomPage /> },
          { path: ROUTES.notifications, element: <NotificationPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
