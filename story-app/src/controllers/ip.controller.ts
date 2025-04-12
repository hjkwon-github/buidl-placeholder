import { Request, Response, NextFunction } from 'express';
import { StoryService } from '../services/story.service';
import { IPFSService } from '../services/ipfs.service';
import { Logger } from '../services/logger.service';
import { RegisterIPRequest, RegisterIPResponse, StoryDetailResponse } from '../types/ip.types';
import { HashOrAddress } from '../types/story.types';
import { StoryProtocolError } from '../types/errors';
import { Validator } from '../utils/validator';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create logger instance
const logger = new Logger();

// 블록 익스플로러 URL 환경 변수에서 가져오기
const BLOCK_EXPLORER_URL = process.env.BLOCK_EXPLORER_URL || 'https://aeneid.explorer.story.xyz/tx/';

/**
 * IP Controller Class
 */
export class IpController {
  private storyService: StoryService;
  private ipfsService: IPFSService;

  /**
   * Constructor
   */
  constructor() {
    this.storyService = new StoryService(logger);
    this.ipfsService = IPFSService.getInstance(logger);
  }

  /**
   * 트랜잭션 익스플로러 URL 생성
   */
  private getTransactionUrl(transactionHash: string): string {
    return `${BLOCK_EXPLORER_URL}${transactionHash}`;
  }

  /**
   * IP Registration Controller
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('IP registration request received', { 
        path: req.path, 
        method: req.method,
        contentType: req.headers['content-type']
      });

      // Parse request data
      const requestData: RegisterIPRequest = req.body;
      
      // 1. File upload
      logger.debug('Content upload started', { fileUrl: requestData.fileUrl });
      const contentResult = await this.ipfsService.uploadContent(requestData.fileUrl);
      logger.info('Content upload completed', { 
        ipfsCid: contentResult.ipfsCid,
        contentType: contentResult.contentType
      });

      // 2. Generate IP metadata
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
      
      // 3. Generate NFT metadata
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
        // Add license information if available
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

      // 4. Upload metadata to IPFS
      const ipIpfsResult = await this.ipfsService.uploadJSON(ipMetadata);
      const nftIpfsResult = await this.ipfsService.uploadJSON(nftMetadata);
      
      logger.info('Metadata upload completed', {
        ipIpfsCid: ipIpfsResult.ipfsCid,
        nftIpfsCid: nftIpfsResult.ipfsCid
      });

      // 5. Generate bytes32 hash
      const ipMetadataBytes32Hash = Validator.generateBytes32Hash(JSON.stringify(ipMetadata));
      const nftMetadataBytes32Hash = Validator.generateBytes32Hash(JSON.stringify(nftMetadata));
      
      // 6. Register IP with Story Protocol
      const registerParams = {
        ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsResult.ipfsCid}`,
        ipMetadataHash: ipMetadataBytes32Hash as HashOrAddress,
        nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsResult.ipfsCid}`,
        nftMetadataHash: nftMetadataBytes32Hash as HashOrAddress,
      };
      
      logger.debug('IP registration request prepared', registerParams);
      
      const registerResult = await this.storyService.mintAndRegisterIp(registerParams);
      
      logger.info('IP registration successful', {
        ipId: registerResult.ipId,
        txHash: registerResult.txHash
      });

      // 7. Generate response
      const response: RegisterIPResponse = {
        status: 'success',
        ipId: registerResult.ipId,
        transactionHash: registerResult.txHash,
        transactionUrl: this.getTransactionUrl(registerResult.txHash),
        ipfsData: {
          mediaUrl: `https://ipfs.io/ipfs/${contentResult.ipfsCid}`,
          metadataUrl: `https://ipfs.io/ipfs/${ipIpfsResult.ipfsCid}`
        }
      };
      
      res.status(201).json(response);
    } catch (error) {
      logger.error('IP registration failed', { error });
      
      // Convert error to StoryProtocolError if not already
      if (!(error instanceof StoryProtocolError)) {
        error = new StoryProtocolError({
          code: 'IP_REGISTRATION_FAILED',
          message: (error as Error).message || 'IP registration failed',
          cause: error as Error
        });
      }
      
      next(error);
    }
  };
  
  /**
   * Existing NFT IP Registration Controller
   */
  registerExistingNft = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('Existing NFT IP registration request received', { 
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
      
      logger.info('Existing NFT IP registration successful', { 
        ipId: result.ipId, 
        txHash: result.txHash 
      });
      
      const response: RegisterIPResponse = {
        status: 'success',
        ipId: result.ipId,
        transactionHash: result.txHash,
        transactionUrl: this.getTransactionUrl(result.txHash),
        ipfsData: {
          mediaUrl: nftMetadataURI,
          metadataUrl: ipMetadataURI
        }
      };
      
      res.status(201).json(response);
    } catch (error) {
      logger.error('Existing NFT IP registration failed', { error });
      
      // Convert error to StoryProtocolError if not already
      if (!(error instanceof StoryProtocolError)) {
        error = new StoryProtocolError({
          code: 'IP_REGISTRATION_FAILED',
          message: (error as Error).message || 'Existing NFT IP registration failed',
          cause: error as Error
        });
      }
      
      next(error);
    }
  };

  /**
   * IP Asset Detail Retrieval Controller
   */
  getStoryDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('IP asset detail retrieval request received', { 
        path: req.path, 
        method: req.method,
        ipId: req.params.ipId
      });
      
      const ipId = req.params.ipId;
      
      // Retrieve IP asset details through Story service
      const ipAssetDetail = await this.storyService.getStoryDetail(ipId);
      
      logger.info('IP asset detail retrieval successful', { 
        ipId: ipAssetDetail.ipId,
        title: ipAssetDetail.title 
      });
      
      // Generate response
      const response: StoryDetailResponse = {
        status: 'success',
        data: {
          ipId: ipAssetDetail.ipId,
          owner: ipAssetDetail.owner,
          status: ipAssetDetail.status,
          registrationDate: ipAssetDetail.registrationDate,
          nftContract: ipAssetDetail.nftContract,
          tokenId: ipAssetDetail.tokenId,
          mediaUrl: ipAssetDetail.mediaUrl,
          title: ipAssetDetail.title,
          description: ipAssetDetail.description,
          creator: ipAssetDetail.creator,
          viewUrl: ipAssetDetail.viewUrl,
          transactionHash: ipAssetDetail.transactionHash,
          transactionUrl: ipAssetDetail.transactionHash ? this.getTransactionUrl(ipAssetDetail.transactionHash) : undefined,
          // Include metadata based on requirements
          metadata: {
            ip: ipAssetDetail.ipMetadata,
            nft: ipAssetDetail.nftMetadata
          }
        }
      };
      
      res.status(200).json(response);
    } catch (error) {
      logger.error('IP asset detail retrieval failed', { error });
      
      // Convert error to StoryProtocolError if not already
      if (!(error instanceof StoryProtocolError)) {
        error = new StoryProtocolError({
          code: 'STORY_DETAIL_FAILED',
          message: (error as Error).message || 'IP asset detail retrieval failed',
          cause: error as Error
        });
      }
      
      // Return appropriate status code for 404 errors
      if ((error as StoryProtocolError).code === 'IP_ASSET_NOT_FOUND') {
        res.status(404).json({
          status: 'error',
          message: `IP asset not found: ${req.params.ipId}`,
          error: 'IP_ASSET_NOT_FOUND'
        });
        return;
      }
      
      // Pass other errors to middleware
      next(error);
    }
  };
}