# Story Protocol Backend API 명세서 - 창작물 등록(Register IP)

## 1. 개요

사용자가 자신의 창작물을 API를 통해 업로드하면, Story Protocol SDK를 이용해 자동으로 IPFS 업로드 + Story Protocol Register 처리를 수행하는 API 서비스입니다.

Backend Server는 Express.js로 구성된 RESTful API로 설계되어 있으며, 추후 확장성을 고려한 모듈화된 구조를 채택합니다.

## 2. 기술 스택

| 구성요소 | 기술 스택 | 비고 |
|--------|------|------|
| Backend Framework | TypeScript + Express.js | RESTful API 구현 |
| Story SDK | @story-protocol/core-sdk | 공식 최신 SDK 사용 |
| IPFS Upload | Pinata SDK | 파일 및 메타데이터 IPFS 업로드 |
| Configuration | dotenv | 환경 변수 관리 (RPC URL, Private Key 등) |
| Logger | Winston | 로깅 관리 |
| Error Handling | 커스텀 에러 클래스 | 구조화된 에러 응답 처리 |

## 3. 시스템 아키텍처

```
클라이언트 <-> Express 서버 <-> Story Protocol SDK <-> Story Protocol 블록체인 
                   |                   
                   ↓
               IPFS 서비스
                (Pinata)
```

## 4. API 엔드포인트

### 4.1. 창작물 등록 API

**엔드포인트:** `POST /api/v1/ip/register`

**설명:** 사용자가 창작물 정보를 등록하고 Story Protocol에 IP를 등록합니다.

#### Request Body

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| title | string | O | 창작물 제목 |
| description | string | O | 창작물 설명 |
| fileUrl | string | O | 업로드할 원본 파일 URL |
| creators | array | O | 창작자 정보 배열 |
| creators[].name | string | O | 창작자 이름 |
| creators[].address | string | O | 창작자 지갑 주소 |
| creators[].contributionPercent | number | O | 기여 비율 (합계 100) |
| creators[].socialMedia | array | X | 소셜미디어 정보 (선택사항) |
| licenseTerms | object | X | 라이센스 조건 (선택사항) |

**요청 예시:**

```json
{
  "title": "행복한 고양이",
  "description": "AI로 생성된 고양이 이미지입니다.",
  "fileUrl": "https://example.com/images/cat.png",
  "creators": [
    {
      "name": "김개발",
      "address": "0x67ee74EE04A0E6d14Ca6C27428B27F3EFd5CD084",
      "contributionPercent": 100,
      "socialMedia": [
        {
          "platform": "Twitter",
          "url": "https://twitter.com/kimdev"
        }
      ]
    }
  ],
  "licenseTerms": {
    "commercialUse": true,
    "mintFee": {
      "amount": "10000000000000000", // 0.01 ETH
      "token": "0xWIP_TOKEN_ADDRESS"
    },
    "royaltyPercentage": 5 // 5%
  }
}
```

#### Response Body

**성공 응답 (200 OK):**

```json
{
  "status": "success",
  "ipId": "IP-0x123456...",
  "transactionHash": "0xabc123...",
  "ipfsData": {
    "mediaUrl": "ipfs://Qmabc123...",
    "metadataUrl": "ipfs://Qmdef456..."
  }
}
```

**실패 응답 (4xx, 5xx):**

```json
{
  "status": "error",
  "errorCode": "IPFS_UPLOAD_FAILED",
  "errorMessage": "파일 업로드에 실패했습니다",
  "details": "..." // 상세 오류 정보 (개발자용)
}
```

### 4.2. IP 상태 조회 API

**엔드포인트:** `GET /api/v1/ip/:ipId`

**설명:** 등록된 IP의 상태 및 정보를 조회합니다.

#### URL Parameters

| 파라미터 | 설명 |
|--------|------|
| ipId | 조회할 IP의 ID |

#### Response Body

**성공 응답 (200 OK):**

```json
{
  "status": "success",
  "ipData": {
    "ipId": "IP-0x123456...",
    "title": "행복한 고양이",
    "description": "AI로 생성된 고양이 이미지입니다.",
    "mediaUrl": "ipfs://Qmabc123...",
    "creators": [
      {
        "name": "김개발",
        "address": "0x67ee74EE04A0E6d14Ca6C27428B27F3EFd5CD084",
        "contributionPercent": 100
      }
    ],
    "registrationDate": "2023-08-15T09:30:00Z",
    "licenseTerms": {
      "commercialUse": true,
      "mintFee": "0.01 ETH",
      "royaltyPercentage": 5
    }
  }
}
```

## 5. 서비스 구현 상세

### 5.1. 프로젝트 구조

