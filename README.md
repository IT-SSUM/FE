
# ♻️ ISSUM

> **남는 물품이 필요한 곳에 닿을 수 있도록.**
>
> 개인의 사용 가능한 잉여 물품과 해당 물품이 필요한 복지기관을 연결하는
> **지역사회 자원순환 · 기부 매칭 플랫폼**

ISSUM(이씀)은 개인에게 남는 사용 가능한 물품이 단순히 버려지지 않고,
실제로 해당 물품을 필요로 하는 복지기관에 전달될 수 있도록 연결합니다.

기부자는 보유한 물품을 등록하고 기관의 수요를 확인할 수 있으며,
기관은 필요한 물품을 등록하거나 기부자가 등록한 물품을 확인하여 요청할 수 있습니다.

매칭 이후에는 요청·제안, 거래 상태 관리, 실시간 채팅, 전달 일정 조율,
기부 완료 내역 및 확인서 발급까지 **기부의 전체 과정을 하나의 서비스 안에서 관리**할 수 있습니다.

---

## 🌱 Core Features

### 👤 기부자

- 기부자 회원가입 및 프로필 관리
- 기부 물품 등록 / 조회 / 수정 / 삭제
- 물품 이미지 업로드
- 기관 필요 물품 탐색 및 검색·필터
- 등록 물품 기반 추천 기관 조회 및 재추천
- 기관에 기부 제안
- 기관으로부터 받은 요청 확인
- 진행 중 거래 및 완료된 기부 내역 관리
- 전달 완료 기부 내역서 발급
- 기부 확인서 발급 및 브라우저 PDF 출력
- 카카오톡 인앱 브라우저 환경 안내

### 🏢 기관

- 기관 계정 가입 및 사업자정보 확인
- 기관 프로필 및 계정 관리
- 필요 물품 등록 / 조회 / 수정 / 삭제 / 모집 종료
- 기부자가 등록한 물품 탐색
- 검색어·카테고리·지역·상태 기반 필터링
- 기부자에게 물품 요청
- 받은 제안 / 보낸 요청 관리
- 거래 수량 변경
- 거래 예약 및 전달 일정 관리
- 수령 완료 및 거래 상태 관리

### 🤝 공통

- 기부자 ↔ 기관 양방향 요청 및 제안
- 물품·기관 조건을 기반으로 한 추천
- 거래 수량 및 상태 관리
- 전달 약속 날짜·시간·장소 관리
- STOMP WebSocket 기반 실시간 채팅
- 이전 채팅 내역 조회 및 읽음 처리
- 서비스 알림 조회 및 읽음 처리
- 알림 수신 설정 관리
- Firebase Cloud Messaging 기반 Web Push
- Access / Refresh Token 기반 인증 세션 유지
- 역할별 기부자·기관 서비스 플로우 제공

---

## 👥 ISSUM Member

<table align="center">
  <tr align="center">
    <td style="min-width: 180px;">
      <a href="https://github.com/kinjaebeom">
        <img width="160" height="160" alt="재범 프로필" src="https://github.com/kinjaebeom.png" />
        <br />
        <b>김재범</b>
        <br />
        <sub>@kinjaebeom</sub>
      </a>
    </td>
    <td style="min-width: 180px;">
      <a href="https://github.com/Hyobee02">
        <img width="160" height="160" alt="효비 프로필" src="https://github.com/Hyobee02.png" />
        <br />
        <b>최효비</b>
        <br />
        <sub>@Hyobee02</sub>
      </a>
    </td>
  </tr>
  <tr align="center">
    <td>
      기부자 서비스<br />
      기부 물품 · 추천 · 프로필<br />
      API 연동 및 프로젝트 기반 구축
    </td>
    <td>
      기관 서비스<br />
      인증 · 거래 · 채팅 · 알림<br />
      API 연동 및 서비스 기능 구현
    </td>
  </tr>
</table>

---

# 🛠 Tech Stack

| Category | Stack |
| --- | --- |
| **UI** | React |
| **Language** | TypeScript |
| **Build Tool** | Vite |
| **Routing** | React Router |
| **Styling** | Tailwind CSS |
| **Server State** | TanStack Query |
| **HTTP Client** | Axios |
| **Real-time** | STOMP WebSocket |
| **Push** | Firebase Cloud Messaging |
| **Icons** | SVG |
| **Package Manager** | pnpm |
| **Lint** | Oxlint |
| **Deployment** | Vercel |

