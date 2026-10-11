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
    needList: '/donor/needs',
    needDetail: '/donor/needs/:needId',
    recommendation: '/donor/recommendations/:donationId',
    myPage: '/donor/mypage',
  },
  organization: {
    home: '/organization/home',
    needNew: '/organization/needs/new',
    needDetail: '/organization/needs/:needId',
    donationList: '/organization/donations',
    donationDetail: '/organization/donations/:donationId',
    recommendation: '/organization/recommendations/:needId',
    myPage: '/organization/mypage',
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
  donorNeedDetail: (needId: string) => `/donor/needs/${needId}`,
  donorRecommendation: (donationId: string) =>
    `/donor/recommendations/${donationId}`,
  organizationNeedDetail: (needId: string) => `/organization/needs/${needId}`,
  organizationDonationDetail: (donationId: string) =>
    `/organization/donations/${donationId}`,
  organizationRecommendation: (needId: string) =>
    `/organization/recommendations/${needId}`,
  tradeDetail: (tradeId: string) => `/trades/${tradeId}`,
  chatRoom: (chatRoomId: string) => `/chats/${chatRoomId}`,
} as const
