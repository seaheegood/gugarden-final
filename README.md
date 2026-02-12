# 구의정원 (GuGarden)

> 테라리움/비바리움 전문 이커머스 플랫폼

식물 인테리어 브랜드 "구의정원"의 온라인 쇼핑몰입니다.
상품 조회부터 결제, 관리자 대시보드까지 **풀스택 단독 개발**한 프로젝트입니다.

---

## 목차

1. [기술 스택](#1-기술-스택)
2. [시스템 아키텍처](#2-시스템-아키텍처)
3. [프로젝트 구조](#3-프로젝트-구조)
4. [DB 설계](#4-db-설계)
5. [API 설계](#5-api-설계)
6. [인증/인가](#6-인증인가)
7. [핵심 비즈니스 로직](#7-핵심-비즈니스-로직)
8. [프론트엔드 구조](#8-프론트엔드-구조)
9. [실행 방법](#9-실행-방법)
10. [배포](#10-배포)

---

## 1. 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| **Backend** | Spring Boot | 3.5.7 |
| | Java | 21 |
| | Spring Security | 6.x |
| | Spring Data JPA (Hibernate) | 6.6.x |
| | Gradle | 9.3.1 |
| **Frontend** | React | 19.2.0 |
| | React Router DOM | 7.12.0 |
| | Vite | 7.2.4 |
| | Tailwind CSS | 4.1.18 |
| | Axios | 1.13.2 |
| **Database** | MySQL | 8.0 |
| **인증** | JWT (jjwt 0.12.5) + httpOnly 쿠키 | - |
| | OAuth2 (Naver) | - |
| **결제** | NaverPay API, TossPay API | - |

---

## 2. 시스템 아키텍처

### 개발 환경

```
┌─────────────────────────────────────────────────────┐
│                    Client (React)                    │
│               http://localhost:3000                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ 상품 조회 │  │ 주문/결제 │  │ 관리자 대시보드    │  │
│  └──────────┘  └──────────┘  └───────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │  Vite Proxy (/api, /uploads)
                       ▼
┌─────────────────────────────────────────────────────┐
│               Server (Spring Boot)                   │
│               http://localhost:8080                   │
│                                                      │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │ Controller  │→│   Service     │→│ Repository   │  │
│  │ (REST API)  │  │ (비즈니스)    │  │ (JPA)       │  │
│  └────────────┘  └──────────────┘  └──────┬──────┘  │
│  ┌────────────┐  ┌──────────────┐         │         │
│  │ Security   │  │ FileUpload   │         │         │
│  │ (JWT+OAuth)│  │ Service      │         │         │
│  └────────────┘  └──────────────┘         │         │
└───────────────────────────────────────────┼─────────┘
                                            ▼
                                   ┌──────────────┐
                                   │  MySQL 8.0   │
                                   │  gugarden DB │
                                   └──────────────┘
```

### 운영 환경

```
사용자 ─→ https://gugarden.hongshin99.com
              │
     ┌────────┴────────┐
     │  Apache2 (SSL)  │
     │  리버스 프록시    │
     └────────┬────────┘
              │
   ┌──────────┼──────────┐
   │          │          │
   ▼          ▼          ▼
 dist/     :9090/api   uploads/
(정적파일) (Spring Boot) (이미지)
              │
              ▼
     ┌──────────────┐
     │  MySQL 8.0   │
     │ (외부 DB 서버)│
     └──────────────┘
```

---

## 3. 프로젝트 구조

```
gugarden-final/
├── client/                          # React 프론트엔드
│   ├── src/
│   │   ├── api/index.js             # Axios 인스턴스 (인터셉터, 토큰 자동 주입)
│   │   ├── context/AuthContext.jsx   # 전역 인증 상태 관리
│   │   ├── components/              # 공통 컴포넌트 (Header, Footer, Layout)
│   │   ├── pages/                   # 페이지 컴포넌트
│   │   │   ├── admin/               #   관리자 페이지 5개
│   │   │   ├── Home.jsx             #   메인 페이지
│   │   │   ├── ProductList.jsx      #   카테고리별 상품 목록
│   │   │   ├── ProductDetail.jsx    #   상품 상세
│   │   │   ├── Cart.jsx             #   장바구니
│   │   │   ├── Checkout.jsx         #   주문/결제
│   │   │   ├── MyPage.jsx           #   마이페이지
│   │   │   └── ...                  #   기타 (로그인, 회원가입, 렌탈 등)
│   │   └── App.jsx                  # 라우팅 정의
│   └── vite.config.js               # 개발 서버 + 프록시 설정
│
└── server/                          # Spring Boot 백엔드
    ├── build.gradle
    └── src/main/java/com/gugarden/
        ├── GugardenApplication.java
        ├── config/
        │   ├── SecurityConfig.java   # Spring Security 설정
        │   └── WebConfig.java        # CORS + 정적 파일 서빙
        ├── security/
        │   ├── JwtTokenProvider.java  # JWT 생성/검증 + OAuth state 토큰
        │   ├── JwtAuthenticationFilter.java  # 쿠키 기반 토큰 검증 필터
        │   ├── CookieUtil.java        # httpOnly 쿠키 생성/삭제
        │   ├── AuthCodeStore.java     # OAuth 일회용 코드 저장소
        │   └── UserPrincipal.java     # 인증 주체 객체
        ├── entity/                    # JPA 엔티티 (8개)
        ├── repository/                # Spring Data JPA 인터페이스 (8개)
        ├── dto/request/               # 요청 DTO (11개)
        ├── service/                   # 비즈니스 로직 (8개, TokenBlacklistService 포함)
        ├── controller/                # REST 컨트롤러 (8개)
        └── exception/                 # 글로벌 예외 처리
```

---

## 4. DB 설계

### ERD

```
users (1) ──── (N) cart_items (N) ──── (1) products
  │                                        │
  │                                   (1)──┤──(N) product_images
  │                                        │
  └──── (N) orders (1) ──── (N) order_items (N) ──── products

categories (1) ──── (N) products

rental_inquiries (독립 테이블)
```

### 테이블 설계 (8개)

| 테이블 | 설명 | 주요 컬럼 |
|--------|------|-----------|
| `users` | 회원 | email(UNIQUE), password, role(user/admin), provider(local/naver/kakao) |
| `categories` | 상품 카테고리 | name, slug(UNIQUE) — terrarium, vivarium, kit |
| `products` | 상품 | price, sale_price, stock, is_active, is_featured, FK→categories |
| `product_images` | 상품 이미지 | image_url, sort_order, FK→products (CASCADE) |
| `cart_items` | 장바구니 | quantity, UNIQUE(user_id, product_id), FK→users/products (CASCADE) |
| `orders` | 주문 | order_number(UNIQUE), total_amount, shipping_fee, status(6단계), 수령인 정보 |
| `order_items` | 주문 상품 | product_name, product_price (주문 시점 스냅샷), FK→orders (CASCADE) |
| `rental_inquiries` | 렌탈 문의 | name, email, phone, status(new/contacted/completed) |

### 설계 의도

- **order_items에 product_name/product_price 저장**: 상품 정보가 변경되어도 주문 시점의 가격을 보존
- **users 소프트 삭제**: 탈퇴 시 개인정보 익명화, 주문 기록은 유지 (정산/통계 목적)
- **cart_items UNIQUE 제약**: 동일 상품 중복 추가 시 수량만 증가
- **product_images 분리**: 상품당 최대 10개 이미지, 정렬 순서 관리

---

## 5. API 설계

총 **40+개 엔드포인트**, RESTful 설계 원칙을 따릅니다.

### 5-1. 인증 (`/api/auth`)

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| POST | `/register` | - | 회원가입 → JWT 발급 |
| POST | `/login` | - | 로그인 → JWT 발급 |
| GET | `/me` | Bearer | 내 정보 조회 |
| PUT | `/me` | Bearer | 내 정보 수정 |
| PUT | `/password` | Bearer | 비밀번호 변경 |
| DELETE | `/me` | Bearer | 회원 탈퇴 (익명화) |
| GET | `/naver` | - | 네이버 OAuth 시작 |
| GET | `/naver/callback` | - | 네이버 OAuth 콜백 → 일회용 코드 발급 후 리다이렉트 |
| POST | `/exchange-code` | - | 일회용 코드 → JWT 쿠키 교환 |
| POST | `/logout` | - | 로그아웃 (쿠키 삭제) |

### 5-2. 상품 (`/api/products`)

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| GET | `/` | - | 전체 활성 상품 목록 (카테고리 JOIN) |
| GET | `/featured` | - | 추천 상품 (is_featured=true) |
| GET | `/category/{slug}` | - | 카테고리별 상품 |
| GET | `/{id}` | - | 상품 상세 + 이미지 배열 |
| POST | `/` | Admin | 상품 등록 (썸네일 업로드) |
| PUT | `/{id}` | Admin | 상품 수정 |
| DELETE | `/{id}` | Admin | 상품 삭제 |
| POST | `/{id}/images` | Admin | 상품 이미지 추가 (최대 10개) |
| DELETE | `/images/{imageId}` | Admin | 상품 이미지 삭제 |

### 5-3. 장바구니 (`/api/cart`)

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| GET | `/` | Bearer | 장바구니 조회 (items + totalAmount) |
| POST | `/` | Bearer | 장바구니 추가 (기존 상품이면 수량 합산) |
| PUT | `/{id}` | Bearer | 수량 변경 |
| DELETE | `/{id}` | Bearer | 항목 삭제 |
| DELETE | `/` | Bearer | 장바구니 전체 비우기 |

### 5-4. 주문 (`/api/orders`)

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| GET | `/` | Bearer | 내 주문 목록 |
| GET | `/{id}` | Bearer | 주문 상세 (주문 상품 포함) |
| POST | `/` | Bearer | 주문 생성 (재고 확인 → 차감 → 장바구니 비우기) |
| PUT | `/{id}/cancel` | Bearer | 주문 취소 (pending/paid만 가능, 재고 복구) |

### 5-5. 결제 (`/api/payments`)

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| POST | `/prepare` | Bearer | NaverPay 결제 예약 |
| POST | `/approve` | Bearer | NaverPay 결제 승인 |
| POST | `/cancel` | Bearer | NaverPay 결제 취소 |
| GET | `/status/{orderId}` | Bearer | 결제 상태 조회 |
| POST | `/toss/prepare` | Bearer | TossPay 결제 준비 |
| POST | `/toss/confirm` | Bearer | TossPay 결제 확인 (금액 검증) |
| POST | `/toss/cancel` | Bearer | TossPay 결제 취소 |

### 5-6. 렌탈 문의 (`/api/rental`)

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| POST | `/inquiry` | - | 렌탈 문의 접수 |

### 5-7. 관리자 (`/api/admin`) — 전체 Admin 권한 필요

| 카테고리 | 엔드포인트 | 설명 |
|----------|-----------|------|
| 대시보드 | GET `/dashboard` | 통계 (주문 수, 매출, 회원 수, 대기 주문) |
| 주문 | GET `/orders` | 페이지네이션 + 상태 필터 |
| | GET `/orders/{id}` | 주문 상세 (주문자 정보 포함) |
| | PUT `/orders/{id}/status` | 상태 변경 (취소 시 자동 재고 복구) |
| 상품 | GET `/products` | 페이지네이션 + 카테고리/검색 필터 |
| | POST `/products` | 상품 등록 (파일 업로드) |
| | PUT `/products/{id}` | 상품 수정 |
| | DELETE `/products/{id}` | 삭제 또는 비활성화 (주문 이력에 따라) |
| | GET/POST `/products/{id}/images` | 이미지 관리 |
| | DELETE `/products/images/{id}` | 이미지 삭제 |
| 회원 | GET `/users` | 페이지네이션 + 검색 |
| | GET `/users/{id}` | 회원 상세 + 최근 주문 |
| | PUT `/users/{id}/role` | 역할 변경 (본인 변경 불가) |
| 카테고리 | GET `/categories` | 카테고리 목록 + 상품 수 |
| 렌탈 | GET `/rental-inquiries` | 문의 목록 (페이지네이션 + 상태 필터) |
| | GET `/rental-inquiries/{id}` | 문의 상세 |
| | PUT `/rental-inquiries/{id}/status` | 상태 변경 |
| | DELETE `/rental-inquiries/{id}` | 문의 삭제 |

---

## 6. 인증/인가

### JWT + httpOnly 쿠키 기반 Stateless 인증

```
[클라이언트]                              [서버]
     │                                      │
     │  POST /api/auth/login               │
     │  { email, password }     ──────────→ │  BCrypt 검증
     │                                      │  JWT 생성 (id, email, role)
     │  ←── Set-Cookie: auth_token=JWT     │  httpOnly 쿠키로 전달
     │      (httpOnly, Secure, SameSite)    │
     │                                      │
     │  GET /api/cart                       │
     │  Cookie: auth_token=JWT  ──────────→ │  JwtAuthenticationFilter
     │                                      │  → 쿠키에서 토큰 추출
     │                                      │  → 토큰 검증 + 블랙리스트 체크
     │                                      │  → SecurityContext에 UserPrincipal 설정
     │  ←────────────── { items }           │
```

- **토큰 저장**: httpOnly 쿠키 (`auth_token`) — XSS로 토큰 탈취 불가
- **토큰 생성**: HMAC-SHA256 서명, 만료 7일
- **토큰 구조**: `{ id, email, role, iat, exp }`
- **토큰 무효화**: 비밀번호 변경, 회원 탈퇴, 역할 변경 시 블랙리스트 등록
- **비밀번호**: BCrypt (strength 10)
- **권한 체계**: `ROLE_USER`, `ROLE_ADMIN`

### 소셜 로그인 (OAuth2 — 네이버)

```
[사용자] → [GET /api/auth/naver]
              → 서명된 state 토큰 생성 (CSRF 방지, 5분 만료)
              → 네이버 인증 페이지로 리다이렉트
         → [네이버 로그인/동의]
         → [GET /api/auth/naver/callback]
              → state 토큰 검증 (CSRF 방지)
              → 네이버 API로 사용자 정보 조회
              → 계정 생성 또는 연동
              → JWT를 일회용 코드로 변환
              → 클라이언트로 리다이렉트 (?code=xxx)
         → [POST /api/auth/exchange-code]
              → 일회용 코드 → JWT 교환
              → httpOnly 쿠키로 JWT 설정
```

- **CSRF 방지**: OAuth state 파라미터를 서명된 JWT로 검증
- **토큰 노출 방지**: URL에 JWT 대신 일회용 코드 사용 후 교환
- 기존 이메일과 동일하면 계정 연동 (provider 업데이트)
- 새 사용자면 자동 회원가입

### Spring Security 접근 제어

```java
// 공개 API
.requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
.requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()

// 관리자 전용
.requestMatchers("/api/admin/**").hasRole("ADMIN")
.requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")

// 로그인 필수
.requestMatchers("/api/cart/**").authenticated()
.requestMatchers("/api/orders/**").authenticated()
```

---

## 7. 핵심 비즈니스 로직

### 7-1. 주문 생성 프로세스 (`@Transactional`)

```
1. 배송 정보 유효성 검사
2. 장바구니 조회 (활성 상품만)
3. 재고 확인 (부족 시 에러 + 상품명/재고 수 안내)
4. 총 금액 계산 (sale_price 우선 적용)
5. 배송비 계산
     → 50,000원 이상: 무료
     → 50,000원 미만: 3,000원
6. 주문 생성 (주문번호: GG + YYMMDD + 6자리 랜덤)
7. 주문 상품 저장 (가격 스냅샷)
8. 재고 차감 (Product.stock -= quantity)
9. 장바구니 비우기
```

> 전체 과정이 하나의 트랜잭션으로 처리되어, 중간에 실패하면 모두 롤백됩니다.

### 7-2. 주문 취소 프로세스 (`@Transactional`)

```
1. 주문 소유권 확인 (본인 주문인지)
2. 취소 가능 상태 확인 (pending, paid만 가능)
3. 재고 복구 (Product.stock += quantity)
4. 주문 상태 → cancelled
```

### 7-3. 주문 상태 흐름

```
pending → paid → preparing → shipped → delivered
   │        │
   └────────┴──→ cancelled (재고 자동 복구)
```

### 7-4. 결제 연동 (NaverPay / TossPay)

```
                  ┌─── API 키 미설정 ──→ 테스트 모드 (자동 승인)
주문 생성 → 결제 준비 ─┤
                  └─── API 키 설정됨 ──→ PG사 API 호출
                                              │
                              결제 승인 ← 사용자 결제 완료
                                  │
                          주문 상태 → paid
                          paid_at 기록
```

- 테스트 모드: API 키가 비어있으면 자동으로 결제 성공 처리
- TossPay 금액 검증: 서버에 저장된 주문 금액과 클라이언트 전달 금액 비교

### 7-5. 상품 삭제 정책

```
주문 이력 존재? ── Yes → 비활성화 (is_active = false, 데이터 보존)
              └── No  → 완전 삭제 (DB에서 제거)
```

### 7-6. 회원 탈퇴 정책

```
1. 장바구니 삭제
2. 개인정보 익명화:
   - email → withdrawn_{id}_{timestamp}@deleted.local
   - name → "탈퇴회원"
   - password, phone, address 등 → NULL
3. 주문 기록은 유지 (user_id FK 보존)
```

### 7-7. 파일 업로드

- 허용 타입: jpeg, jpg, png, gif, webp
- 최대 크기: 10MB (파일), 50MB (요청)
- 저장 경로: `./uploads/`
- 파일명: `thumbnail-{timestamp}-{uuid}.{ext}`
- 서빙: `/uploads/**` → 정적 리소스 매핑

---

## 8. 프론트엔드 구조

### 라우팅 (총 20개 페이지)

| 구분 | 경로 | 컴포넌트 |
|------|------|----------|
| **공개** | `/` | Home (히어로 + 추천 상품) |
| | `/terrarium`, `/vivarium`, `/kit` | ProductList (카테고리별) |
| | `/product/:id` | ProductDetail (상세 + 이미지) |
| | `/rental` | Rental (렌탈 문의 폼) |
| | `/login`, `/register` | 로그인/회원가입 |
| **회원** | `/cart` | Cart (장바구니) |
| | `/checkout` | Checkout (배송 정보 + 결제) |
| | `/mypage` | MyPage (프로필 + 주문 내역) |
| | `/order/:id` | OrderDetail (주문 상세) |
| | `/payment/complete` | 결제 완료 |
| **관리자** | `/admin` | Dashboard (통계) |
| | `/admin/products` | 상품 CRUD |
| | `/admin/orders` | 주문 관리 |
| | `/admin/users` | 회원 관리 |
| | `/admin/rental-inquiries` | 렌탈 문의 관리 |

### 전역 상태 (AuthContext)

```jsx
// 제공하는 값
{ user, loading, isAuthenticated, isAdmin,
  login, register, logout, updateUser, socialLogin }

// 인증: httpOnly 쿠키 (브라우저가 자동 전송, JS 접근 불가)
// 401 응답 시: /login 리다이렉트 (Axios 인터셉터)
```

### API 통신 (Axios)

- Base URL: `/api` (개발: Vite 프록시 → 8080 / 운영: Apache 프록시 → 9090)
- `withCredentials: true` — 쿠키 자동 포함
- 응답 인터셉터: 401 발생 시 로그아웃 처리
- FormData 전송 시 Content-Type 자동 처리

---

## 9. 실행 방법

### 사전 요구사항

- Java 21+
- Node.js 18+
- MySQL 8.0 (gugarden 데이터베이스 생성 + schema.sql 실행)

### 백엔드

```bash
cd server
./gradlew bootRun
# http://localhost:8080 에서 실행
```

### 프론트엔드

```bash
cd client
npm install
npm run dev
# http://localhost:3000 에서 실행
```

### DB 초기화

```sql
-- server/src/main/resources/schema.sql 실행
-- 기본 카테고리 3개 자동 생성: terrarium, vivarium, kit
```

---

## 10. 배포

운영 사이트: **https://gugarden.hongshin99.com**

자세한 배포 가이드는 [DEPLOY.md](./DEPLOY.md)를 참고하세요.

### 빠른 업데이트 배포

```bash
ssh root@<서버IP>
cd /var/www/gugarden/repo
git pull origin main
cd client && npm ci && npm run build
cd ../server && ./gradlew clean build -x test --no-daemon
systemctl restart gugarden
```