### 주요 버전

```text
React              19.2.x
TypeScript         6.0.x
Vite               8.3.x
React Router       7.18.x
Tailwind CSS       4.3.x
TanStack Query     5.104.x
Axios              1.20.x
STOMP              7.5.x
Firebase           13.2.x
```

---

# 🧩 Architecture

ISSUM Frontend는 화면과 서버 통신 로직을 분리하고,
TanStack Query를 통해 서버 상태를 일관되게 관리합니다.

```text
Page / Component
       ↓
Query / Mutation Hook
       ↓
API Layer
       ↓
Axios Instance
       ↓
Backend REST API
```

실시간 기능은 별도의 STOMP WebSocket 연결을 통해 처리합니다.

```text
Page
 ↓
Chat Hook
 ↓
STOMP Client
 ↓
WebSocket Server
```

### 역할 분리

```text
pages
 └─ 화면 단위 구성

components
 └─ 재사용 가능한 UI

features
 └─ 도메인 핵심 로직 및 UI

hooks
 └─ Query / Mutation / Controller / WebSocket

apis
 └─ Backend API 요청·응답 처리

types
 └─ API 및 도메인 Type

routes
 └─ URL 및 페이지 Routing

styles
 └─ Design Token 및 전역 Style
```

---

# 📡 API Integration

모든 일반 HTTP 통신은 공통 Axios Instance를 사용합니다.

```text
src/apis/axios.ts
```

Axios Instance에서 다음 기능을 공통 처리합니다.

- `VITE_API_BASE_URL` 기반 API 주소 설정
- Access Token Authorization Header 자동 적용
- 인증 API를 제외한 요청에 Bearer Token 전달
- HTTP 401 발생 시 Access Token 자동 재발급
- 재발급 성공 후 기존 요청 재시도
- 동일 요청의 중복 Refresh 방지
- 오래된 Refresh 응답이 새로운 인증 세션을 덮어쓰지 않도록 보호
- 서버가 Refresh Token을 거절한 경우에만 인증 세션 정리

---

## API Domain

### 🔐 Auth

```text
로그인
로그아웃
기부자 회원가입
기관 회원가입
이메일 인증
기관 사업자정보 확인
Access / Refresh Token 관리
```

### 👤 Donor

```text
기부자 프로필 조회 / 수정
기부 물품 목록 조회
기부 물품 상세 조회
기부 물품 등록
기부 물품 수정
기부 물품 삭제
기부 완료 내역 조회
```

### 📦 Item

```text
물품 카테고리 조회
물품 상태 조회
물품 단위 조회
```

### 🏢 Organization

```text
기관 프로필 조회 / 수정
기관 상세 조회
기관 필요 물품 조회
필요 물품 등록 / 수정 / 삭제
필요 물품 모집 종료
```

### 🤝 Match

```text
요청 / 제안 생성
요청 / 제안 목록 조회
거래 상세 조회
수락
거절
철회
예약
거래 수량 변경
전달 약속 등록 / 수정
거래 완료
거래 취소
```

### 💬 Chat

```text
채팅방 목록 조회
채팅 메시지 조회
메시지 읽음 처리
STOMP WebSocket 실시간 송수신
```

### 🔔 Notification

```text
알림 목록 조회
미읽음 알림 개수 조회
개별 알림 읽음 처리
전체 알림 읽음 처리
알림 수신 설정 조회 / 변경
Web Push 등록
Web Push 등록 해제
```

### 🎯 Recommendation

```text
기부 물품 기반 추천 기관 조회
추천 결과 재계산
```

---

# 🔐 Authentication

ISSUM은 사용자 역할을 다음과 같이 구분합니다.

```text
DONOR
ORGANIZATION
```

로그인 성공 시 서버가 반환한 세션 정보를 저장하고,
사용자 역할에 따라 기부자 또는 기관 서비스로 이동합니다.

```text
Login
  ↓
AuthSession 저장
  ↓
DONOR / ORGANIZATION 확인
  ↓
역할별 Home 이동
```

