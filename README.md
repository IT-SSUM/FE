# ♾️ IT:SSUM

### 버려질 자원을 가장 필요한 곳으로,

### 남는 물품과 필요한 복지기관을 연결하는 나눔 플랫폼
<img width="100%" alt="IT:SSUM 배너" src="docs/images/banner.png" />


</div>


<br/>

## ✨ 프로젝트 소개

**IT:SSUM**은 사용하지 않는 물품을 실제로 필요한 복지기관과 연결하는 **양방향 물품 기부 플랫폼**입니다.

기부자는 물품을 등록하고 적합한 기관을 추천받을 수 있으며, 복지기관은 필요한 물품을 등록하거나 기부자에게 직접 요청할 수 있습니다. 제안·요청부터 채팅, 전달 일정 조율, 기부 완료 확인까지 하나의 서비스에서 관리할 수 있습니다.

- **기간:** 2026.10.13 ~ 2026.11.18

- **인원:** Frontend 2명

- **목표:** 기부자와 복지기관의 물품 탐색 부담을 줄이고, 등록부터 전달 완료까지 이어지는 기부 경험 제공

- **핵심 흐름:** 물품 등록 → 추천·탐색 → 기부 제안·요청 → 수락 및 채팅 → 전달 일정 조율 → 수령 확인

