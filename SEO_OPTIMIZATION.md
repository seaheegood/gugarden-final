# SEO & 성능 최적화

> 구의정원(GuGarden) 프로젝트에 적용한 SEO 및 성능 최적화 작업 기록

---

## 1. Meta Description 및 Open Graph 태그 추가

### 문제
- `<meta name="description">`이 없어 검색 결과에서 Google이 임의로 스니펫을 생성
- SNS 공유 시 제목/설명/이미지가 표시되지 않음

### 해결

#### 1-1. index.html에 기본 메타 태그 추가

```html
<meta name="description" content="구의정원 - 테라리움, 비바리움, 팔루다리움 전문 식물 인테리어 쇼핑몰..." />
<meta name="keywords" content="테라리움, 비바리움, 팔루다리움, 식물 인테리어, ..." />
<meta property="og:type" content="website" />
<meta property="og:title" content="구의정원 - GUGARDEN" />
<meta property="og:description" content="..." />
<meta property="og:image" content="/og-image.jpeg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="/og-image.jpeg" />
```

#### 1-2. react-helmet-async로 페이지별 동적 메타 태그

- `react-helmet-async` 패키지 설치
- `main.jsx`에서 `<HelmetProvider>`로 앱 전체를 감싸 Helmet 컨텍스트 제공
- `SEO.jsx` 컴포넌트를 만들어 각 페이지에서 title, description, image를 동적으로 변경

```jsx
// components/SEO.jsx
import { Helmet } from 'react-helmet-async'

export default function SEO({ title, description, image }) {
  const fullTitle = title ? `${title} | 구의정원` : DEFAULT_TITLE
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={ogImage} />
      ...
    </Helmet>
  )
}
```

**적용 페이지:** Home, ProductList(카테고리별), ProductDetail(상품명 동적), Rental, Ando, Login, Cart

### 기술 배경
- **react-helmet-async vs react-helmet**: react-helmet은 SSR 환경에서 메모리 누수 이슈가 있어 async 버전을 사용. React 18+ Concurrent Mode와 호환.
- **SPA에서 SEO의 한계**: CSR(Client-Side Rendering) 기반 SPA는 초기 HTML에 콘텐츠가 없어 크롤러가 JS를 실행해야 함. Google은 JS를 실행하지만, 카카오/네이버 등 일부 크롤러는 못할 수 있음. 완전한 SEO를 위해서는 SSR(Next.js) 또는 Prerendering이 필요.
- **og:image 절대경로**: SNS 크롤러는 상대경로를 인식하지 못하므로 배포 시 `https://도메인/og-image.jpeg` 형태의 절대 URL이 필요.

---

## 2. 이미지 WebP 변환 및 리사이징

### 문제
- 이미지 파일 합계 약 10MB (JPEG, 최대 6000x4000px)
- 페이지 로딩 시간 10초 이상
- Google Core Web Vitals의 LCP(Largest Contentful Paint) 점수 하락

### 해결

`cwebp` 도구로 JPEG → WebP 변환 + 최대 너비 1920px 리사이징:

```bash
cwebp -q 80 -resize 1920 0 home_main.jpeg -o home_main.webp
```

### 결과

| 파일 | JPEG | WebP (1920px) | 절감률 |
|------|------|---------------|--------|
| home_main | 2,603KB | 459KB | -82% |
| terrarium_main | 1,917KB | 178KB | -91% |
| rental_main | 1,729KB | 261KB | -85% |
| footer | 1,376KB | 198KB | -86% |
| paludarium_main | 1,025KB | 134KB | -87% |
| vivarium_main | 701KB | 114KB | -84% |
| elements_main | 633KB | 297KB | -53% |
| ando_main | 254KB | 130KB | -49% |
| **합계** | **10,237KB** | **1,771KB** | **-83%** |

이후 코드에서 모든 이미지 참조를 `.jpeg` → `.webp`로 변경.

### 기술 배경
- **WebP**: Google이 개발한 이미지 포맷. JPEG 대비 25-35% 작은 파일 크기로 동일 품질 유지. 대부분의 모던 브라우저가 지원 (IE 제외).
- **품질 옵션 (-q 80)**: 0-100 범위. 80은 육안으로 차이를 느끼기 어려우면서 파일 크기를 크게 줄이는 최적 지점.
- **리사이징 (1920px)**: 웹에서 풀스크린으로 표시해도 1920px이면 충분. 원본 6000px은 인쇄용 해상도로 웹에서는 불필요.
- **Core Web Vitals**: Google이 2021년부터 검색 순위에 반영하는 사용자 경험 지표. LCP(2.5초 이내), FID(100ms 이내), CLS(0.1 이내) 3가지.

---

## 3. Spring Boot API 응답 gzip 압축

### 문제
- API 응답(JSON)이 압축 없이 전송되어 불필요한 대역폭 사용

### 해결

`application.yml`에 압축 설정 추가:

```yaml
server:
  compression:
    enabled: true
    min-response-size: 1024
    mime-types: application/json,application/xml,text/html,text/plain,text/css,application/javascript
```

### 기술 배경
- **min-response-size: 1024**: 1KB 미만 응답은 압축 오버헤드가 이득보다 클 수 있어 제외.
- **Nginx와 중복?**: Nginx에서도 gzip을 적용하고 있지만, Nginx는 정적 파일(HTML/CSS/JS) 대상. Spring Boot 압축은 API 응답(JSON) 대상으로 역할이 다름.
- **gzip 동작 원리**: 클라이언트가 `Accept-Encoding: gzip` 헤더를 보내면 서버가 압축 응답. JSON 같은 텍스트 데이터는 60-80% 압축률.