```
src/
├── controllers/
│   └── ip.controller.ts        # IP 관련 컨트롤러
├── services/
│   ├── story.service.ts        # Story Protocol SDK 연동 서비스
│   ├── ipfs.service.ts         # IPFS 업로드 서비스 
│   └── logger.service.ts       # 로깅 서비스
├── middlewares/
│   ├── error.middleware.ts     # 에러 처리 미들웨어
│   └── validation.middleware.ts # 요청 검증 미들웨어
├── models/
│   ├── ip.model.ts             # IP 관련 모델 정의
│   └── response.model.ts       # 응답 모델 정의
├── utils/
│   ├── hash.util.ts            # 해시 유틸리티
│   └── validator.util.ts       # 유효성 검증 유틸리티
├── types/
│   ├── errors.ts               # 커스텀 에러 타입 정의
│   └── story-protocol.ts       # Story Protocol 관련 타입 정의
├── config/
│   └── index.ts                # 환경 설정 관리
└── app.ts                      # 메인 애플리케이션 설정
```

### 5.2. 주요 서비스 구현

#### 5.2.1. StoryService

Story Protocol SDK와 연동하여 IP 등록 및 조회 기능을 제공합니다.

```typescript
// src/services/story.service.ts
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import { http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { Logger } from "./logger.service";

export class StoryService {
  private client: StoryClient;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
    this.initStoryClient();
  }

  private initStoryClient() {
    const privateKey = `0x${process.env.WALLET_PRIVATE_KEY}`;
    const account = privateKeyToAccount(privateKey);

    const config: StoryConfig = {
      account: account,
      transport: http(process.env.RPC_PROVIDER_URL || "https://aeneid.storyrpc.io"),
      chainId: "aeneid",
    };

    this.client = StoryClient.newClient(config);
    this.logger.info("Story Protocol 클라이언트 초기화 완료");
  }

  async registerIp(ipMetadata: any, nftMetadata: any) {
    this.logger.info("IP 등록 시작", { title: ipMetadata.title });
    
    // SDK의 mintAndRegisterIp 함수를 이용해 IP 등록
    const response = await this.client.ipAsset.mintAndRegisterIpWithPilTerms({
      spgNftContract: process.env.SPG_NFT_CONTRACT_ADDRESS || "0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc",
      licenseTermsData: ipMetadata.licenseTerms ? [{ terms: ipMetadata.licenseTerms }] : [],
      ipMetadata: {
        ipMetadataURI: ipMetadata.ipMetadataURI,
        ipMetadataHash: ipMetadata.ipMetadataHash,
        nftMetadataURI: nftMetadata.nftMetadataURI,
        nftMetadataHash: nftMetadata.nftMetadataHash,
      },
      txOptions: { waitForTransaction: true },
    });

    this.logger.info("IP 등록 완료", { ipId: response.ipId, txHash: response.txHash });
    return response;
  }
}
```

#### 5.2.2. IPFSService

IPFS에 파일 및 메타데이터를 업로드하는 기능을 제공합니다.

```typescript
// src/services/ipfs.service.ts
import { PinataSDK } from "pinata-web3";
import axios from "axios";
import { createHash } from "crypto";
import { Logger } from "./logger.service";
import { StoryProtocolError } from "../types/errors";

export class IPFSService {
  private pinata: PinataSDK;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
    this.pinata = new PinataSDK({
      pinataJwt: process.env.PINATA_JWT,
    });
  }

  async uploadContent(fileUrl: string) {
    try {
      this.logger.debug("컨텐츠 다운로드 중...", { url: fileUrl });
      
      const response = await axios.get(fileUrl, {
        responseType: "arraybuffer",
        validateStatus: (status) => status === 200,
      });

      const contentType = response.headers["content-type"];
      const buffer = Buffer.from(response.data);
      const contentHash = "0x" + createHash("sha256").update(buffer).digest("hex");
      
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const file = new File([buffer], filename, { type: contentType });
      
      const { IpfsHash } = await this.pinata.upload.file(file);
      
      return {
        ipfsCid: IpfsHash,
        contentType,
        contentHash,
      };
    } catch (error) {
      this.logger.error("IPFS 컨텐츠 업로드 실패", { error });
      throw new StoryProtocolError({
        code: "IPFS_UPLOAD_FAILED",
        message: "파일 업로드에 실패했습니다",
        cause: error,
      });
    }
  }

  async uploadJSON(jsonData: any) {
    try {
      const { IpfsHash } = await this.pinata.upload.json(jsonData);
      const hash = "0x" + createHash("sha256")
        .update(JSON.stringify(jsonData))
        .digest("hex");
      
      return { ipfsCid: IpfsHash, hash };
    } catch (error) {
      this.logger.error("IPFS JSON 업로드 실패", { error });
      throw new StoryProtocolError({
        code: "IPFS_METADATA_UPLOAD_FAILED",
        message: "메타데이터 업로드에 실패했습니다",
        cause: error,
      });
    }
  }
}
```