인증 세션에는 Access Token과 Refresh Token을 사용합니다.

```text
Authorization: Bearer {accessToken}
```

### Token Refresh

Access Token이 만료되어 API에서 `401` 응답을 반환하면:

```text
API Request
    ↓
401
    ↓
Refresh Token 요청
    ↓
새 Access Token 저장
    ↓
기존 API Request 재시도
```

동시에 여러 API가 `401`을 반환하더라도
Refresh 요청은 하나만 실행되도록 관리합니다.

로그아웃이나 새로운 로그인 이후 이전 Refresh 응답이 도착하는 경우에도
현재 인증 세션을 덮어쓰지 않도록 세션 일관성을 검증합니다.

> 실제 데이터 접근 권한과 사용자 역할에 대한 최종 검증은 Backend API의 인증·인가 정책을 기준으로 합니다.

---

# 💬 Real-time Communication

거래가 연결된 기부자와 기관은 실시간 채팅을 사용할 수 있습니다.

```text
REST API
 ├─ 채팅방 목록
 └─ 이전 메시지 조회

STOMP WebSocket
 ├─ 실시간 메시지 송수신
 └─ 읽음 상태 처리
```

`@stomp/stompjs`를 이용하여 WebSocket 연결과 구독을 관리하며,
인증된 사용자의 JWT 정보를 STOMP 연결에 전달합니다.

---

# 🔔 Notification & Web Push

ISSUM은 서비스 내부 알림과 브라우저 Web Push를 함께 제공합니다.

## In-App Notification

- 알림 목록 조회
- 커서 기반 페이지네이션
- 미읽음 알림 개수 조회
- 개별 알림 읽음
- 전체 알림 읽음
- 매칭 알림 수신 설정
- 채팅 알림 수신 설정

## Firebase Web Push

```text
Firebase Messaging
        ↓
브라우저 알림 권한
        ↓
Service Worker 등록
        ↓
Firebase Installation ID(FID) 발급
        ↓
Backend Push Registration
        ↓
Web Push 수신
```

로그인 사용자와 브라우저 기기를 연결하여 Push Registration을 관리하며,
로그아웃 또는 계정 변경 시 기존 등록 정보가 잘못 유지되지 않도록 처리합니다.

---

# 📄 Donation Document

전달 완료된 기부 기록을 기반으로 기부 관련 문서를 발급할 수 있습니다.

### 기부 내역 확인서

- 전달 완료 상태의 기부 목록 조회
- 필요한 기부 내역 선택
- 여러 건의 기부를 하나의 내역서로 구성
- 기부자 / 수령 기관 / 물품 / 수량 / 완료일 / 거래번호 표시
- 브라우저 인쇄 기능을 이용한 PDF 저장

### 기부 확인서

- 완료된 거래 정보를 기반으로 기부 확인 정보 제공
- 서비스 내부 거래 데이터 기준으로 문서 구성

### 모바일 브라우저 대응

카카오톡 인앱 브라우저처럼 PDF 인쇄 기능이 제한되는 환경에서는
외부 Safari / Chrome에서 열 수 있도록 별도 안내를 제공합니다.

> ISSUM에서 발급하는 기부 내역 확인서는 서비스 활동 확인용 문서이며,
> 세액공제용 공식 기부금 영수증을 의미하지 않습니다.

---

# ⚡ Performance & Stability

최종 서비스 안정화를 위해 다음 항목을 개선했습니다.

### Route Lazy Loading

페이지 컴포넌트를 필요한 시점에 동적으로 불러와
초기 로딩 시 불필요한 JavaScript 로드를 줄였습니다.

### Search Debounce

검색 입력마다 즉시 요청하지 않고 debounce를 적용하여
불필요한 서버 요청을 줄였습니다.

### Image Lazy Loading

화면에 필요한 시점에 이미지를 불러오도록 하여
초기 페이지 렌더링 부담을 줄였습니다.

### Query Cache

TanStack Query의 Query Key와 Cache Invalidation을 이용해
등록·수정·삭제 이후 서버 데이터와 화면 상태를 일관되게 유지합니다.

### Authentication Stability

- 중복 Token Refresh 방지
- Stale Refresh Response 방지
- 일시적 네트워크 오류 시 인증 세션 유지
- 로그아웃 API Timeout 적용

