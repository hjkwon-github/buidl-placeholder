import { type Address } from 'viem';

export interface Story {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    [key: string]: any;
  };
}

export interface CreateStoryDto {
  title: string;
  content: string;
  author: string;
  metadata?: {
    [key: string]: any;
  };
}

export interface UpdateStoryDto {
  title?: string;
  content?: string;
  metadata?: {
    [key: string]: any;
  };
}

/**
 * IP 등록 파라미터 인터페이스
 */
export interface IpRegistrationParams {
  ipMetadataURI: string;
  ipMetadataHash: HashOrAddress;
  nftMetadataURI: string;
  nftMetadataHash: HashOrAddress;
  licenseTerms?: any[];
}

/**
 * 기존 NFT 등록 파라미터 인터페이스
 */
export interface ExistingNftRegistrationParams {
  nftContract: Address;
  tokenId: string;
  ipMetadataURI: string;
  ipMetadataHash: HashOrAddress;
  nftMetadataURI: string;
  nftMetadataHash: HashOrAddress;
}

/**
 * IP 메타데이터 생성 파라미터
 */
export interface IpMetadataParams {
  title: string;
  description: string;
  image: string;
  imageHash: HashOrAddress;
  mediaUrl: string;
  mediaHash: HashOrAddress;
  mediaType: string;
  creators: Array<IpCreatorParams>;
}

/**
 * IP 크리에이터 파라미터
 */
export interface IpCreatorParams {
  name: string;
  address: Address;
  contributionPercent: number;
}

/**
 * IP 등록 결과 인터페이스
 */
export interface IpRegistrationResult {
  ipId: `0x${string}`;
  txHash: `0x${string}`;
  viewUrl: string;
}

/**
 * IP 메타데이터 입력 인터페이스
 */
export interface IpMetadataInput {
  title: string;
  description: string;
  image: string;
  imageHash: string;
  mediaUrl: string;
  mediaHash: string;
  mediaType: string;
  creators: Array<{
    name: string;
    address: string;
    contributionPercent: number;
  }>;
}

/**
 * IP 민팅 및 등록 파라미터
 */
export interface MintAndRegisterIpParams {
  ipMetadataURI: string;
  ipMetadataHash: `0x${string}`;
  nftMetadataURI: string;
  nftMetadataHash: `0x${string}`;
  skipAddressValidation?: boolean;
}

/**
 * IP 메타데이터 파라미터에 사용되는 주소 타입
 * SDK에서는 0x로 시작하는 문자열 타입을 요구함
 */
export type HashOrAddress = `0x${string}`; 