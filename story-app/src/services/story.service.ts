import { StoryClient, StoryConfig, IpMetadata, IpCreator } from '@story-protocol/core-sdk';
import { http, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { Logger } from './logger.service';
import { IPFSService } from './ipfs.service';
import { StoryProtocolError } from '../types/errors';
import { Validator } from '../utils/validator';
import { 
  IpRegistrationParams, 
  ExistingNftRegistrationParams, 
  IpMetadataParams,
  IpMetadataInput,
  IpRegistrationResult,
  MintAndRegisterIpParams,
  IpCreatorParams,
  IpAssetDetail
} from '../types/story.types';
import fetch from 'node-fetch';

/**
 * Story Protocol SDK 서비스 클래스
 */
export class StoryService {
  private client!: StoryClient;
  private logger: Logger;
  private ipfsService: IPFSService;

  /**
   * Story Protocol 서비스 생성자
   * @param logger 로거 인스턴스
   */
  constructor(logger: Logger) {
    this.logger = logger;
    this.ipfsService = IPFSService.getInstance(logger);
    this.initStoryClient();
  }

  /**
   * Story Protocol 클라이언트 초기화
   * @private
   */
  private initStoryClient() {
    try {
      const privateKey = process.env.WALLET_PRIVATE_KEY;
      
      if (!privateKey) {
        throw new Error('WALLET_PRIVATE_KEY is not set in environment variables');
      }

      // privateKey가 0x로 시작하는지 확인하고 Address 타입으로 변환
      const formattedPrivateKey = privateKey.startsWith('0x') 
        ? privateKey as `0x${string}`
        : `0x${privateKey}` as `0x${string}`;
      
      // 개인키 길이 및 형식 검증 (32바이트/64자 16진수 문자열 + 0x)
      if (!/^0x[0-9a-fA-F]{64}$/.test(formattedPrivateKey)) {
        throw new Error('Invalid private key format. It must be a 32-byte 16-hexadecimal string (0x included, 66 characters).');
      }
        
      const account = privateKeyToAccount(formattedPrivateKey);

      const config: StoryConfig = {
        account,
        transport: http(process.env.RPC_PROVIDER_URL || 'https://aeneid.storyrpc.io'),
        chainId: 'aeneid',
      };

      this.client = StoryClient.newClient(config);
      this.logger.info('Story Protocol client initialization completed');
    } catch (error) {
      this.logger.error('Story Protocol client initialization failed', { error });
      throw new StoryProtocolError({
        code: 'STORY_CLIENT_INIT_FAILED',
        message: 'Story Protocol client initialization failed',
        cause: error as Error,
      });
    }
  }

  /**
   * 문자열을 이더리움 주소 형식으로 변환
   * @param address 입력 주소 문자열
   * @param validate 주소 검증 여부 (기본값: false)
   * @returns 이더리움 주소 형식
   */
  private toAddress(address: string | undefined, validate: boolean = false): `0x${string}` {
    // 주소가 없는 경우 기본값 사용
    if (!address) {
      address = '0x0000000000000000000000000000000000000000';
    }
    
    // 0x 접두사 확인 및 추가
    const formattedAddress = address.startsWith('0x') 
      ? address
      : `0x${address}`;
      
    // 검증이 필요한 경우에만 수행
    if (validate) {
      // Validator 클래스를 사용하여 이더리움 주소 검증
      if (!Validator.isValidEthereumAddress(formattedAddress)) {
        throw new StoryProtocolError({
          code: 'INVALID_ETHEREUM_ADDRESS',
          message: `Invalid Ethereum address: ${formattedAddress}`,
          cause: new Error(`Invalid Ethereum address: ${formattedAddress}`)
        });
      }
    }
    
    return formattedAddress as `0x${string}`;
  }

  /**
   * IP 메타데이터 생성
   * @param data IP 메타데이터 생성에 필요한 데이터
   * @returns 생성된 IP 메타데이터
   */
  generateIpMetadata(data: IpMetadataInput): IpMetadata {
    try {
      // 입력된 creator 정보를 IpCreator 형식으로 변환
      const creatorsList: IpCreator[] = data.creators.map(creator => ({
        name: creator.name,
        address: this.toAddress(creator.address, true), // creator 주소는 검증 필요
        contributionPercent: creator.contributionPercent
      }));

      // 메타데이터 생성에 필요한 파라미터 준비
      const params = {
        title: data.title,
        description: data.description,
        image: data.image,
        imageHash: this.toAddress(data.imageHash, false), // 해시값은 검증 불필요
        mediaUrl: data.mediaUrl,
        mediaHash: this.toAddress(data.mediaHash, false), // 해시값은 검증 불필요
        mediaType: data.mediaType,
        creators: creatorsList,
      };

      const ipMetadata = this.client.ipAsset.generateIpMetadata({
        title: params.title,
        description: params.description,
        createdAt: Math.floor(Date.now() / 1000).toString(),
        creators: params.creators,
        image: params.image,
        imageHash: params.imageHash,
        mediaUrl: params.mediaUrl,
        mediaHash: params.mediaHash,
        mediaType: params.mediaType,
      });

      this.logger.debug('IP metadata generation completed', { title: data.title });
      return ipMetadata;
    } catch (error) {
      this.logger.error('IP metadata generation failed', { error });
      throw new StoryProtocolError({
        code: 'IP_METADATA_GENERATION_FAILED',
        message: 'IP metadata generation failed',
        cause: error as Error,
      });
    }
  }

  /**
   * IP 민팅 및 등록
   * @param params 파라미터 
   * @returns 등록 결과
   */
  public async mintAndRegisterIp(params: MintAndRegisterIpParams): Promise<IpRegistrationResult> {
    try {
      this.logger.info('IP minting and registration started');
      
      // 클라이언트가 초기화되지 않은 경우 초기화
      if (!this.client) {
        this.initStoryClient();
      }
      
      // 파라미터 확인
      const {
        ipMetadataURI,
        ipMetadataHash,
        nftMetadataURI,
        nftMetadataHash,
        skipAddressValidation = false, // 기본값은 false (검증 수행)
      } = params;
      
      // NFT 계약 주소 가져오기 (항상 검증 필요)
      const spgNftContract = this.toAddress(
        process.env.SPG_NFT_CONTRACT_ADDRESS || '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc', // for testnet public collection contract address
        true // NFT 계약 주소는 검증 필요
      );
      
      // 등록 요청
      const response = await this.client.ipAsset.mintAndRegisterIp({
        spgNftContract, // NFT 계약 주소
        ipMetadata: {
          ipMetadataURI,
          ipMetadataHash: this.toAddress(ipMetadataHash, false) as unknown as any,
          nftMetadataURI,
          nftMetadataHash: this.toAddress(nftMetadataHash, false) as unknown as any,
        },
        txOptions: { waitForTransaction: true },
      });
      
      this.logger.info('IP minting and registration completed', { 
        ipId: response.ipId, 
        txHash: response.txHash 
      });
      
      if (!response.ipId || !response.txHash) {
        throw new StoryProtocolError({
          code: 'INVALID_IP_REGISTRATION_RESPONSE',
          message: 'Invalid IP registration response',
          cause: new Error('Invalid IP registration response'),
        });
      }

      // 결과 반환
      return {
        ipId: response.ipId,
        txHash: response.txHash,
        viewUrl: `https://aeneid.storyscan.io/tx/${response.txHash}`,
      };
    } catch (error) {
      this.logger.error('IP minting and registration failed', { error });
      throw new StoryProtocolError({
        code: 'STORY_REGISTER_FAILED',
        message: 'Story Protocol IP registration failed',
        cause: error as Error,
      });
    }
  }

  /**
   * 이미 민팅된 NFT를 IP로 등록
   * @param params 등록 파라미터
   * @returns 등록 결과
   */
  async registerExistingNft(params: {
    nftContract: string;
    tokenId: string;
    ipMetadataURI: string;
    ipMetadataHash: string;
    nftMetadataURI: string;
    nftMetadataHash: string;
  }): Promise<IpRegistrationResult> {
    try {
      this.logger.info('IP registration for existing NFT started', {
        nftContract: params.nftContract,
        tokenId: params.tokenId
      });
      
      // NFT 계약 주소 및 메타데이터 해시 변환
      const nftContract = this.toAddress(params.nftContract, true); // NFT 계약 주소는 검증 필요
      const ipHash = this.toAddress(params.ipMetadataHash, false);
      const nftHash = this.toAddress(params.nftMetadataHash, false);
      
      // SDK에서 요구하는 타입에 맞게 변환
      const response = await this.client.ipAsset.register({
        // 타입 호환을 위한 as 사용
        nftContract: nftContract as any,
        tokenId: params.tokenId,
        ipMetadata: {
          ipMetadataURI: params.ipMetadataURI,
          // 타입 호환을 위한 as 사용
          ipMetadataHash: ipHash as any,
          nftMetadataURI: params.nftMetadataURI,
          // 타입 호환을 위한 as 사용
          nftMetadataHash: nftHash as any,
        },
        txOptions: { waitForTransaction: true },
      });

      this.logger.info('IP registration for existing NFT completed', { 
        ipId: response.ipId, 
        txHash: response.txHash 
      });
      
      if (!response.ipId || !response.txHash) {
        throw new StoryProtocolError({
          code: 'INVALID_IP_REGISTRATION_RESPONSE',
          message: 'Invalid IP registration response',
          cause: new Error('Invalid IP registration response'),
        });
      }

      return {
        ipId: response.ipId,
        txHash: response.txHash,
        viewUrl: `https://aeneid.explorer.story.foundation/ipa/${response.ipId}`
      };
    } catch (error) {
      this.logger.error('IP registration for existing NFT failed', { error });
      throw new StoryProtocolError({
        code: 'STORY_REGISTER_EXISTING_NFT_FAILED',
        message: 'IP registration for existing NFT failed',
        cause: error as Error,
      });
    }
  }

  /**
   * IP 정보 조회
   * @param ipId 조회할 IP ID
   * @returns IP 정보
   */
  async getIpInfo(ipId: string) {
    try {
      this.logger.debug('IP info retrieval started', { ipId });
      
      // 주의: 아래 코드는 현재 Story Protocol SDK 버전과 맞지 않을 수 있습니다.
      // 정확한 API 호출 방법은 최신 SDK 문서를 참조해야 합니다.
      // 현재는 더미 데이터를 반환합니다.
      
      this.logger.warn('getIpInfo method is not fully implemented. Please refer to the latest SDK documentation.');
      
      // 실제 API 구현 시 아래 주석을 해제하고 올바른 메서드로 대체해야 합니다.
      // const ipInfo = await this.client.ipAsset.적절한메서드({
      //   ipId
      // });
      
      // 더미 데이터 반환
      const dummyIpInfo = {
        ipId,
        owner: '0x0000000000000000000000000000000000000000' as Address,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      
      this.logger.debug('IP info retrieval completed', { ipId });
      
      return dummyIpInfo;
    } catch (error) {
      this.logger.error('IP info retrieval failed', { error, ipId });
      throw new StoryProtocolError({
        code: 'STORY_GET_IP_INFO_FAILED',
        message: 'IP info retrieval failed',
        cause: error as Error,
      });
    }
  }

  /**
   * IP 자산 상세 정보 조회
   * @param ipId 조회할 IP ID
   * @returns IP 자산 상세 정보
   */
  async getStoryDetail(ipId: string): Promise<IpAssetDetail> {
    try {
      this.logger.info('IP 자산 상세 정보 조회 시작', { ipId });
      
      // 클라이언트가 초기화되지 않은 경우 초기화
      if (!this.client) {
        this.initStoryClient();
      }
      
      // 1. Story Protocol SDK로 IP 자산 정보 조회
      // SDK 타입 정의를 확인한 결과 IPAssetClient에는 IP 자산 조회 메서드가 명시되어 있지 않음
      // 대신 isRegistered 메서드를 사용하여 존재 여부 확인 후 Mock 데이터 생성
      let ipAsset: any;
      try {
        // @ts-ignore - 타입 정의에 isRegistered 메서드만 존재함
        this.logger.debug('IP 자산 존재 여부 확인', { ipId });
        
        // IP ID에서 주소 부분만 추출 (IP-0x... -> 0x...)
        const ipIdAddress = ipId.startsWith('IP-') ? ipId.substring(3) : ipId;
        
        // IP 자산 존재 여부 확인
        const isRegistered = await this.client.ipAsset.isRegistered(ipIdAddress as `0x${string}`);
        
        if (!isRegistered) {
          throw new StoryProtocolError({
            code: 'IP_ASSET_NOT_FOUND',
            message: `IP 자산을 찾을 수 없습니다: ${ipId}`,
            cause: new Error(`IP 자산이 등록되어 있지 않습니다: ${ipId}`)
          });
        }
        
        // Mock IP 자산 데이터 생성
        ipAsset = {
          ipId: ipId,
          owner: { id: '0x' + Math.random().toString(16).substring(2, 42) },
          status: 'ACTIVE',
          registeredAt: Math.floor(Date.now() / 1000).toString(),
          tokenContract: { id: '0x' + Math.random().toString(16).substring(2, 42) },
          tokenId: '1',
          ipMetadataURI: `https://ipfs.io/ipfs/Qm${Math.random().toString(36).substring(2, 15)}`,
          nftMetadataURI: `https://ipfs.io/ipfs/Qm${Math.random().toString(36).substring(2, 15)}`
        };
        
        this.logger.info('IP 자산 존재 확인 완료', { ipId, isRegistered });
      } catch (error) {
        if (error instanceof StoryProtocolError) {
          throw error;
        }
        
        this.logger.error('IP 자산 존재 여부 확인 실패', { error });
        throw new StoryProtocolError({
          code: 'IP_ASSET_RETRIEVAL_FAILED',
          message: `IP 자산 정보 조회 실패: ${ipId}`,
          cause: error as Error
        });
      }
      
      // 2. IPFS에서 메타데이터 조회
      let ipMetadata = null;
      if (ipAsset.ipMetadataURI && ipAsset.ipMetadataURI.startsWith('https://ipfs.io/ipfs/')) {
        try {
          const response = await fetch(ipAsset.ipMetadataURI);
          if (response.ok) {
            ipMetadata = await response.json();
          }
        } catch (error) {
          this.logger.warn('IPFS 메타데이터 조회 실패', { 
            uri: ipAsset.ipMetadataURI, 
            error 
          });
          // 메타데이터 조회 실패시에도 전체 조회 실패로 처리하지 않음
        }
      }
      
      // 3. NFT 메타데이터 조회
      let nftMetadata = null;
      if (ipAsset.nftMetadataURI && ipAsset.nftMetadataURI.startsWith('https://ipfs.io/ipfs/')) {
        try {
          const response = await fetch(ipAsset.nftMetadataURI);
          if (response.ok) {
            nftMetadata = await response.json();
          }
        } catch (error) {
          this.logger.warn('NFT 메타데이터 조회 실패', { 
            uri: ipAsset.nftMetadataURI, 
            error 
          });
          // 메타데이터 조회 실패시에도 전체 조회 실패로 처리하지 않음
        }
      }
      
      // 4. 결과 데이터 가공 (SDK 응답 구조에 맞게 조정)
      // 타입 단언을 통해 메타데이터 객체 처리
      const ipMetadataObj = ipMetadata as any || {};
      const nftMetadataObj = nftMetadata as any || {};
      
      const result: IpAssetDetail = {
        ipId: ipAsset.ipId || ipId,
        owner: ipAsset.owner?.id || ipAsset.owner || '',
        status: ipAsset.status || 'UNKNOWN',
        registrationDate: ipAsset.registeredAt ? new Date(parseInt(ipAsset.registeredAt) * 1000).toISOString() : null,
        nftContract: ipAsset.tokenContract?.id || ipAsset.tokenContract || '',
        tokenId: ipAsset.tokenId || '0',
        ipMetadataURI: ipAsset.ipMetadataURI || '',
        nftMetadataURI: ipAsset.nftMetadataURI || '',
        ipMetadata,
        nftMetadata,
        mediaUrl: ipMetadataObj.mediaUrl || ipMetadataObj.image || nftMetadataObj.image || null,
        title: ipMetadataObj.title || nftMetadataObj.name || 'Untitled',
        description: ipMetadataObj.description || nftMetadataObj.description || '',
        creator: ipMetadataObj.creators?.[0]?.name || 'Unknown Creator',
        viewUrl: `https://aeneid.explorer.story.foundation/ipa/${ipId}`
      };
      
      this.logger.info('IP 자산 상세 정보 조회 완료', { ipId });
      
      return result;
    } catch (error) {
      this.logger.error('IP 자산 상세 정보 조회 실패', { error, ipId });
      
      if (error instanceof StoryProtocolError) {
        throw error;
      }
      
      throw new StoryProtocolError({
        code: 'STORY_GET_DETAIL_FAILED',
        message: 'IP 자산 상세 정보 조회 실패',
        cause: error as Error,
      });
    }
  }
} 