### Code Review

CodeRabbit 및 팀 리뷰에서 확인된 문제를
별도 Issue / Branch / PR을 통해 후속 수정했습니다.

---

# 🗂 Project Structure

```text
.
├── docs/
│   ├── donor-demo.md
│   └── recipient-selection.md
│
├── public/
│   └── favicon.svg
│
├── src/
│   ├── apis/
│   │   ├── auth/
│   │   ├── chat/
│   │   ├── items/
│   │   ├── matches/
│   │   ├── organization/
│   │   ├── users/
│   │   ├── axios.ts
│   │   ├── donationItem.ts
│   │   ├── donor.ts
│   │   ├── item.ts
│   │   ├── match.ts
│   │   ├── neededItem.ts
│   │   ├── notification.ts
│   │   └── recommendation.ts
│   │
│   ├── app/
│   │   └── providers/
│   │       ├── AppProviders.tsx
│   │       └── QueryProvider.tsx
│   │
│   ├── assets/
│   │   ├── images/
│   │   └── logo/
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── item/
│   │   └── onboarding/
│   │
│   ├── constants/
│   │   └── designTokens.ts
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── donor/
│   │   ├── matches/
│   │   └── notifications/
│   │
│   ├── hooks/
│   │   ├── auth/
│   │   ├── chat/
│   │   ├── matches/
│   │   ├── mutations/
│   │   ├── onboarding/
│   │   ├── organization/
│   │   ├── queries/
│   │   └── useViewportPopover.ts
│   │
│   ├── layouts/
│   │   ├── DonorLayout.tsx
│   │   ├── OrganizationLayout.tsx
│   │   └── SharedLayout.tsx
│   │
│   ├── pages/
│   │   ├── donor/
│   │   │   ├── DonationCertificatePage.tsx
│   │   │   ├── DonationStatementPage.tsx
│   │   │   ├── DonationDetailPage.tsx
│   │   │   ├── DonationRegisterPage.tsx
│   │   │   ├── DonorDonationHistoryPage.tsx
│   │   │   ├── DonorDonationManagePage.tsx
│   │   │   ├── DonorHomePage.tsx
│   │   │   ├── DonorMyPage.tsx
│   │   │   ├── NeedListPage.tsx
│   │   │   └── RecommendationPage.tsx
│   │   │
│   │   ├── organization/
│   │   │   ├── OrganizationHomePage.tsx
│   │   │   ├── NeedManagePage.tsx
│   │   │   ├── DonationListPage.tsx
│   │   │   ├── OfferListPage.tsx
│   │   │   ├── OrganizationTradeStatusPage.tsx
│   │   │   └── RecommendationPage.tsx
│   │   │
│   │   ├── login/
│   │   ├── onboarding/
│   │   └── shared/
│   │       ├── ChatListPage.tsx
│   │       ├── ChatRoomPage.tsx
│   │       ├── NotificationPage.tsx
│   │       ├── TradeDetailPage.tsx
│   │       └── NotFoundPage.tsx
│   │
│   ├── routes/
│   │   ├── ProtectedRoute.tsx
│   │   ├── paths.ts
│   │   └── router.tsx
│   │
│   ├── styles/
│   │   ├── tokens/
│   │   ├── animations.css
│   │   ├── base.css
│   │   ├── donation-certificate.css
│   │   ├── donation-statement.css
│   │   └── globals.css
│   │
│   ├── types/
│   │   ├── api.ts
│   │   ├── donationItem.ts
│   │   ├── donor.ts
│   │   ├── item.ts
│   │   ├── match.ts
│   │   ├── neededItem.ts
│   │   ├── notification.ts
│   │   └── recommendation.ts
│   │
│   ├── utils/
│   │   ├── cn.ts
│   │   └── inAppBrowser.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── tests/
│   ├── donationItem-api.e2e.mjs
│   ├── donor.e2e.mjs
│   ├── donorModel.test.mjs
│   ├── match-followup.e2e.cjs
│   ├── match-six.e2e.cjs
│   ├── needSearch.test.mjs
│   ├── notification-actions.e2e.cjs
│   ├── notification-api.e2e.cjs
│   ├── recipientSelection.test.mjs
│   └── web-push.e2e.cjs
│
├── .env.example
├── .oxlintrc.json
├── package.json
├── pnpm-lock.yaml
├── vercel.json
└── vite.config.ts
```

