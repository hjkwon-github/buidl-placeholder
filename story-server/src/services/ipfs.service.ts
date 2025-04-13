import { PinataSDK } from 'pinata-web3';
import { createHash } from 'crypto';
import { Logger } from './logger.service';
import { StoryProtocolError } from '../types/errors';
import { IPFSUploadResult } from '../types/ip.types';

/**
 * IPFS Service Class (Singleton Pattern)
 */
export class IPFSService {
  private static instance: IPFSService | null = null;
  private pinata: PinataSDK;
  private logger: Logger;

  /**
   * IPFS Service Constructor
   * @param logger Logger instance
   */
  private constructor(logger: Logger) {
    this.logger = logger;
    this.pinata = new PinataSDK({
      pinataJwt: process.env.PINATA_JWT,
    });
    this.logger.info('IPFS service initialized');
  }

  /**
   * Get IPFSService instance (Singleton Pattern)
   * @param logger Logger instance
   * @returns IPFSService instance
   */
  public static getInstance(logger: Logger): IPFSService {
    if (!IPFSService.instance) {
      IPFSService.instance = new IPFSService(logger);
    }
    return IPFSService.instance;
  }

  /**
   * Reset instance for testing
   */
  public static resetInstance(): void {
    IPFSService.instance = null;
  }

  /**
   * Upload content to IPFS
   * @param fileUrl URL of the file to upload
   * @returns IPFS upload result
   */
  async uploadContent(fileUrl: string): Promise<IPFSUploadResult> {
    try {
      this.logger.debug('Downloading content...', { url: fileUrl });
      
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const buffer = Buffer.from(await response.arrayBuffer());
      const contentHash = '0x' + createHash('sha256').update(buffer).digest('hex');
      
      // Generate filename
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const file = new File([buffer], filename, { type: contentType });
      
      this.logger.debug('Uploading content to IPFS...', { 
        filename, 
        contentType, 
        size: buffer.length 
      });
      
      const result = await this.pinata.upload.file(file);
      
      this.logger.info('IPFS content upload successful', { ipfsCid: result.IpfsHash });
      
      return {
        ipfsCid: result.IpfsHash,
        contentType,
        contentHash,
      };
    } catch (error) {
      this.logger.error('IPFS content upload failed', { error });
      throw new StoryProtocolError({
        code: 'IPFS_UPLOAD_FAILED',
        message: 'File upload failed',
        cause: error as Error,
      });
    }
  }

  /**
   * Upload JSON data to IPFS
   * @param jsonData JSON data to upload
   * @returns IPFS upload result
   */
  async uploadJSON(jsonData: any): Promise<IPFSUploadResult> {
    try {
      this.logger.debug('Uploading JSON to IPFS...', { data: jsonData });
      
      const result = await this.pinata.upload.json(jsonData);
      const hash = '0x' + createHash('sha256')
        .update(JSON.stringify(jsonData))
        .digest('hex');
      
      this.logger.info('IPFS JSON upload successful', { ipfsCid: result.IpfsHash });
      
      return { 
        ipfsCid: result.IpfsHash, 
        hash 
      };
    } catch (error) {
      this.logger.error('IPFS JSON upload failed', { error });
      throw new StoryProtocolError({
        code: 'IPFS_METADATA_UPLOAD_FAILED',
        message: 'Metadata upload failed',
        cause: error as Error,
      });
    }
  }
} 