# ♻️ ISSUM

> **남는 물품이 필요한 곳에 닿을 수 있도록.**  
> 개인의 사용 가능한 잉여 물품과 해당 물품이 필요한 복지기관을 연결하는  
> **지역사회 자원순환 · 기부 매칭 플랫폼**

<br />

ISSUM(이씀)은 개인에게 남는 사용 가능한 물품이 단순히 버려지지 않고,  
실제로 해당 물품을 필요로 하는 복지기관에 전달될 수 있도록 연결합니다.

기부자는 보유한 물품을 등록하고 기관의 수요를 확인할 수 있으며,  
기관은 필요한 물품을 등록하거나 기부자가 등록한 물품을 확인하여 요청할 수 있습니다.

매칭 이후에는 요청·제안, 거래 상태 관리, 채팅, 전달 일정 조율까지  
**기부의 전체 과정을 하나의 서비스 안에서 관리**할 수 있습니다.

<br />

## 🌱 Core Features

### 👤 기부자

- 기부자 회원가입 및 프로필 관리
- 기부 물품 등록 / 조회 / 수정 / 삭제
- 물품 이미지 업로드
- 기관 필요 물품 확인
- 등록 물품 기반 추천 기관 조회
- 기관에 기부 제안
- 기관으로부터 받은 요청 확인
- 진행 중 거래 및 기부 완료 내역 관리

### 🏢 기관

- 기관 계정 가입 및 **사업자번호 기반 기관 인증**
- 기관 정보 및 계정 관리
- 필요 물품 등록 / 조회 / 수정 / 종료
- 기부자가 등록한 물품 탐색
- 기부자에게 물품 요청
- 받은 제안 / 보낸 요청 관리
- 거래 상태 및 전달 일정 관리

### 🤝 공통

- 기부자 ↔ 기관 양방향 요청 및 제안
- 지역·필요 수량 등을 고려한 기관 추천
- 거래 수량 및 상태 관리
- 실시간 채팅
- 알림 조회 및 읽음 처리
- Firebase 기반 Web Push 알림
- 전달 일정 조율 및 거래 완료 처리

<br />

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

<br />

---

# 🛠 ISSUM WEB 기술 스택

