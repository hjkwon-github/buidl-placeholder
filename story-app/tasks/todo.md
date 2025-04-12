# Story Protocol IP 등록 개발 Todo List

## 1. 환경 설정 ✅
- [x] `.env` 파일 구성
  - [x] `WALLET_PRIVATE_KEY`: Story Protocol 트랜잭션 서명용 지갑 private key
  - [x] `PINATA_JWT`: Pinata API JWT 토큰
  - [x] `RPC_PROVIDER_URL`: Story Protocol RPC URL (기본값: https://aeneid.storyrpc.io)
  - [x] `SPG_NFT_CONTRACT_ADDRESS`: Story Protocol NFT 컨트랙트 주소 (기본값: 0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc)
  - [x] `PORT`: 서버 포트 (기본값: 3000)
  - [x] `BLOCK_EXPLORER_URL`: 블록 익스플로러 URL (기본값: https://aeneid.storyscan.io/tx/)

## 2. 프로젝트 구조 설정 ✅
- [x] 기본 디렉토리 구조 생성
  - [x] `src/controllers`
  - [x] `src/services`
  - [x] `src/types`
  - [x] `src/utils`
  - [x] `src/middlewares`

## 3. 타입 정의 ✅
- [x] `src/types/ip.types.ts` 생성
  - [x] `RegisterIPRequest` 인터페이스 정의
  - [x] `RegisterIPResponse` 인터페이스 정의
  - [x] `IPFSUploadResult` 인터페이스 정의
  - [x] `StoryProtocolError` 클래스 정의

## 4. IPFS 서비스 구현 ✅
- [x] `src/services/ipfs.service.ts` 구현
  - [x] Pinata SDK 초기화
  - [x] `uploadContent`: 파일 업로드 메서드 구현
  - [x] `uploadJSON`: 메타데이터 업로드 메서드 구현
  - [x] 에러 처리 로직 구현

## 5. Story Protocol 서비스 구현 ✅
- [x] `src/services/story.service.ts` 구현
  - [x] Story Protocol SDK 초기화
  - [x] `registerIp`: IP 등록 메서드 구현
  - [x] 트랜잭션 처리 및 에러 핸들링
  - [x] 타입스크립트 린트 오류 수정

## 6. 컨트롤러 구현 ✅
- [x] `src/controllers/ip.controller.ts` 구현
  - [x] `POST /api/v1/ip/register` 엔드포인트 구현
  - [x] 요청 데이터 검증
  - [x] IPFS 업로드 로직 연동
  - [x] Story Protocol 등록 로직 연동
  - [x] 응답 포맷팅
  - [x] 트랜잭션 URL 응답에 추가

## 7. 미들웨어 구현 ✅
- [x] `src/middlewares/error.middleware.ts` 구현
  - [x] 글로벌 에러 핸들러 구현
  - [x] Story Protocol 에러 처리
  - [x] IPFS 업로드 에러 처리

## 8. 유틸리티 구현 ✅
- [x] `src/utils/validator.ts` 구현
  - [x] 요청 데이터 검증 유틸리티
  - [x] 파일 URL 검증 유틸리티

## 9. API 라우터 설정 ✅
- [x] `src/routes/ip.routes.ts` 구현
  - [x] IP 등록 라우트 설정
  - [x] 미들웨어 연결

## 10. 테스트 ✅
- [x] IPFS 업로드 테스트 구현
  - [x] `tests/ipfs-upload.test.ts` 생성
  - [x] IP 등록 테스트 케이스 작성
- [x] Story Protocol 테스트 구현
  - [x] `tests/story.test.ts` 생성
  - [x] 메타데이터 생성 및 등록 테스트

## 11. IP 자산 상세 조회 기능 구현 ✅
- [x] `src/services/story.service.ts` 확장
  - [x] `getStoryDetail` 메서드 구현
  - [x] Story Protocol SDK IP 자산 조회 로직 구현
  - [x] IPFS 메타데이터 조회 로직 구현
  - [x] 응답 데이터 가공 로직 구현
  - [x] 에러 처리 로직 구현

- [x] `src/controllers/ip.controller.ts` 확장
  - [x] `getStoryDetail` 컨트롤러 메서드 구현
  - [x] 요청 파라미터 검증 로직 구현
  - [x] 응답 포맷팅 로직 구현

- [x] `src/routes/ip.routes.ts` 확장
  - [x] `GET /api/v1/ip/:ipId` 엔드포인트 추가
  - [x] 라우트 핸들러 구현
  - [x] 에러 미들웨어 연결

- [x] 테스트 구현
  - [x] `src/tests/story-detail.test.ts` 구현
  - [x] `src/tests/story-detail.test.http` 구현
  - [x] IP 자산 조회 테스트 케이스 작성
  - [x] IPFS 메타데이터 조회 테스트 케이스 작성
  - [x] 에러 케이스 테스트 작성

## 12. API 문서화 (Swagger UI) ✅
- [x] Swagger 설정
  - [x] `src/config/swagger.ts` 생성
  - [x] Swagger 기본 설정 구성
  - [x] API 문서 메타데이터 설정
  - [x] Swagger UI 미들웨어 설정

- [x] API 엔드포인트 문서화
  - [x] `POST /api/v1/ip/register` 엔드포인트 문서화
    - [x] 요청 스키마 정의
    - [x] 응답 스키마 정의
    - [x] 에러 응답 정의
  - [x] `GET /api/v1/ip/:ipId` 엔드포인트 문서화
    - [x] 경로 파라미터 정의
    - [x] 응답 스키마 정의
    - [x] 에러 응답 정의

- [x] 공통 스키마 정의
  - [x] `RegisterIPRequest` 스키마 정의
  - [x] `RegisterIPResponse` 스키마 정의
  - [x] `StoryDetailResponse` 스키마 정의
  - [x] `StoryProtocolError` 스키마 정의

## 13. 응답 개선 ✅
- [x] 트랜잭션 URL 추가
  - [x] `RegisterIPResponse`에 `transactionUrl` 필드 추가
  - [x] `StoryDetailResponse`에 `transactionUrl` 필드 추가
  - [x] 환경 변수 기반 블록 익스플로러 URL 설정

## 14. 개발자 문서화 및 프로젝트 구조화
- [ ] README.md 재작성
  - [ ] 프로젝트 소개 및 설치 방법
  - [ ] API 개요 및 엔드포인트 설명
  - [ ] Mermaid를 활용한 아키텍처 다이어그램
  - [ ] 서비스별 역할 및 기능 설명
  - [ ] 테스트 및 사용 방법 가이드
  - [ ] 환경 변수 설정 가이드

- [ ] API 문서화 개선
  - [ ] API 사용 방법 튜토리얼 작성
  - [ ] 예제 요청/응답 추가
  - [ ] 에러 코드 및 해결 방법 설명
  - [ ] 콘텐츠 및 메타데이터 구조 설명

- [ ] 프로젝트 구조 시각화
  - [ ] Mermaid를 사용한 서비스 흐름도 작성
  - [ ] 컴포넌트 간 상호작용 다이어그램
  - [ ] IP 등록 프로세스 흐름도
  - [ ] IPFS와 Story Protocol 연동 구조도