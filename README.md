# ISSUM Frontend

ISSUM(이씀)은 개인에게 남는 사용 가능한 물품과 해당 물품을 필요로 하는 복지기관을 연결하는 지역사회 자원순환 및 나눔 플랫폼입니다.

이번 초기세팅은 화면 퍼블리싱 전 단계로, React/TypeScript/Vite 기반 프로젝트 구조와 라우터, 전역 Provider, 공통 API 인스턴스를 준비합니다.

## 기술 스택

- React
- TypeScript
- Vite
- pnpm
- React Router
- TanStack Query
- Axios
- Zustand
- Tailwind CSS

## 실행 방법

```bash
pnpm install
pnpm dev
```

## 검증 명령

```bash
pnpm lint
pnpm build
```

## 환경 변수

`.env`는 Git에 포함하지 않습니다. 필요한 값은 `.env.example`을 참고해 로컬에서 생성합니다.

```bash
VITE_API_BASE_URL=http://localhost:8080
```

## 폴더 구조

```text
src/
├─ app/
│  ├─ providers/
│  └─ router/
├─ assets/
│  ├─ icons/
│  └─ images/
├─ components/
│  ├─ common/
│  ├─ item/
│  └─ recommendation/
├─ constants/
├─ features/
├─ layouts/
├─ pages/
│  ├─ donor/
│  ├─ organization/
│  └─ shared/
├─ services/
│  └─ api/
├─ stores/
├─ styles/
├─ types/
└─ utils/
```

## 담당 범위 메모

- A 담당: 프로젝트 기본세팅, 기부자 서비스 화면 기반
- B 담당: Auth/JWT/ProtectedRoute/RoleGuard, 기관 서비스, 거래/채팅/알림 상세 기능

현재 라우터는 인증 없이 경로 뼈대와 placeholder 화면만 제공합니다. 실제 인증 및 권한 분기는 추후 연결합니다.
