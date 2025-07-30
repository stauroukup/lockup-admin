# STAU Lockup Management System

STAU 토큰의 베스팅 및 락업 관리를 위한 관리자 대시보드입니다.

Polygon 네트워크의 스마트 컨트랙트와 연동하여 실시간 베스팅 현황을 모니터링하고 토큰 릴리즈를 관리합니다.

## 기술 스택

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Web3**: wagmi v2, viem v2, MetaMask 연동
- **Blockchain**: Polygon (Mainnet/Amoy Testnet)
- **Database ORM**: TypeORM
- **Database**: PostgreSQL
- **Authentication**: 커스텀 인증 시스템

## 설정 방법

### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

````env
# Vercel Upstash Redis Configuration
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
KV_URL=

# Blockchain Configuration
NEXT_PUBLIC_NETWORK=testnet | mainnet

# 베스팅 컨트랙트 주소들 (Polygon 네트워크)
NEXT_PUBLIC_VESTING_TOKEN_ADDRESS=
NEXT_PUBLIC_VESTING_MANAGER_ADDRESS=
NEXT_PUBLIC_VESTING_ECOSYSTEM_ADDRESS=
NEXT_PUBLIC_VESTING_FOUNDATION_ADDRESS=
NEXT_PUBLIC_VESTING_PRIVATE_INVESTOR_ADDRESS=
NEXT_PUBLIC_VESTING_TEAM_ADDRESS=
NEXT_PUBLIC_VESTING_MARKETING_ADDRESS=
NEXT_PUBLIC_VESTING_ADVISOR_ADDRESS=

### 2. 종속성 설치 및 실행

```bash
# 종속성 설치
npm install

# 개발 서버 실행
npm run dev
````

## 주요 기능

- 📊 **대시보드**: STAU 토큰 베스팅 현황 및 전체 통계 확인
- 🔐 **토큰 릴리즈**: 베스팅 일정에 도달한 토큰의 개별 릴리즈 관리
- 📈 **베스팅 모니터링**: 6개 베스팅 컨트랙트별 상세 진행 상황 추적
- 💼 **월렛 연결**: MetaMask 지갑 연결 및 Polygon 네트워크 관리
- ⚙️ **설정**: 시스템 설정 및 관리자 계정 관리

## 프로젝트 구조

```
src/
├── app/                 # Next.js App Router 페이지
│   ├── api/            # API 라우트 (인증 등)
│   ├── login/          # 로그인 페이지
│   ├── settings/       # 설정 페이지
│   ├── token/          # 토큰 릴리즈 페이지
│   ├── layout.tsx      # 루트 레이아웃
│   └── page.tsx        # 메인 대시보드
├── components/         # 재사용 가능한 컴포넌트
│   ├── admin/          # 어드민 레이아웃 및 사이드바
│   ├── auth/           # 인증 관련 컴포넌트
│   ├── ui/             # shadcn/ui 컴포넌트
│   ├── vesting/        # 베스팅 관련 컴포넌트
│   └── web3/           # 지갑 연결 및 Web3 컴포넌트
├── entities/           # TypeORM 엔티티
├── hooks/              # 커스텀 훅 (베스팅 데이터 등)
├── lib/                # 유틸리티 함수 및 설정
│   ├── abi/            # 스마트 컨트랙트 ABI
│   ├── auth.ts         # 인증 로직
│   ├── db.ts           # 데이터베이스 설정
│   └── web3-config.ts  # Web3 및 컨트랙트 설정
└── migrations/         # 데이터베이스 마이그레이션
```

## 개발 정보

- **Port**: 3000
- **Database**: vercel kv

## 베스팅 컨트랙트 정보

### 지원하는 베스팅 컨트랙트

1. **Ecosystem**: 생태계 발전을 위한 토큰
2. **Foundation**: 재단 운영을 위한 토큰
3. **Private Investor**: 사모투자자를 위한 토큰
4. **Team**: 팀 및 개발진을 위한 토큰
5. **Marketing**: 마케팅 및 홍보를 위한 토큰
6. **Advisor**: 어드바이저를 위한 토큰

### 주요 기능

- 실시간 베스팅 진행률 모니터링
- 릴리즈 가능한 토큰 자동 계산
- 컨트랙트별 개별 토큰 릴리즈
- 네트워크 자동 전환 (Polygon)
- 주소 복사 및 익스플로러 연결

## 개발 정보

- **Network**: Polygon (Mainnet/Amoy Testnet)
- **Frontend**: Next.js 15 + TypeScript + wagmi v2
- **UI**: Tailwind CSS + Shadcn UI
- **Database**: PostgreSQL + TypeORM
- **Web3**: viem v2 + wagmi v2