### 5.3. 컨트롤러 구현

```typescript
// src/controllers/ip.controller.ts
import { Request, Response, NextFunction } from "express";
import { StoryService } from "../services/story.service";
import { IPFSService } from "../services/ipfs.service";
import { Logger } from "../services/logger.service";

export class IPController {
  private storyService: StoryService;
  private ipfsService: IPFSService;
  private logger: Logger;

  constructor(
    storyService: StoryService, 
    ipfsService: IPFSService,
    logger: Logger
  ) {
    this.storyService = storyService;
    this.ipfsService = ipfsService;
    this.logger = logger;
  }

  async registerIP(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, description, fileUrl, creators, licenseTerms } = req.body;
      
      // 1. 컨텐츠를 IPFS에 업로드
      const { ipfsCid, contentType, contentHash } = await this.ipfsService.uploadContent(fileUrl);
      
      // 2. IP 메타데이터 구성
      const ipMetadata = {
        title,
        description,
        image: `https://ipfs.io/ipfs/${ipfsCid}`,
        imageHash: contentHash,
        mediaUrl: `https://ipfs.io/ipfs/${ipfsCid}`,
        mediaHash: contentHash,
        mediaType: contentType,
        creators,
      };
      
      // 3. NFT 메타데이터 구성
      const nftMetadata = {
        name: title,
        description,
        image: `https://ipfs.io/ipfs/${ipfsCid}`,
        attributes: [],
      };
      
      // 4. 메타데이터를 IPFS에 업로드
      const { ipfsCid: ipIpfsCid, hash: ipHash } = await this.ipfsService.uploadJSON(ipMetadata);
      const { ipfsCid: nftIpfsCid, hash: nftHash } = await this.ipfsService.uploadJSON(nftMetadata);
      
      // 5. Story Protocol에 IP 등록
      const response = await this.storyService.registerIp(
        {
          ...ipMetadata,
          ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsCid}`,
          ipMetadataHash: ipHash,
          licenseTerms,
        },
        {
          ...nftMetadata,
          nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsCid}`,
          nftMetadataHash: nftHash,
        }
      );
      
      // 6. 응답 반환
      return res.status(200).json({
        status: "success",
        ipId: response.ipId,
        transactionHash: response.txHash,
        ipfsData: {
          mediaUrl: `ipfs://${ipfsCid}`,
          ipMetadataUrl: `ipfs://${ipIpfsCid}`,
          nftMetadataUrl: `ipfs://${nftIpfsCid}`,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getIPInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const { ipId } = req.params;
      
      // IP 정보 조회 로직 구현
      // ...
      
      return res.status(200).json({
        status: "success",
        ipData: {
          // IP 정보
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
```

## 6. 오류 처리

### 6.1. 커스텀 에러 클래스

```typescript
// src/types/errors.ts
export interface ErrorOptions {
  code: string;
  message: string;
  context?: Record<string, any>;
  cause?: Error;
}

export class StoryProtocolError extends Error {
  code: string;
  context?: Record<string, any>;
  cause?: Error;

  constructor(options: ErrorOptions) {
    super(options.message);
    this.name = "StoryProtocolError";
    this.code = options.code;
    this.context = options.context;
    this.cause = options.cause;
  }
}
```

### 6.2. 에러 처리 미들웨어

```typescript
// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from "express";
import { StoryProtocolError } from "../types/errors";
import { Logger } from "../services/logger.service";

export function errorHandler(
  logger: Logger
) {
  return (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (err instanceof StoryProtocolError) {
      logger.error("API 에러 발생", {
        code: err.code,
        message: err.message,
        context: err.context,
      });

      return res.status(getStatusCodeFromErrorCode(err.code)).json({
        status: "error",
        errorCode: err.code,
        errorMessage: err.message,
        details: process.env.NODE_ENV === "development" ? err.cause?.message : undefined,
      });
    }

    // 예상치 못한 에러 처리
    logger.error("예상치 못한 에러 발생", { error: err });
    return res.status(500).json({
      status: "error",
      errorCode: "INTERNAL_SERVER_ERROR",
      errorMessage: "서버 내부 오류가 발생했습니다",
    });
  };
}

function getStatusCodeFromErrorCode(code: string): number {
  const statusCodeMap: Record<string, number> = {
    INVALID_REQUEST: 400,
    INVALID_CONTENT_URL: 400,
    IPFS_UPLOAD_FAILED: 500,
    IPFS_METADATA_UPLOAD_FAILED: 500,
    STORY_REGISTER_FAILED: 500,
  };

  return statusCodeMap[code] || 500;
}
```