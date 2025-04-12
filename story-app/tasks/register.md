# Story Protocol IP 등록 개발 Todo List

## 1. 환경 설정 ✅
- [x] `.env` 파일 구성
  - [x] `WALLET_PRIVATE_KEY`: Story Protocol 트랜잭션 서명용 지갑 private key
  - [x] `PINATA_JWT`: Pinata API JWT 토큰
  - [x] `RPC_PROVIDER_URL`: Story Protocol RPC URL (기본값: https://aeneid.storyrpc.io)
  - [x] `SPG_NFT_CONTRACT_ADDRESS`: Story Protocol NFT 컨트랙트 주소 (기본값: 0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc)
  - [x] `PORT`: 서버 포트 (기본값: 3000)

## 2. 프로젝트 구조 설정
- [ ] 기본 디렉토리 구조 생성
  - [ ] `src/controllers`
  - [ ] `src/services`
  - [ ] `src/types`
  - [ ] `src/utils`
  - [ ] `src/middlewares`

## 3. 타입 정의
- [ ] `src/types/ip.types.ts` 생성
  - [ ] `RegisterIPRequest` 인터페이스 정의
  - [ ] `RegisterIPResponse` 인터페이스 정의
  - [ ] `IPFSUploadResult` 인터페이스 정의
  - [ ] `StoryProtocolError` 클래스 정의

## 4. IPFS 서비스 구현
- [ ] `src/services/ipfs.service.ts` 구현
  - [ ] Pinata SDK 초기화
  - [ ] `uploadContent`: 파일 업로드 메서드 구현
  - [ ] `uploadJSON`: 메타데이터 업로드 메서드 구현
  - [ ] 에러 처리 로직 구현

## 5. Story Protocol 서비스 구현
- [ ] `src/services/story.service.ts` 구현
  - [ ] Story Protocol SDK 초기화
  - [ ] `registerIp`: IP 등록 메서드 구현
  - [ ] 트랜잭션 처리 및 에러 핸들링

## 6. 컨트롤러 구현
- [ ] `src/controllers/ip.controller.ts` 구현
  - [ ] `POST /api/v1/ip/register` 엔드포인트 구현
  - [ ] 요청 데이터 검증
  - [ ] IPFS 업로드 로직 연동
  - [ ] Story Protocol 등록 로직 연동
  - [ ] 응답 포맷팅

## 7. 미들웨어 구현
- [ ] `src/middlewares/error.middleware.ts` 구현
  - [ ] 글로벌 에러 핸들러 구현
  - [ ] Story Protocol 에러 처리
  - [ ] IPFS 업로드 에러 처리

## 8. 유틸리티 구현
- [ ] `src/utils/validator.ts` 구현
  - [ ] 요청 데이터 검증 유틸리티
  - [ ] 파일 URL 검증 유틸리티

## 9. API 라우터 설정
- [ ] `src/routes/ip.routes.ts` 구현
  - [ ] IP 등록 라우트 설정
  - [ ] 미들웨어 연결

## 10. 테스트
- [ ] REST Client 테스트 파일 작성
  - [ ] `tests/api.http` 업데이트
  - [ ] IP 등록 테스트 케이스 작성

## 11. 문서화
- [ ] API 스펙 문서 업데이트
- [ ] 환경 설정 가이드 작성
- [ ] 테스트 방법 문서화