---

## 4. Vite 빌드 최적화

### 문제
- React, React DOM, React Router가 메인 번들에 포함되어 번들 크기가 큼 (350KB)
- 라이브러리 코드가 변경될 때마다 전체 캐시 무효화

### 해결

`vite.config.js`에 vendor 청크 분리 설정:

```js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom', 'react-router-dom'],
      },
    },
  },
  cssCodeSplit: true,
},
```

### 결과
- 메인 번들: 350KB → 303KB (-13%)
- vendor 청크: 47KB (별도 파일, 장기 캐싱)

### 기술 배경
- **Code Splitting**: 하나의 큰 번들 대신 여러 작은 청크로 분리. 사용자가 필요한 코드만 로드.
- **vendor 청크 분리 이유**: react 등 라이브러리는 거의 변경되지 않음. 별도 파일로 분리하면 브라우저 캐시에 장기간 유지되어 재방문 시 다운로드 불필요.
- **Vite vs Webpack**: Vite는 개발 시 ES Module 기반 HMR로 빠르고, 빌드 시 Rollup 사용. Webpack보다 설정이 간단하고 빌드 속도가 빠름.
- **Tree Shaking**: Vite(Rollup)가 자동으로 사용하지 않는 코드를 제거. ES Module의 정적 분석 덕분에 가능.

---

## 5. Nginx 정적 파일 캐싱 개선

### 해결

```nginx
# WebP 파일도 캐싱 대상에 추가
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|webp)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# SVG도 gzip 압축 대상에 추가
gzip_types ... image/svg+xml;
```

### 기술 배경
- **immutable**: 브라우저에게 "이 파일은 절대 변경되지 않는다"고 알려줌. 조건부 요청(If-Modified-Since)조차 생략. Vite가 빌드 시 파일명에 해시를 포함(`index-D0OjBWoX.js`)하므로 내용이 바뀌면 파일명도 바뀜 → immutable 사용 가능.
- **expires 1y**: 1년간 캐시. 해시 기반 파일명 덕분에 안전.

---

## 6. og:image 최적화

### 문제
- 기존 og:image가 2362x2362 정사각형 (SNS 카드 비율 아님)
- 상대경로(`/gugarden.jpeg`)로 지정되어 SNS 크롤러가 인식 불가

### 해결
- `sips`(macOS 내장 도구)로 1200x630 크기의 OG 전용 이미지 생성 (258KB)
- `og:image:width`, `og:image:height` 메타 태그 추가
- `twitter:image` 태그 추가

### 기술 배경
- **1200x630**: Facebook, 카카오톡, Twitter 등 주요 SNS에서 권장하는 카드 이미지 크기 (1.91:1 비율).
- **og:image:width/height**: 크롤러가 이미지를 다운로드하기 전에 크기를 알 수 있어 렌더링 최적화에 도움.

---

## 7. H1 태그 SEO 최적화

### 문제
- H1 태그에 영문만 있어(`TERRARIUM`, `ANDO`) 한글 검색 키워드와 불일치
- 검색엔진이 페이지 주제를 정확히 파악하지 못함

### 해결

`sr-only`(screen-reader-only) 기법으로 디자인은 유지하면서 SEO 키워드 추가:

```jsx
<h1 className="hero-title">
  구의정원
  <span className="sr-only"> - 테라리움, 비바리움, 팔루다리움 전문 식물 인테리어</span>
</h1>
```

### 적용 결과

| 페이지 | 화면 표시 | 검색엔진이 읽는 H1 |
|--------|-----------|---------------------|
| Home | 구의정원 | 구의정원 - 테라리움, 비바리움, 팔루다리움 전문 식물 인테리어 |
| Terrarium | TERRARIUM | TERRARIUM - 밀폐된 유리 안의 작은 생태계 |
| Ando | ANDO | ANDO - 일산 테라리움 원데이 클래스 |
| Rental | RENTAL SERVICE | RENTAL SERVICE - 구의정원 테라리움 렌탈 |

### 기술 배경
- **sr-only**: Tailwind CSS 유틸리티. `position: absolute; width: 1px; height: 1px; overflow: hidden;`으로 화면에서 숨기되 스크린리더와 검색엔진은 읽을 수 있음. 접근성(a11y)에서도 중요한 기법.
- **H1 태그 규칙**: 페이지당 1개, 핵심 키워드 포함, title 태그와 유사하되 동일하지 않게.
- **hidden text 패널티 주의**: Google은 사용자를 속이려는 의도의 숨김 텍스트를 스팸으로 판단할 수 있음. sr-only는 접근성 목적이므로 허용되지만, 과도한 키워드 삽입은 피해야 함.

---

## 전체 최적화 요약

| 항목 | Before | After |
|------|--------|-------|
| Meta Description | 없음 | 페이지별 고유 description |
| OG 태그 | 없음 | title, description, image 완비 |
| 이미지 용량 | 10.2MB (JPEG) | 1.8MB (WebP) |
| 메인 번들 | 350KB (단일) | 303KB + 47KB vendor (분리) |
| API 압축 | 없음 | gzip (1KB 이상 자동) |
| H1 키워드 | 영문만 | 한글 키워드 포함 |
| 정적 캐싱 | webp 미포함 | webp 포함, immutable |
