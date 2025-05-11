# 실시간 뉴스 피드 (Next.js + Vercel 버전)

이 프로젝트는 Next.js와 Vercel을 활용하여 구현된 실시간 뉴스 피드 웹사이트입니다. n8n 또는 다른 외부 시스템에서 전송된 뉴스 데이터를 API를 통해 수신하고 실시간으로 표시합니다.

## 주요 기능

- 최신 뉴스가 상단에 표시되는 실시간 뉴스 피드
- 뉴스 데이터 시간순 정렬 (최신순)
- 다크모드/라이트모드 지원
- 뉴스 데이터 HTML 백업 기능
- 반응형 디자인 (모바일, 태블릿, 데스크톱 대응)
- 관리자 페이지를 통한 뉴스 수동 추가
- API 엔드포인트를 통한 뉴스 데이터 처리
- SWR을 이용한 자동 데이터 새로고침

## 기술 스택

- **Frontend**: Next.js, React, Tailwind CSS
- **API**: Next.js API Routes
- **데이터 저장소**: Vercel KV (Redis)
- **배포 플랫폼**: Vercel
- **상태 관리**: SWR (데이터 fetching)

## 설치 및 실행

1. 프로젝트 클론 및 의존성 설치:

```bash
git clone https://github.com/yourusername/realtime-news-feed.git
cd realtime-news-feed
npm install
```

2. 개발 서버 실행:

```bash
npm run dev
```

3. 브라우저에서 `http://localhost:3000` 접속

## 배포 방법

### Vercel에 배포하기

1. [Vercel](https://vercel.com)에 계정 생성 및 로그인
2. GitHub 저장소와 Vercel 연동
3. 새 프로젝트 생성 및 배포
4. Vercel KV 설정:
   - Vercel 대시보드 > 프로젝트 > Storage > KV Database 생성
   - 환경 변수 자동 설정 확인

## n8n과 연동하는 방법

n8n에서는 Next.js API Routes를 활용하여 뉴스 데이터를 쉽게 전송할 수 있습니다.

### HTTP 요청 노드 설정 방법

n8n에서 다음과 같이 HTTP 요청 노드를 설정합니다:

```json
{
  "url": "https://your-nextjs-app.vercel.app/api/news",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "title": "{{ $node[\"이전노드\"].json[\"title\"] }}",
    "author": "{{ $node[\"이전노드\"].json[\"author\"] }}",
    "pubDate": "{{ $node[\"이전노드\"].json[\"pubDate\"] }}",
    "link": "{{ $node[\"이전노드\"].json[\"link\"] }}"
  }
}
```

### 보안 고려사항

프로덕션 환경에서는 API 엔드포인트에 인증을 추가하는 것이 좋습니다:

1. 환경 변수에 API 키 설정
2. 요청 헤더에 API 키 포함 (Authorization 헤더)
3. API 엔드포인트에서 키 검증

## 데이터 형식

뉴스 데이터는 다음 형식을 따라야 합니다:

```json
{
  "title": "뉴스 제목",
  "author": "기자 이름",
  "pubDate": "2024-05-11T10:30:00Z", // ISO 8601 형식
  "link": "https://news-url.com/article"
}
```

## 주요 파일 및 디렉토리 구조

```
├── components/         # React 컴포넌트
│   ├── NewsCard.js     # 뉴스 카드 컴포넌트
│   ├── ThemeSwitch.js  # 다크모드 전환 컴포넌트
│   └── AdminNewsForm.js # 뉴스 추가 폼
├── pages/              # 페이지 컴포넌트
│   ├── index.js        # 메인 페이지
│   ├── admin.js        # 관리자 페이지
│   ├── _app.js         # App 컴포넌트
│   ├── _document.js    # Document 컴포넌트
│   └── api/            # API 라우트
│       ├── news.js     # 뉴스 API 엔드포인트
│       └── backup.js   # 백업 API 엔드포인트
├── styles/             # 스타일시트
│   └── globals.css     # 전역 스타일 (Tailwind)
├── utils/              # 유틸리티 함수
│   ├── initialData.js  # 초기 데이터
│   └── backupUtils.js  # 백업 관련 유틸리티
├── public/             # 정적 파일
├── next.config.js      # Next.js 설정
└── tailwind.config.js  # Tailwind CSS 설정
```

## 커스터마이징

### UI 테마 변경

`tailwind.config.js` 파일에서 색상 변수를 변경하여 테마를 조정할 수 있습니다:

```js
theme: {
  extend: {
    colors: {
      primary: {
        light: '#0066cc', // 라이트 모드 기본 색상
        dark: '#4d9fff',  // 다크 모드 기본 색상
      },
      // 다른 색상 변수들...
    }
  }
}
```

### 기능 확장

- 여러 카테고리별 뉴스 분류 추가
- 인증 시스템 추가
- Vercel Cron Jobs를 활용한 정기적인 백업
- 뉴스 검색 기능 추가

## 라이선스

MIT License
