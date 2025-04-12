import { Request, Response, NextFunction } from 'express';
import { StoryService } from '../services/story.service';
import { IPFSService } from '../services/ipfs.service';
import { Logger } from '../services/logger.service';
import { RegisterIPRequest, RegisterIPResponse } from '../types/ip.types';
import { HashOrAddress } from '../types/story.types';
import { StoryProtocolError } from '../types/errors';
import { Validator } from '../utils/validator';

// 로거 인스턴스 생성
const logger = new Logger();

/**
 * IP 컨트롤러 클래스
 */
export class IpController {
  private storyService: StoryService;
  private ipfsService: IPFSService;

  /**
   * 생성자
   */
  constructor() {
    this.storyService = new StoryService(logger);
    this.ipfsService = IPFSService.getInstance(logger);
  }

  /**
   * IP 등록 컨트롤러
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('IP 등록 요청 수신', { 
        path: req.path, 
        method: req.method,
        contentType: req.headers['content-type']
      });

      // 요청 데이터 파싱
      const requestData: RegisterIPRequest = req.body;
      
      // 1. 파일 업로드
      logger.debug('컨텐츠 업로드 시작', { fileUrl: requestData.fileUrl });
      const contentResult = await this.ipfsService.uploadContent(requestData.fileUrl);
      logger.info('컨텐츠 업로드 완료', { 
        ipfsCid: contentResult.ipfsCid,
        contentType: contentResult.contentType
      });

      // 2. IP 메타데이터 생성
      const ipMetadata = this.storyService.generateIpMetadata({
        title: requestData.title,
        description: requestData.description,
        image: `https://ipfs.io/ipfs/${contentResult.ipfsCid}`,
        imageHash: contentResult.contentHash || '',
        mediaUrl: `https://ipfs.io/ipfs/${contentResult.ipfsCid}`,
        mediaHash: contentResult.contentHash || '',
        mediaType: contentResult.contentType || 'image/jpeg',
        creators: requestData.creators.map(creator => ({
          name: creator.name,
          address: creator.address,
          contributionPercent: creator.contributionPercent
        })),
      });
      
      // 3. NFT 메타데이터 생성
      const nftMetadata = {
        name: requestData.title,
        description: requestData.description,
        image: `https://ipfs.io/ipfs/${contentResult.ipfsCid}`,
        attributes: [
          {
            trait_type: 'Type',
            value: 'IP Asset'
          },
          {
            trait_type: 'Content Type',
            value: contentResult.contentType || 'image/jpeg'
          }
        ],
        // 라이선스 정보 추가 (있는 경우)
        ...requestData.licenseTerms && {
          license: {
            commercialUse: requestData.licenseTerms.commercialUse,
            ...requestData.licenseTerms.mintFee && {
              mintFee: requestData.licenseTerms.mintFee
            },
            ...requestData.licenseTerms.royaltyPercentage && {
              royaltyPercentage: requestData.licenseTerms.royaltyPercentage
            }
          }
        }
      };

      // 4. 메타데이터 IPFS에 업로드
      const ipIpfsResult = await this.ipfsService.uploadJSON(ipMetadata);
      const nftIpfsResult = await this.ipfsService.uploadJSON(nftMetadata);
      
      logger.info('메타데이터 업로드 완료', {
        ipIpfsCid: ipIpfsResult.ipfsCid,
        nftIpfsCid: nftIpfsResult.ipfsCid
      });

      // 5. bytes32 해시 생성
      const ipMetadataBytes32Hash = Validator.generateBytes32Hash(JSON.stringify(ipMetadata));
      const nftMetadataBytes32Hash = Validator.generateBytes32Hash(JSON.stringify(nftMetadata));
      
      // 6. Story Protocol에 IP 등록
      const registerParams = {
        ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsResult.ipfsCid}`,
        ipMetadataHash: ipMetadataBytes32Hash as HashOrAddress,
        nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsResult.ipfsCid}`,
        nftMetadataHash: nftMetadataBytes32Hash as HashOrAddress,
      };
      
      logger.debug('IP 등록 요청 준비 완료', registerParams);
      
      const registerResult = await this.storyService.mintAndRegisterIp(registerParams);
      
      logger.info('IP 등록 성공', {
        ipId: registerResult.ipId,
        txHash: registerResult.txHash
      });

      // 7. 응답 생성
      const response: RegisterIPResponse = {
        status: 'success',
        ipId: registerResult.ipId,
        transactionHash: registerResult.txHash,
        ipfsData: {
          mediaUrl: `https://ipfs.io/ipfs/${contentResult.ipfsCid}`,
          metadataUrl: `https://ipfs.io/ipfs/${ipIpfsResult.ipfsCid}`
        }
      };
      
      res.status(201).json(response);
    } catch (error) {
      logger.error('IP 등록 실패', { error });
      
      // 에러가 StoryProtocolError가 아닌 경우 변환
      if (!(error instanceof StoryProtocolError)) {
        error = new StoryProtocolError({
          code: 'IP_REGISTRATION_FAILED',
          message: (error as Error).message || 'IP 등록에 실패했습니다',
          cause: error as Error
        });
      }
      
      next(error);
    }
  };
  
  /**
   * 기존 NFT IP 등록 컨트롤러
   */
  registerExistingNft = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('기존 NFT IP 등록 요청 수신', { 
        path: req.path, 
        method: req.method 
      });
      
      const { 
        nftContract, 
        tokenId, 
        ipMetadataURI, 
        ipMetadataHash, 
        nftMetadataURI, 
        nftMetadataHash 
      } = req.body;
      
      const result = await this.storyService.registerExistingNft({
        nftContract,
        tokenId,
        ipMetadataURI,
        ipMetadataHash,
        nftMetadataURI,
        nftMetadataHash
      });
      
      logger.info('기존 NFT IP 등록 성공', { 
        ipId: result.ipId, 
        txHash: result.txHash 
      });
      
      const response: RegisterIPResponse = {
        status: 'success',
        ipId: result.ipId,
        transactionHash: result.txHash,
        ipfsData: {
          mediaUrl: nftMetadataURI,
          metadataUrl: ipMetadataURI
        }
      };
      
      res.status(201).json(response);
    } catch (error) {
      logger.error('기존 NFT IP 등록 실패', { error });
      
      // 에러가 StoryProtocolError가 아닌 경우 변환
      if (!(error instanceof StoryProtocolError)) {
        error = new StoryProtocolError({
          code: 'IP_REGISTRATION_FAILED',
          message: (error as Error).message || '기존 NFT IP 등록에 실패했습니다',
          cause: error as Error
        });
      }
      
      next(error);
    }
  };
}