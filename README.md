# Frontend

개인 블로그/포트폴리오 사이트 프론트엔드입니다. React + Vite로 구성된 클라이언트 전용 앱이며, API·인증·DB는 별도 백엔드(Spring Boot 등)와 연동합니다.

## 기술 스택

- **React 19** + **TypeScript**
- **Vite 6**
- **Tailwind CSS 4**
- **React Router 7**
- **Motion** (Framer Motion 계열, 애니메이션)
- **Lucide React** (아이콘)
- **date-fns** (날짜 포맷)

## 주요 기능

- **홈** – 인트로, 최신 포스트 미리보기
- **블로그** – 카테고리별 글 목록, 상세 보기
- **소개(About)** – 프로필, 기술 스택
- **문의(Contact)** – 이름/이메일/제목/내용 전송 (honeypot, 최소 체류 시간 등 스팸 방지)
- **관리자(Admin)** – 로그인 후 글·카테고리·사이트 설정 관리, 글 작성/수정 시 실제 글 보기 레이아웃으로 라이브 미리보기 편집
- **한/영 전환** – 네비·문구·Contact 문구 등 다국어

## 시작하기

### 요구 사항

- Node.js 18+
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (기본: http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview
```


## 프로젝트 구조

```
src/
├── components/     # Navbar, Layout, SidebarLeft/Right, PostCard 등
├── context/        # LanguageContext (언어·설정)
├── lib/             # api.ts (API 베이스 URL·fetch), date.ts (날짜 유틸)
├── pages/           # Home, Blog, PostDetail, About, Contact, Admin
├── types.ts         # 공용 타입
├── App.tsx
└── main.tsx
```

