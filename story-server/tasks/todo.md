# Story Protocol IP Registration Development Todo List

## 1. Environment Setup ✅
- [x] Configure `.env` file
  - [x] `WALLET_PRIVATE_KEY`: Wallet private key for signing Story Protocol transactions
  - [x] `PINATA_JWT`: Pinata API JWT token
  - [x] `RPC_PROVIDER_URL`: Story Protocol RPC URL (default: https://aeneid.storyrpc.io)
  - [x] `SPG_NFT_CONTRACT_ADDRESS`: Story Protocol NFT contract address (default: 0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc)
  - [x] `PORT`: Server port (default: 3000)
  - [x] `BLOCK_EXPLORER_URL`: Block explorer URL (default: https://aeneid.storyscan.io/tx/)

## 2. Project Structure Setup ✅
- [x] Create basic directory structure
  - [x] `src/controllers`
  - [x] `src/services`
  - [x] `src/types`
  - [x] `src/utils`
  - [x] `src/middlewares`

## 3. Type Definitions ✅
- [x] Create `src/types/ip.types.ts`
  - [x] Define `RegisterIPRequest` interface
  - [x] Define `RegisterIPResponse` interface
  - [x] Define `IPFSUploadResult` interface
  - [x] Define `StoryProtocolError` class

## 4. IPFS Service Implementation ✅
- [x] Implement `src/services/ipfs.service.ts`
  - [x] Initialize Pinata SDK
  - [x] Implement `uploadContent` method for file uploads
  - [x] Implement `uploadJSON` method for metadata uploads
  - [x] Implement error handling logic

## 5. Story Protocol Service Implementation ✅
- [x] Implement `src/services/story.service.ts`
  - [x] Initialize Story Protocol SDK
  - [x] Implement `registerIp` method
  - [x] Handle transactions and error handling
  - [x] Fix TypeScript lint errors

## 6. Controller Implementation ✅
- [x] Implement `src/controllers/ip.controller.ts`
  - [x] Implement `POST /api/v1/ip/register` endpoint
  - [x] Validate request data
  - [x] Integrate IPFS upload logic
  - [x] Integrate Story Protocol registration logic
  - [x] Format response
  - [x] Add transaction URL to response

## 7. Middleware Implementation ✅
- [x] Implement `src/middlewares/error.middleware.ts`
  - [x] Implement global error handler
  - [x] Handle Story Protocol errors
  - [x] Handle IPFS upload errors

## 8. Utility Implementation ✅
- [x] Implement `src/utils/validator.ts`
  - [x] Implement request data validation utilities
  - [x] Implement file URL validation utilities

## 9. API Router Setup ✅
- [x] Implement `src/routes/ip.routes.ts`
  - [x] Configure IP registration routes
  - [x] Connect middlewares

## 10. Testing ✅
- [x] Implement IPFS upload tests
  - [x] Create `tests/ipfs-upload.test.ts`
  - [x] Write IP registration test cases
- [x] Implement Story Protocol tests
  - [x] Create `tests/story.test.ts`
  - [x] Test metadata creation and registration

## 11. IP Asset Detail Query Implementation ✅
- [x] Extend `src/services/story.service.ts`
  - [x] Implement `getStoryDetail` method
  - [x] Implement Story Protocol SDK IP asset query logic
  - [x] Implement IPFS metadata query logic
  - [x] Implement response data processing logic
  - [x] Implement error handling logic

- [x] Extend `src/controllers/ip.controller.ts`
  - [x] Implement `getStoryDetail` controller method
  - [x] Implement request parameter validation logic
  - [x] Implement response formatting logic

- [x] Extend `src/routes/ip.routes.ts`
  - [x] Add `GET /api/v1/ip/:ipId` endpoint
  - [x] Implement route handler
  - [x] Connect error middleware

- [x] Implement tests
  - [x] Implement `src/tests/story-detail.test.ts`
  - [x] Implement `src/tests/story-detail.test.http`
  - [x] Write IP asset query test cases
  - [x] Write IPFS metadata query test cases
  - [x] Write error case tests

## 12. API Documentation (Swagger UI) ✅
- [x] Swagger configuration
  - [x] Create `src/config/swagger.ts`
  - [x] Configure basic Swagger settings
  - [x] Configure API documentation metadata
  - [x] Configure Swagger UI middleware

- [x] Document API endpoints
  - [x] Document `POST /api/v1/ip/register` endpoint
    - [x] Define request schema
    - [x] Define response schema
    - [x] Define error responses
  - [x] Document `GET /api/v1/ip/:ipId` endpoint
    - [x] Define path parameters
    - [x] Define response schema
    - [x] Define error responses

- [x] Define common schemas
  - [x] Define `RegisterIPRequest` schema
  - [x] Define `RegisterIPResponse` schema
  - [x] Define `StoryDetailResponse` schema
  - [x] Define `StoryProtocolError` schema

## 13. Response Improvements ✅
- [x] Add transaction URL
  - [x] Add `transactionUrl` field to `RegisterIPResponse`
  - [x] Add `transactionUrl` field to `StoryDetailResponse`
  - [x] Configure block explorer URL based on environment variables