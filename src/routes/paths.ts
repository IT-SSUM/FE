export const ROUTES = {
  root: '/',
  start: '/start',
  login: '/login',
  signup: '/signup',
  signupRole: '/signup/:role',
  donor: {
    home: '/donor/home',
    donationNew: '/donor/donations/new',
    donationDetail: '/donor/donations/:donationId',
    donationEdit: '/donor/donations/:donationId/edit',
    needList: '/donor/needs',
    needDetail: '/donor/needs/:needId',
    recommendation: '/donor/recommendations/:donationId',
    recommendedOrganization: '/donor/recommendations/:donationId/organizations/:organizationId',
    myPage: '/donor/mypage',
    myItems: '/donor/mypage/items',
    myRequests: '/donor/mypage/requests',
    myHistory: '/donor/mypage/history',
    myProfile: '/donor/mypage/profile',
    requestDetail: '/donor/requests/:requestId',
  },
  organization: {
    home: '/organization/home',
    notifications: '/organization/notifications',
    needManage: '/organization/mypage/needs',
    needNew: '/organization/needs/new',
    needDetail: '/organization/needs/:needId',
    needEdit: '/organization/needs/:needId/edit',
    donationList: '/organization/donations',
    donationDetail: '/organization/donations/:donationId',
    donationRequest: '/organization/donations/:donationId/request',
    donationRequestComplete: '/organization/donations/:donationId/request/complete',
    recommendation: '/organization/recommendations/:needId',
    myPage: '/organization/mypage',
    myProfile: '/organization/mypage/profile',
    offerList: '/organization/mypage/offers',
    offerDetail: '/organization/offers/:offerId',
    tradeStatus: '/organization/mypage/trades',
    individualTradeStatus: '/organization/mypage/trades/:needId',
    activeTradeDetail: '/organization/trades/:tradeId',
    tradeQuantityEdit: '/organization/trades/:tradeId/quantity',
    tradeAppointment: '/organization/trades/:tradeId/appointment',
  },
  tradeDetail: '/trades/:tradeId',
  chatList: '/chats',
  chatRoom: '/chats/:chatRoomId',
  notifications: '/notifications',
} as const

export const routePath = {
  signup: (role: 'donor' | 'organization') => `/signup/${role}`,
  donorDonationDetail: (donationId: string) =>
    `/donor/donations/${donationId}`,
  donorDonationEdit: (donationId: string) =>
    `/donor/donations/${donationId}/edit`,
  donorNeedDetail: (needId: string) => `/donor/needs/${needId}`,
  donorRecommendation: (donationId: string) =>
    `/donor/recommendations/${donationId}`,
  donorRequestDetail: (requestId: string) => `/donor/requests/${requestId}`,
  donorRecommendedOrganization: (donationId: string, organizationId: string) =>
    `/donor/recommendations/${encodeURIComponent(donationId)}/organizations/${encodeURIComponent(organizationId)}`,
  organizationNeedDetail: (needId: string) => `/organization/needs/${needId}`,
  organizationNeedEdit: (needId: string) => `/organization/needs/${needId}/edit`,
  organizationDonationDetail: (donationId: string) =>
    `/organization/donations/${donationId}`,
  organizationDonationRequest: (donationId: string) =>
    `/organization/donations/${donationId}/request`,
  organizationDonationRequestComplete: (donationId: string) =>
    `/organization/donations/${donationId}/request/complete`,
  organizationRecommendation: (needId: string) =>
    `/organization/recommendations/${needId}`,
  organizationOfferDetail: (offerId: string) =>
    `/organization/offers/${offerId}`,
  organizationIndividualTradeStatus: (needId: string) =>
    `/organization/mypage/trades/${needId}`,
  organizationActiveTradeDetail: (tradeId: string) =>
    `/organization/trades/${tradeId}`,
  organizationTradeQuantityEdit: (tradeId: string) =>
    `/organization/trades/${tradeId}/quantity`,
  organizationTradeAppointment: (tradeId: string) =>
    `/organization/trades/${tradeId}/appointment`,
  tradeDetail: (tradeId: string) => `/trades/${tradeId}`,
  chatRoom: (chatRoomId: string) => `/chats/${chatRoomId}`,
} as const