---

# 🎨 UI / UX Structure

기부자와 기관의 역할이 명확히 다르기 때문에
사용자 유형별 Layout과 Page를 분리했습니다.

```text
Donor
├── Home
├── Donation Register / Manage
├── Recommendation
├── Needed Item Search
├── Request / Offer
├── History
├── Donation Document
└── MyPage

Organization
├── Home
├── Needed Item
├── Donation Search
├── Request / Offer
├── Trade
└── MyPage

Shared
├── Login / Signup
├── Chat
├── Notification
└── Trade Detail
```

공통 UI는 `components/common`에서 관리하며,
도메인별 로직은 `features`, `hooks`, `apis`로 분리합니다.

---

# 🔄 Server State Convention

서버 상태 조회와 변경 작업을 명확히 분리합니다.

```text
GET
 → hooks/queries/useXXXQuery.ts

POST / PATCH / DELETE
 → hooks/mutations/useXXXMutation.ts
```

예시:

```text
Query

useDonationItemQuery
useDonationItemsQuery
useDonationRecommendationsQuery
useDonorProfileQuery
useMatchesQuery
useNotificationsQuery
useChatMessagesQuery
useChatRoomsQuery
```

```text
Mutation

useCreateDonationItemMutation
useUpdateDonationItemMutation
useDeleteDonationItemMutation
useCreateMatchMutation
useAcceptMatchMutation
useRejectMatchMutation
useReserveMatchMutation
useCompleteMatchMutation
useUpdateMatchQuantityMutation
useUpdateMatchAppointmentMutation
useRecalculateDonationRecommendationsMutation
```

Mutation 성공 후에는 관련 Query Cache를 갱신하거나 무효화하여
서버 데이터와 화면 상태를 동기화합니다.

---

# 💻 Git & Collaboration Convention

## 🌿 Branch Strategy

ISSUM은 다음 브랜치 흐름을 사용합니다.

```text
main
 ↑
develop
 ↑
feat/* | fix/* | refactor/* | design/*
```

### `main`

- 최종 배포 및 제출에 사용하는 안정 브랜치
- 검증이 완료된 `develop`만 Release PR을 통해 반영
- Vercel Production Deployment 기준 브랜치

### `develop`

- 기능 개발 결과를 통합하는 개발 기준 브랜치
- Feature / Fix PR의 기본 대상
- 전체 사용자 플로우 및 API 연동을 검증한 뒤 `main`으로 반영

### Working Branch

```text
feat/donor-flow-api
feat/notification-api
fix/donation-cache
fix/page-layout-header-alignment
design/donor-form-qa
refactor/auth-session
```

- `develop`에서 생성합니다.
- 하나의 브랜치는 하나의 기능 또는 하나의 논리적 작업 단위를 기준으로 합니다.
- 여러 단어는 `kebab-case`를 사용합니다.
- Merge 이후 작업 브랜치는 삭제합니다.

> 최종 제출 시점에는 `main`, `develop` 두 브랜치만 유지합니다.

---

# 📝 Commit Message Convention

Git History에서 변경 내용을 빠르게 확인할 수 있도록
작업 유형과 구체적인 변경 내용을 제목에 작성합니다.

프로젝트 이력에는 다음 두 형식이 사용되었습니다.

```text
type: 작업 내용
```

```text
[Type] 작업 내용
```

두 표현은 동일한 작업 유형을 의미합니다.

### Commit Type

| Type | Description |
| --- | --- |
| `feat` / `[Feat]` | 새로운 기능 및 API 연동 |
| `fix` / `[Fix]` | 버그 및 오류 수정 |
| `refactor` / `[Refactor]` | 기능 변경 없는 구조 개선 |
| `perf` / `[Perf]` | 성능 개선 |
| `style` / `[Style]` | 코드 스타일 / 포맷 수정 |
| `design` / `[Design]` | UI / UX 변경 |
| `docs` / `[Docs]` | 문서 작성 및 수정 |
| `test` / `[Test]` | 테스트 코드 |
| `chore` / `[Chore]` | 환경 설정 및 기타 작업 |
| `rename` / `[Rename]` | 파일 및 폴더명 변경 |
| `remove` / `[Remove]` | 불필요한 코드 및 파일 제거 |