- **서비스 URL** : [https://itssum.site](https://itssum.site)


<br/>

## 🧑🏻‍💻 Frontend 팀원 및 역할

<table>
  <tr align="center">
    <td>
      <a href="https://github.com/kinjaebeom">
        <img src="https://github.com/kinjaebeom.png" width="110" alt="김재범 프로필" />
      </a>
    </td>
    <td>
      <a href="https://github.com/Hyobee02">
        <img src="https://github.com/Hyobee02.png" width="110" alt="최효비 프로필" />
      </a>
    </td>
  </tr>
  <tr align="center">
    <td><b><a href="https://github.com/kinjaebeom">김재범</a></b></td>
    <td><b><a href="https://github.com/Hyobee02">최효비</a></b></td>
  </tr>
  <tr align="center">
    <td>
      기부자 서비스 · 물품 관리 · 추천 · 프로필<br/>
      프로젝트 기반 구축 · API 연동 · 배포 및 이슈 관리
    </td>
    <td>
      기관 서비스 · 인증 · 매칭 · 채팅 · 알림<br/>
      API 연동 및 서비스 기능 구현
    </td>
  </tr>
</table>


<br/>

## 🚀 주요 기능

| 기능 | 설명 |
| --- | --- |
| **인증·회원** | 기부자·기관 회원가입, 이메일 인증, 로그인·로그아웃, 프로필 및 계정 관리 |
| **물품 관리** | 기부 물품·필요 물품 등록, 조회, 수정, 삭제, 이미지 업로드 및 모집 종료 |
| **탐색·추천** | 검색어·카테고리·지역·상태 필터링, 기부 물품에 적합한 기관 추천 및 재추천 |
| **매칭·거래** | 기부 제안·요청, 수락·거절·철회, 거래 수량 변경, 전달 일정 및 완료 상태 관리 |
| **실시간 채팅** | STOMP WebSocket 기반 메시지 송수신, 이전 메시지 조회 및 읽음 처리 |
| **알림** | 서비스 내 알림, 읽음 처리, 알림 설정 및 Firebase Web Push |
| **기부 기록** | 완료된 기부 내역 조회, 기부 내역서·확인서 확인 및 PDF 저장 |


<br/>

## 🧩 핵심 기술 및 설계


### Frontend Architecture

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

화면, 서버 상태 관리, API 요청 로직을 분리하고 TanStack Query를 통해 서버 데이터를 일관되게 관리합니다.


<br/>

### 역할별 서비스 구조

- 기부자와 복지기관의 이용 목적에 맞춰 페이지와 레이아웃 분리

- `DonorLayout`, `OrganizationLayout`, 공통 레이아웃을 활용한 화면 구조 재사용

- 인증 상태와 사용자 역할에 따른 페이지 접근 제어

- 채팅·알림·거래 상세 등 공통 기능 공유


<br/>

### Axios 기반 인증 세션 관리

- 공통 Axios Instance를 통한 API 요청 관리

- Access Token을 요청 헤더에 자동 적용

- `401` 응답 발생 시 Refresh Token을 이용해 Access Token 재발급

- 토큰 재발급 후 실패했던 기존 요청 재시도

- 동시에 발생한 여러 `401` 응답의 중복 Refresh 요청 방지

- 네트워크 오류와 Refresh Token 거절을 구분해 불필요한 로그아웃 방지

- 이전 인증 세션에서 시작된 Refresh 응답이 새로운 로그인 세션을 덮어쓰지 않도록 세션 일관성 보호


<br/>

### TanStack Query 기반 서버 상태 관리

- 조회 작업은 Query, 등록·수정·삭제 작업은 Mutation Hook으로 분리

- Query Key와 Cache Invalidation을 활용한 서버 데이터 동기화

- API 요청 로직과 UI 렌더링 로직 분리

- 도메인별 Query·Mutation Hook을 통한 유지보수성 향상


<br/>

### STOMP WebSocket 기반 실시간 채팅

- 채팅방과 이전 메시지는 REST API로 조회

- 실시간 메시지는 STOMP WebSocket으로 송수신

- 채팅방별 메시지 구독 및 읽음 상태 관리

- 인증된 사용자 세션을 기반으로 WebSocket 연결 관리


<br/>

### FCM 기반 알림 및 Web Push

- 알림 목록, 미읽음 개수, 개별·전체 읽음 처리 제공

- 매칭·채팅 알림 수신 설정 지원

- Firebase Cloud Messaging과 Service Worker를 활용한 브라우저 푸시 알림

- 로그인·로그아웃 및 계정 변경에 따른 푸시 등록 상태 관리


<br/>

### 사용자 경험 개선

- `useDeferredValue`를 활용해 검색 입력 중 화면 반응성 개선

- 일부 목록 이미지에 지연 로딩 적용

- TanStack Query 캐시 동기화를 통한 화면 데이터 일관성 유지

- 모바일 인앱 브라우저에서 PDF 저장이 제한될 경우 외부 브라우저 이용 안내

<br/>
<details>
<summary><b>📡 주요 API 도메인 보기</b></summary>

<br/>

| 도메인 | 주요 기능 |
| --- | --- |
| **Auth** | 로그인, 회원가입, 이메일 인증, 토큰 재발급 |
| **Donor** | 기부자 프로필, 기부 물품, 기부 내역 |
| **Organization** | 기관 프로필, 필요 물품, 기관 상세 |
| **Match** | 제안·요청, 수락·거절·철회, 수량 및 전달 일정 관리 |
| **Chat** | 채팅방·메시지 조회, 읽음 처리, 실시간 메시지 |
| **Notification** | 알림 조회·읽음 처리, 알림 설정, Web Push 등록 |
| **Recommendation** | 추천 기관 조회 및 추천 결과 재계산 |

</details>


<br/>

## 🛠 기술 스택

| 구분 | 기술 |
| --- | --- |
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS 4, CSS Design Tokens |
| **Routing** | React Router 7 |
| **State** | TanStack Query 5, Zustand |
| **HTTP** | Axios |
| **Realtime** | STOMP WebSocket (`@stomp/stompjs`) |
| **Push** | Firebase Cloud Messaging |
| **Quality** | Oxlint, TypeScript |
| **Package Manager** | pnpm |
| **Deployment** | Vercel |


<br/>

## 📁 프로젝트 구성

```text
src/
├── apis/                       # 서버 API 통신 레이어
│   ├── auth/                   # 로그인·회원가입·토큰 재발급
│   ├── chat/                   # 채팅방·메시지 API
│   ├── items/                  # 물품 카테고리 등 메타데이터 API
│   ├── matches/                # 매칭·거래 API
│   ├── organization/           # 기관 정보·필요 물품 API
│   └── users/                  # 사용자 계정 API
│
├── app/
│   └── providers/              # Query 등 전역 Provider
│
├── assets/
│   ├── images/                 # 이미지 리소스
│   └── logo/                   # 서비스 로고
│
├── components/
│   ├── common/                 # 공통 UI 컴포넌트
│   ├── item/                   # 물품 관련 컴포넌트
│   └── onboarding/             # 로그인·회원가입 컴포넌트
│
├── constants/                  # 공통 상수와 디자인 토큰
│
├── features/
│   ├── auth/                   # 인증과 세션 관리
│   ├── donor/                  # 기부자·기부 물품 기능
│   ├── matches/                # 매칭·거래 처리
│   └── notifications/          # 알림과 Web Push
│
├── hooks/
│   ├── auth/                   # 인증 Hook
│   ├── chat/                   # 실시간 채팅 Hook
│   ├── matches/                # 매칭 Hook
│   ├── mutations/              # 서버 상태 변경 Mutation
│   ├── onboarding/             # 로그인·회원가입 Hook
│   ├── organization/           # 기관 관련 Hook
│   └── queries/                # 서버 데이터 조회 Query
│
├── layouts/                    # 기부자·기관·공통 레이아웃
│
├── pages/
│   ├── donor/                  # 기부자 화면
│   ├── organization/           # 복지기관 화면
│   ├── login/                  # 로그인 화면
│   ├── onboarding/             # 회원가입 화면
│   └── shared/                 # 채팅·알림·거래 공통 화면
│
├── routes/                     # 라우팅과 접근 제어
├── styles/                     # 전역 스타일과 디자인 토큰
├── types/                      # API·도메인 TypeScript 타입
└── utils/                      # 공통 유틸리티
```


<br/>

## 💻 로컬 실행 방법



### 요구 사항

- Node.js

- pnpm


<br/>

### 설치 및 실행

```bash
git clone https://github.com/IT-SSUM/FE.git
cd FE

pnpm install
```

프로젝트 루트에 `.env` 파일을 생성하고 백엔드 API 주소를 설정합니다.

```env
VITE_API_BASE_URL=http://localhost:8080
```

개발 서버를 실행합니다.

```bash
pnpm dev
```


<br/>

### 명령어

```bash
pnpm dev       # 개발 서버 실행
pnpm lint      # 정적 코드 검사
pnpm build     # 프로덕션 빌드
pnpm preview   # 빌드 결과 미리보기
```

> `.env` 등 환경별 설정에 포함된 비밀정보는 저장소에 커밋하지 않습니다.  
> 일부 기능을 사용하려면 백엔드 서버 및 Firebase 설정이 필요합니다.


<br/>

## 🌐 배포

- **서비스:** https://itssum.site

- **Frontend:** Vercel

- **배포 흐름:** 작업 브랜치 → `develop` 통합 및 검증 → `main` 반영 → Production 배포


<br/>

## 🤝🏻 협업 방식

- **브랜치:** `main`, `develop`, `feat/*`, `fix/*`, `refactor/*`, `design/*`

- **작업 흐름:** Issue → Branch → Commit → Pull Request → Review → Merge

- **커밋:** `type: 작업 내용` 또는 `[Type] 작업 내용` 형식을 사용하며, `feat` / `[Feat]`, `fix` / `[Fix]`, `refactor` / `[Refactor]`, `design` / `[Design]`, `docs` / `[Docs]`, `test` / `[Test]`, `chore` / `[Chore]` 등 작업 유형과 내용을 명시

- **PR:** 변경 내용, 관련 이슈, 검증 결과를 기록한 뒤 리뷰를 거쳐 `develop`에 통합
- **리뷰:** CodeRabbit과 팀 리뷰를 통해 PR 단위로 변경사항을 점검하고, 유효한 리뷰 사항은 후속 커밋으로 반영
- **검증:** Merge 전 `pnpm lint`, `pnpm build` 및 변경 기능 확인

<details>
<summary><b>📌 Git·Commit·PR 컨벤션 자세히 보기</b></summary>

<br/>


<br/>

### Branch

```text
main
 ↑
develop
 ↑
feat/* · fix/* · refactor/* · design/*
```

- `main`: Production 배포 브랜치

- `develop`: 기능 통합 및 검증 브랜치

- 작업 브랜치는 `develop`을 기준으로 생성

- 브랜치명은 `{type}/{short-description}` 형식과 `kebab-case` 사용


<br/>

### Commit

다음 두 가지 형식을 모두 사용합니다.

```text
type: 작업 내용
```

```text
[Type] 작업 내용
```

| Type | 설명 |
| --- | --- |
| `feat` / `[Feat]` | 새로운 기능 구현 및 API 연동 |
| `fix` / `[Fix]` | 버그 및 오류 수정 |
| `refactor` / `[Refactor]` | 기능 변경 없는 코드 구조 개선 |
| `perf` / `[Perf]` | 성능 개선 |
| `style` / `[Style]` | 코드 스타일 및 포맷 수정 |
| `design` / `[Design]` | UI·UX 변경 |
| `docs` / `[Docs]` | 문서 작성 및 수정 |
| `test` / `[Test]` | 테스트 코드 작성 및 수정 |
| `chore` / `[Chore]` | 환경 설정 및 기타 작업 |
| `rename` / `[Rename]` | 파일 및 폴더명 변경 |
| `remove` / `[Remove]` | 불필요한 코드 및 파일 제거 |


<br/>

### Pull Request

- 기능 단위로 PR 분리

- PR 본문에 주요 변경 내용과 연동 API 기록

- 리뷰 사항을 반영한 뒤 `develop`에 통합

- 병합 전 `pnpm lint`, `pnpm build` 및 변경 기능 확인

</details>
