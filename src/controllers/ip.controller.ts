import { Request, Response, NextFunction } from 'express';
import { StoryService } from '../services/story.service';
import { IPFSService } from '../services/ipfs.service';
import { Logger } from '../services/logger.service';
import { RegisterIPRequest, RegisterIPResponse } from '../types/ip.types';
import { HashOrAddress } from '../types/story.types';
import { StoryProtocolError } from '../types/errors';
import { Validator } from '../utils/validator';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create logger instance
const logger = new Logger();

const BLOCK_EXPLORER_URL = process.env.BLOCK_EXPLORER_URL || 'https://aeneid.storyscan.io/tx/';

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
}