### Example

```text
[Feat] 기부자 홈 프로필 조회 API 연동
[Feat] 추천 기관 API 연동
[Fix] stale token refresh 결과의 세션 덮어쓰기 방지
[Fix] 페이지 레이아웃 및 헤더 정렬 통일
[Design] 기부 등록·알림·채팅 UI QA 반영
```

### Rule

- 하나의 커밋에는 가능한 한 하나의 논리적 변경만 포함합니다.
- 제목만 보아도 변경 내용을 파악할 수 있도록 작성합니다.
- `수정`, `오류 해결`, `update`와 같이 범위가 불명확한 제목은 지양합니다.

---

# 🔀 Pull Request Rule

기능 개발 및 수정 작업은 PR을 통해 `develop`에 통합합니다.

PR에는 다음 내용을 작성합니다.

```text
관련 Issue
작업 배경
주요 작업 내용
변경된 동작
검증 결과
필요한 경우 Review 반영 내용
```

### PR Example

```text
[Feat] 기부자 플로우 API 연동 및 Mock 데이터 제거
```

```md
## 관련 Issue

Closes #00

## 작업 내용

- 기부 물품 API 연동
- 추천 기관 API 연동
- Mock 데이터 제거
- Query Cache 갱신 처리

## 검증

- [x] pnpm lint
- [x] pnpm build
- [x] 관련 기능 브라우저 확인
```

---

# 🤝 Ground Rule

ISSUM Frontend는 실제 프로젝트에서 다음 순서로 협업했습니다.

```text
Issue
  ↓
Branch
  ↓
Implementation
  ↓
Commit
  ↓
Pull Request
  ↓
CodeRabbit / Team Review
  ↓
Review 반영
  ↓
Build / Lint / 관련 테스트
  ↓
Merge to develop
  ↓
통합 검증
  ↓
Release PR
  ↓
main
```

### 1. 작업 전에 Issue를 작성합니다

- 구현할 기능 또는 수정할 문제를 먼저 정의합니다.
- 작업 배경과 필요한 변경 내용을 기록합니다.
- 하나의 Issue는 가능한 한 하나의 기능 또는 문제를 기준으로 합니다.
- 초기 개발 단계에서 PR 중심으로 진행한 작업은 이후 Retrospective Issue로 기능 단위 이력을 보완했습니다.
- 이후 수정 작업은 가능한 한 **Issue → Branch → PR** 순서를 지킵니다.

### 2. `develop`에서 작업 브랜치를 생성합니다

```text
develop
 ↓
feat/*
fix/*
design/*
refactor/*
```

- `main`에서 직접 기능 개발하지 않습니다.
- `develop`에도 원칙적으로 직접 Push하지 않습니다.
- 기능과 관계없는 변경을 하나의 브랜치에 섞지 않습니다.

### 3. Commit은 작은 논리 단위로 분리합니다

- 기능 구현
- API 연동
- UI 수정
- 오류 수정
- Refactoring

등의 변경 목적이 Git History에서 구분될 수 있도록 작성합니다.

### 4. 구현 완료 후 PR을 생성합니다

PR 본문에는 최소한 다음 내용을 남깁니다.

- 관련 Issue
- 작업 배경
- 변경 내용
- 주요 변경 파일 또는 기능
- 검증 결과

### 5. PR Review를 확인하고 필요한 내용을 반영합니다

ISSUM은 팀 리뷰와 CodeRabbit Review를 함께 활용했습니다.

- 리뷰 내용을 무조건 반영하지 않고 실제 코드와 서비스 흐름을 확인합니다.
- 유효한 지적은 코드에 반영합니다.
- 추가 수정이 독립적인 작업이면 별도 Issue / Branch / PR로 분리합니다.
- 리뷰 반영 후 기존 기능이 깨지지 않았는지 다시 확인합니다.

### 6. Merge 전에 검증합니다

기본 검증:

```bash
pnpm lint
pnpm build
```

관련 테스트가 존재하는 기능은 해당 테스트도 함께 확인합니다.

추가로:

