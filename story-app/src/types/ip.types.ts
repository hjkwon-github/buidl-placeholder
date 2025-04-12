/**
 * IP 등록 요청 인터페이스
 */
export interface RegisterIPRequest {
  title: string;
  description: string;
  fileUrl: string;
  creators: Creator[];
  licenseTerms?: LicenseTerms;
}

/**
 * 창작자 정보 인터페이스
 */
export interface Creator {
  name: string;
  address: string;
  contributionPercent: number;
  socialMedia?: SocialMedia[];
}

/**
 * 소셜 미디어 정보 인터페이스
 */
export interface SocialMedia {
  platform: string;
  url: string;
}

/**
 * 라이선스 정보 인터페이스
 */
export interface LicenseTerms {
  commercialUse: boolean;
  mintFee?: {
    amount: string;
    token: string;
  };
  royaltyPercentage?: number;
}

/**
 * IP 등록 응답 인터페이스
 */
export interface RegisterIPResponse {
  status: "success" | "error";
  ipId?: string;
  transactionHash?: string;
  ipfsData?: {
    mediaUrl: string;
    metadataUrl: string;
  };
  errorCode?: string;
  errorMessage?: string;
  details?: string;
}

/**
 * IPFS 업로드 결과 인터페이스
 */
export interface IPFSUploadResult {
  ipfsCid: string;
  contentType?: string;
  contentHash?: string;
  hash?: string;
} 