| 카테고리 | 기술 스택 |
| --- | --- |
| **UI Library** | ![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=white&style=for-the-badge) |
| **Language** | ![TypeScript](https://img.shields.io/badge/TypeScript_6-3178C6?logo=typescript&logoColor=white&style=for-the-badge) |
| **Build Tool** | ![Vite](https://img.shields.io/badge/Vite_8-646CFF?logo=vite&logoColor=white&style=for-the-badge) |
| **Routing** | ![React Router](https://img.shields.io/badge/React_Router_7-CA4245?logo=reactrouter&logoColor=white&style=for-the-badge) |
| **Styling** | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?logo=tailwindcss&logoColor=white&style=for-the-badge) |
| **Server State** | ![TanStack Query](https://img.shields.io/badge/TanStack_Query_5-FF4154?logo=reactquery&logoColor=white&style=for-the-badge) |
| **HTTP Client** | ![Axios](https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white&style=for-the-badge) |
| **Client State** | ![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge) |
| **Real-time** | ![WebSocket](https://img.shields.io/badge/STOMP_WebSocket-010101?style=for-the-badge) |
| **Push Notification** | ![Firebase](https://img.shields.io/badge/Firebase_Cloud_Messaging-DD2C00?logo=firebase&logoColor=white&style=for-the-badge) |
| **Icon** | ![Lucide](https://img.shields.io/badge/Lucide_React-F56565?style=for-the-badge) |
| **Package Manager** | ![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white&style=for-the-badge) |
| **Lint** | ![Oxlint](https://img.shields.io/badge/Oxlint-262626?style=for-the-badge) |
| **Deployment** | ![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white&style=for-the-badge) |

<br />

---

# 🧩 Architecture

ISSUM Frontend는 UI와 서버 통신 로직의 역할을 분리하고,  
서버 상태를 TanStack Query를 통해 일관되게 관리하도록 구성했습니다.

```text
Page
  ↓
Query / Mutation Hook
  ↓
API Layer
  ↓
Axios Instance
  ↓
Backend API
```

### API Layer

`src/apis`에서 도메인별 API 요청과 응답 타입을 관리합니다.

```text
apis/
├── auth/
├── chat/
├── items/
├── matches/
├── organization/
├── users/
├── donationItem.ts
├── donor.ts
├── match.ts
├── neededItem.ts
├── notification.ts
└── recommendation.ts
```

### Server State

조회와 변경 작업을 분리하여 관리합니다.

```text
hooks/
├── queries/       # GET 기반 서버 상태 조회
└── mutations/     # POST / PATCH / DELETE 기반 서버 상태 변경
```

TanStack Query의 Query Key와 Cache Invalidation을 이용해  
등록·수정·삭제 이후 화면의 서버 상태가 일관되게 갱신되도록 구성했습니다.

<br />

---

# 📡 API Integration

서버 통신은 공통 Axios Instance를 통해 처리합니다.

```text
src/apis/axios.ts
```

공통 API Client에서 다음 항목을 관리합니다.

- API Base URL
- Access Token Authorization Header
- JWT 인증 처리
- Access Token 만료 시 Refresh
- 공통 Axios Response 처리

주요 도메인별 API는 다음과 같이 분리되어 있습니다.

```text
Auth
├── 로그인
├── 회원가입
└── 토큰 재발급

Donor
├── 기부자 프로필
├── 기부 물품
└── 기부 내역

Organization
├── 기관 프로필
├── 기관 필요 물품
└── 기관 상세

Match
├── 요청 / 제안
├── 수락 / 거절 / 철회
├── 예약
├── 수량 변경
├── 일정 설정
├── 거래 완료
└── 거래 취소

Chat
├── 채팅방 조회
├── 채팅 메시지 조회
└── STOMP 실시간 채팅

Notification
├── 알림 목록
├── 미읽음 개수
├── 읽음 처리
├── 알림 설정
└── Firebase Web Push

Recommendation
├── 추천 기관 조회
└── 추천 결과 재계산
```

<br />

---

# 💻 ISSUM WEB Convention

> ISSUM Web 팀의 협업 효율과 코드 품질 유지를 위한 컨벤션입니다.  
> Git / Branch / Commit / Pull Request / Folder Structure에 대한 공통 기준을 정의합니다.

---

## 🌿 Git Convention

### Git Flow

```text
main
 ↑
develop
 ↑
feat/*
```

- `main` : 실제 배포에 사용되는 안정 브랜치
- `develop` : 개발 기능을 통합하는 브랜치
- `feat/*` : 기능 단위 개발 브랜치
- `fix/*` : 오류 수정 브랜치

<details>
<summary>📌 Git Flow 상세 규칙</summary>

### main

- 배포 가능한 안정 상태를 유지합니다.
- 검증이 완료된 `develop`의 변경사항을 반영합니다.
- Production 배포를 기준으로 관리합니다.

### develop

- 기능 개발 결과를 통합하는 기본 개발 브랜치입니다.
- 기능 구현이 완료된 브랜치는 `develop`을 대상으로 병합합니다.
- 통합 후 전체 서비스 흐름과 API 연결을 확인합니다.

### Feature Branch

- `develop`을 기준으로 기능 단위 브랜치를 생성합니다.
- 하나의 브랜치에서는 가능한 한 하나의 기능 또는 관련 작업 흐름을 처리합니다.

예시:

```text
feat/donor-flow-api
feat/notification-api
feat/chat-api
fix/donation-cache
```

</details>

---

# 📝 Commit Message Convention

ISSUM은 Git History에서 변경 내용을 빠르게 파악할 수 있도록  
**작업 유형 + 구체적인 변경 내용**을 커밋 제목에 명시합니다.

## 기본 형식

프로젝트에서는 아래 두 가지 Type 표기 형식을 사용합니다.

```text
type: 작업 내용
```

또는

```text
[Type] 작업 내용
```

두 형식은 동일한 의미의 작업 유형을 나타내며,  
**작업 유형과 변경 내용을 명확히 표현하는 것**을 공통 기준으로 합니다.

### Examples

```text
feat: 기관 정보 수정 및 계정 관리 기능 구현
feat: 예약 거래 상세 및 전달 약속 설정 기능 구현

[Feat] 기부자 홈 프로필 조회 API 연동
[Feat] 마이페이지 기부자 프로필 조회 API 연동
[Fix] 기부자 프로필 타입 가드 및 수정 폼 상태 처리
```

<details>
<summary>📌 Commit Type & 작성 규칙</summary>

## Commit Type

| Type | 설명 |
| --- | --- |
| `feat` / `[Feat]` | 새로운 기능 구현 및 API 연동 |
| `fix` / `[Fix]` | 버그 및 오류 수정 |
| `refactor` / `[Refactor]` | 기능 변경 없이 코드 구조 개선 |
| `perf` / `[Perf]` | 성능 개선 |
| `style` / `[Style]` | 코드 스타일 및 포맷 수정 |
| `design` / `[Design]` | UI / UX 디자인 변경 |
| `docs` / `[Docs]` | 문서 작성 및 수정 |
| `test` / `[Test]` | 테스트 코드 작성 및 수정 |
| `chore` / `[Chore]` | 환경 설정 및 기타 작업 |
| `rename` / `[Rename]` | 파일 및 폴더명 변경 |
| `remove` / `[Remove]` | 불필요한 파일 및 코드 제거 |

## 작성 규칙

- 모든 커밋에 작업 유형을 명시합니다.
- 제목만 확인해도 변경 내용을 알 수 있도록 구체적으로 작성합니다.
- 하나의 커밋에는 가능한 한 하나의 논리적인 변경 단위를 포함합니다.
- 기능 구현 / API / Query / Mutation / UI / 오류 수정 등의 작업을 구분합니다.
- 의미가 불분명한 제목보다 실제 변경 범위를 구체적으로 작성합니다.
- 불필요한 마침표는 사용하지 않습니다.

예시:

```text
❌ feat: 수정
❌ fix: 오류 해결
❌ update

✅ [Feat] 기부 물품 상세 조회 API 연동
✅ feat: 기관 필요 물품 관리 목록 및 상세 화면 구현
✅ [Fix] 기부 물품 목록 Query 캐시 키 분리
```

</details>

---

# 🌳 Branch Convention

## 기본 형식

```text
{type}/{short-description}
```

필요한 경우 범위를 포함합니다.

```text
{type}/{scope}-{short-description}
```

### Examples

```text
feat/donor-flow-api
feat/notification-api
feat/chat-api
fix/donation-cache
```

<details>
<summary>📌 Branch Naming Rule</summary>

- Type은 소문자로 작성합니다.
- 기능 또는 작업 목적을 명확하게 표현합니다.
- 여러 단어는 `kebab-case`를 사용합니다.
- 의미 없는 축약어 사용을 지양합니다.
- 브랜치명만 확인해도 작업 내용을 파악할 수 있도록 작성합니다.

</details>

---

# 🔀 Pull Request Rule

기능 개발은 가능한 한 독립적인 브랜치에서 진행하고  
완료된 기능을 `develop` 브랜치에 통합합니다.

- 기능 단위로 PR을 분리합니다.
- PR 제목에서 작업 유형과 범위를 명확하게 표현합니다.
- PR 본문에 주요 작업 내용과 연동 API를 기록합니다.
- 리뷰 과정에서 발견된 오류 또는 개선사항을 반영합니다.
- 병합 전 Build / Lint 상태를 확인합니다.
- 팀원의 변경사항과 충돌 여부를 확인한 후 병합합니다.

### PR Example

```text
[Feat] 기부자 플로우 API 연동 및 mock 데이터 제거
```

```text
## 작업 내용

- 기부 물품 API 연동
- 기부자 등록 물품 목록 조회
- 추천 기관 API 연동
- 기존 mock 데이터 제거
- Query Cache 갱신 처리

## 검증

- pnpm build
- pnpm lint
- 실제 API 요청 및 응답 확인
```

---

# 🗂 Project Structure

```text
src/
├── apis/                          # 서버 API 통신 레이어
│   ├── auth/                      # 인증 / 회원가입 / JWT
│   ├── chat/                      # 채팅 API
│   ├── items/                     # 물품 메타데이터 API
│   ├── matches/                   # 매칭 및 거래 API
│   ├── organization/              # 기관 API
│   ├── users/                     # 사용자 계정 API
│   ├── axios.ts                   # 공통 Axios Instance
│   ├── donationItem.ts            # 기부 물품 API
│   ├── donor.ts                   # 기부자 API
│   ├── neededItem.ts              # 필요 물품 API
│   ├── notification.ts            # 알림 API
│   └── recommendation.ts          # 추천 API
│
├── app/
│   └── providers/                 # Query / 전역 Provider
│
├── assets/
│   ├── images/                    # 이미지 리소스
│   └── logo/                      # 로고 리소스
│
├── components/
│   ├── common/                    # 공통 UI Component
│   ├── item/                      # 물품 관련 Component
│   └── onboarding/                # 로그인 / 회원가입 Component
│
├── constants/                     # 공통 상수 및 Design Token
│
├── features/                      # 도메인별 핵심 기능
│   ├── auth/                      # 인증 및 세션 관리
│   ├── donor/                     # 기부 물품 Form 및 기부자 기능
│   ├── matches/                   # 거래 Action
│   └── notifications/            # Firebase Web Push / 알림
│
├── hooks/
│   ├── auth/                      # 인증 Hook
│   ├── chat/                      # 실시간 채팅 Hook
│   ├── matches/                   # 매칭 Hook
│   ├── mutations/                 # 서버 상태 변경 Mutation
│   ├── onboarding/                # 로그인 / 회원가입 Hook
│   ├── organization/              # 기관 관련 Hook
│   └── queries/                   # 서버 데이터 Query
│
├── layouts/
│   ├── DonorLayout.tsx            # 기부자 Layout
│   ├── OrganizationLayout.tsx     # 기관 Layout
│   └── SharedLayout.tsx           # 공통 Layout
│
├── pages/
│   ├── donor/                     # 기부자 화면
│   ├── organization/              # 기관 화면
│   ├── login/                     # 로그인
│   ├── onboarding/                # 회원가입
│   └── shared/                    # 채팅 / 알림 등 공통 화면
│
├── routes/
│   ├── ProtectedRoute.tsx         # 인증 보호 Route
│   ├── paths.ts                   # Route Path 관리
│   └── router.tsx                 # Router 설정
│
├── styles/
│   ├── tokens/                    # Color / Shape / Typography Token
│   ├── animations.css
│   ├── base.css
│   └── globals.css
│
├── types/                         # 공통 TypeScript Type
│
├── utils/                         # 공통 Utility
│
├── App.tsx                        # App Root
└── main.tsx                       # React DOM Entry
```

---

# 🎨 UI / UX Structure

기부자와 기관의 역할이 명확히 다르기 때문에  
각 사용자 유형에 맞는 Layout과 Page를 분리했습니다.

```text
Donor
├── Home
├── Donation
├── Recommendation
├── Request / Offer
├── History
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
└── Notification
```

재사용 가능한 UI는 `components/common`에서 관리하고  
도메인별 비즈니스 로직은 `features`와 `hooks`로 분리합니다.

---

# 🔄 Server State Convention

서버 상태 조회와 변경을 명확하게 분리합니다.

```text
GET
→ hooks/queries/useXXXQuery.ts

POST / PATCH / DELETE
→ hooks/mutations/useXXXMutation.ts
```

예시:

```text
useDonationItemQuery
useDonationItemsQuery
useDonorProfileQuery
useMatchesQuery
useNotificationsQuery

useCreateDonationItemMutation
useUpdateDonationItemMutation
useDeleteDonationItemMutation
useAcceptMatchMutation
useCompleteMatchMutation
```

Mutation 성공 이후에는 관련 Query Cache를 갱신하여  
서버 데이터와 화면 상태의 일관성을 유지합니다.

---

# 🔐 Authentication

ISSUM은 기부자와 기관의 역할을 구분합니다.

```text
DONOR
ORGANIZATION
```

로그인 이후 JWT Access Token을 기반으로 인증 상태를 관리하며  
`ProtectedRoute`를 통해 인증이 필요한 페이지 접근을 제어합니다.

Axios Interceptor에서 인증 Header를 공통으로 처리합니다.

```text
Authorization: Bearer {accessToken}
```

Access Token이 만료된 경우 Refresh 로직을 통해 세션을 갱신합니다.

---

# 💬 Real-time Communication

거래가 성사된 기부자와 기관은 실시간 채팅을 사용할 수 있습니다.

```text
REST API
→ 채팅방 / 이전 메시지 조회

STOMP WebSocket
→ 실시간 메시지 송수신
```

`@stomp/stompjs`를 이용하여 WebSocket 연결과 메시지 구독을 관리합니다.

---

# 🔔 Notification

알림은 일반 서비스 알림과 Web Push를 함께 지원합니다.

### In-App Notification

- 알림 목록 조회
- 미읽음 알림 개수
- 개별 읽음 처리
- 전체 읽음 처리
- 매칭 / 채팅 알림 설정

### Web Push

Firebase Cloud Messaging을 이용하여 브라우저 Push 알림을 제공합니다.

```text
Firebase Messaging
      ↓
FID 발급
      ↓
Backend Push Registration
      ↓
Web Push 수신
```

---

# 🚀 Getting Started

## Install

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

## Build

```bash
pnpm build
```

## Lint

```bash
pnpm lint
```

## Preview

```bash
pnpm preview
```

---

# 🔑 Environment Variables

`.env` 파일은 Git Repository에 포함하지 않습니다.

`.env.example`을 참고하여 로컬 환경 변수를 설정합니다.

```env
VITE_API_BASE_URL=http://localhost:8080
```

배포 환경에서는 Production Backend API 주소를 사용합니다.

```env
VITE_API_BASE_URL=https://api.itssum.site
```

---

# 🌐 Deployment

Frontend는 Vercel을 통해 배포합니다.

**Production**

https://it-ssum.vercel.app

```text
develop
   ↓
검증
   ↓
main
   ↓
Vercel Production Deployment
```

배포 전 아래 명령을 통해 Build와 Lint를 확인합니다.

```bash
pnpm build
pnpm lint
```

---

# 🤝 Ground Rule

### 기본 원칙

- 질문을 주저하지 않습니다.
- 작업 진행 상황과 변경 내용을 팀원에게 공유합니다.
- 기능 개발은 가능한 한 작은 단위로 분리합니다.
- 다른 팀원의 작업 영역을 수정할 경우 사전에 공유합니다.
- API 명세와 실제 응답 구조를 기준으로 구현합니다.
- 문제가 발생한 경우 원인을 기록하고 함께 해결합니다.
- Merge 전 Build와 Lint를 확인합니다.

---

# ♻️ ISSUM

> **남는 물품을 필요한 곳으로,  
> 버려질 자원을 다시 쓰일 수 있도록.**

ISSUM은 개인의 잉여 자원과 지역사회 기관의 실제 수요를 연결하여  
보다 지속 가능한 기부와 자원순환을 만들어갑니다.