- 실제 API 요청·응답
- 주요 사용자 플로우
- 모바일 레이아웃
- Query Cache
- 인증 세션
- 에러 및 빈 상태

등 변경 범위에 맞는 항목을 확인합니다.

### 7. Merge 이후 브랜치를 정리합니다

- 검증이 완료된 PR만 `develop`에 Merge합니다.
- Merge된 기능 브랜치는 삭제합니다.
- `develop`에서 주요 서비스 플로우를 다시 확인합니다.

### 8. 최종 배포는 `develop → main` Release PR로 진행합니다

```text
Feature / Fix
      ↓
develop
      ↓
전체 기능 검증
      ↓
Release PR
      ↓
main
      ↓
Production
```

`main`은 최종 제출 및 배포 가능한 안정 상태를 유지합니다.

### 9. 변경사항을 공유합니다

- 다른 팀원의 작업 영역을 수정해야 하는 경우 먼저 공유합니다.
- API 명세 또는 응답 구조가 변경되면 즉시 공유합니다.
- 충돌 가능성이 있는 대규모 수정은 작업 전에 작업 범위를 공유합니다.
- 문제가 발생하면 원인과 해결 과정을 Issue 또는 PR에 남깁니다.

### 10. 질문과 리뷰를 부담 없이 진행합니다

- 모르는 부분은 바로 질문합니다.
- 리뷰는 사람에 대한 평가가 아니라 코드와 서비스 품질 개선을 목적으로 합니다.
- 다른 의견이 있을 경우 근거와 함께 논의합니다.

---

# 🧪 Validation

프로젝트에는 API 및 주요 기능 검증을 위한 테스트 코드가 포함되어 있습니다.

```text
tests/
├── donationItem-api.e2e.mjs
├── donor.e2e.mjs
├── donorModel.test.mjs
├── match-followup.e2e.cjs
├── match-six.e2e.cjs
├── needSearch.test.mjs
├── notification-actions.e2e.cjs
├── notification-api.e2e.cjs
├── recipientSelection.test.mjs
└── web-push.e2e.cjs
```

PR Merge 전 기본적으로 다음 명령을 확인합니다.

```bash
pnpm lint
pnpm build
```

---

# 🚀 Getting Started

## 1. Clone

```bash
git clone https://github.com/IT-SSUM/FE.git
cd FE
```

## 2. Install

```bash
pnpm install
```

## 3. Environment

`.env.example`을 복사하여 `.env`를 생성합니다.

```env
VITE_API_BASE_URL=http://localhost:8080
```

`.env`는 Git Repository에 포함하지 않습니다.

## 4. Development

```bash
pnpm dev
```

## 5. Build

```bash
pnpm build
```

## 6. Lint

```bash
pnpm lint
```

## 7. Preview

```bash
pnpm preview
```

---

# 🔑 Environment Variables

현재 Frontend에서 환경별 Backend 주소를 다음 값으로 관리합니다.

```env
VITE_API_BASE_URL=http://localhost:8080
```

Production 환경에서는 배포된 Backend API 주소를 사용합니다.

```env
VITE_API_BASE_URL=https://api.itssum.site
```

Firebase Web Push에 사용되는 Web App 설정은 클라이언트용 Firebase 설정이며,
Firebase Admin SDK의 Service Account Private Key와 같은 서버 비밀정보는 Frontend에 포함하지 않습니다.

---

# 🌐 Deployment

Frontend는 Vercel을 통해 배포합니다.

### Production

https://it-ssum.vercel.app

### Deployment Flow

```text
Working Branch
      ↓
Pull Request
      ↓
develop
      ↓
통합 검증
      ↓
Release PR
      ↓
main
      ↓
Vercel Production Deployment
```

SPA의 직접 URL 접근을 지원하기 위해 Vercel Rewrite를 적용합니다.

```text
/* → /index.html
```

배포 전 다음 명령으로 Production Build와 Lint를 확인합니다.

```bash
pnpm lint
pnpm build
```

---

# ♻️ ISSUM

> **남는 물품을 필요한 곳으로,**
>
> **버려질 자원을 다시 쓰일 수 있도록.**

ISSUM은 개인의 잉여 자원과 지역사회 기관의 실제 수요를 연결하여
보다 지속 가능한 기부와 자원순환을 만들어갑니다.
