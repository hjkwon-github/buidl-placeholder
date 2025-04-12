# Story Hack

Story Protocol을 활용한 스토리 NFT 생성 및 관리 애플리케이션

## 기능

- 스토리 NFT 생성 및 관리
- IPFS에 스토리 콘텐츠 저장
- Story Protocol 통합
- 로깅 및 모니터링

## 시작하기

### 필수 조건

- Node.js 18 이상
- npm 또는 yarn
- Story Protocol API 키
- IPFS 프로젝트 ID 및 시크릿

### 설치

1. 저장소 클론
```bash
git clone [repository-url]
cd story-hack
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일을 편집하여 필요한 값 설정
```

4. 애플리케이션 실행
```bash
npm start
```

## 개발

### 스크립트

- `npm start`: 애플리케이션 시작
- `npm run dev`: 개발 모드로 실행
- `npm test`: 테스트 실행
- `npm run build`: 프로덕션 빌드
- `npm run lint`: 코드 린트 검사

### 디렉토리 구조

```
story-app/
├── src/
│   ├── config/         # 설정 파일
│   ├── controllers/    # 컨트롤러
│   ├── models/         # 데이터 모델
│   ├── routes/         # API 라우트
│   ├── services/       # 비즈니스 로직
│   ├── utils/          # 유틸리티 함수
│   └── app.ts          # 애플리케이션 진입점
├── .env.example        # 환경 변수 예제
├── .gitignore         # Git 무시 파일
├── package.json        # 프로젝트 설정
└── README.md           # 프로젝트 문서
```

## API 문서

### 스토리 생성

```http
POST /api/stories
Content-Type: application/json

{
  "title": "스토리 제목",
  "content": "스토리 내용",
  "author": "작가 주소"
}
```

### 스토리 조회

```http
GET /api/stories/:id
```

### 스토리 목록 조회

```http
GET /api/stories
```

## 라이센스

MIT 