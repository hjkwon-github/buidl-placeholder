import { PinataSDK } from 'pinata-web3';
import axios from 'axios';
import { createHash } from 'crypto';
import { Logger } from './logger.service';
import { StoryProtocolError } from '../types/errors';
import { IPFSUploadResult } from '../types/ip.types';

/**
 * IPFS 서비스 클래스 (싱글톤 패턴)
 */
export class IPFSService {
  private static instance: IPFSService | null = null;
  private pinata: PinataSDK;
  private logger: Logger;

  /**
   * IPFS 서비스 생성자
   * @param logger 로거 인스턴스
   */
  private constructor(logger: Logger) {
    this.logger = logger;
    this.pinata = new PinataSDK({
      pinataJwt: process.env.PINATA_JWT,
    });
    this.logger.info('IPFS service initialized');
  }

  /**
   * IPFSService 인스턴스 반환 (싱글톤 패턴)
   * @param logger 로거 인스턴스
   * @returns IPFSService 인스턴스
   */
  public static getInstance(logger: Logger): IPFSService {
    if (!IPFSService.instance) {
      IPFSService.instance = new IPFSService(logger);
    }
    return IPFSService.instance;
  }

  /**
   * 테스트용 인스턴스 초기화 메서드
   */
  public static resetInstance(): void {
    IPFSService.instance = null;
  }

  /**
   * 컨텐츠를 IPFS에 업로드
   * @param fileUrl 업로드할 파일 URL
   * @returns IPFS 업로드 결과
   */
  async uploadContent(fileUrl: string): Promise<IPFSUploadResult> {
    try {
      this.logger.debug('컨텐츠 다운로드 중...', { url: fileUrl });
      
      const response = await axios.get(fileUrl, {
        responseType: 'arraybuffer',
        validateStatus: (status) => status === 200,
      });

      const contentType = response.headers['content-type'];
      const buffer = Buffer.from(response.data);
      const contentHash = '0x' + createHash('sha256').update(buffer).digest('hex');
      
      // 파일명 생성
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const file = new File([buffer], filename, { type: contentType });
      
      this.logger.debug('IPFS에 컨텐츠 업로드 중...', { 
        filename, 
        contentType, 
        size: buffer.length 
      });
      
      const result = await this.pinata.upload.file(file);
      
      this.logger.info('IPFS 컨텐츠 업로드 성공', { ipfsCid: result.IpfsHash });
      
      return {
        ipfsCid: result.IpfsHash,
        contentType,
        contentHash,
      };
    } catch (error) {
      this.logger.error('IPFS 컨텐츠 업로드 실패', { error });
      throw new StoryProtocolError({
        code: 'IPFS_UPLOAD_FAILED',
        message: '파일 업로드에 실패했습니다',
        cause: error as Error,
      });
    }
  }

  /**
   * JSON 데이터를 IPFS에 업로드
   * @param jsonData 업로드할 JSON 데이터
   * @returns IPFS 업로드 결과
   */
  async uploadJSON(jsonData: any): Promise<IPFSUploadResult> {
    try {
      this.logger.debug('IPFS에 JSON 업로드 중...', { data: jsonData });
      
      const result = await this.pinata.upload.json(jsonData);
      const hash = '0x' + createHash('sha256')
        .update(JSON.stringify(jsonData))
        .digest('hex');
      
      this.logger.info('IPFS JSON 업로드 성공', { ipfsCid: result.IpfsHash });
      
      return { 
        ipfsCid: result.IpfsHash, 
        hash 
      };
    } catch (error) {
      this.logger.error('IPFS JSON 업로드 실패', { error });
      throw new StoryProtocolError({
        code: 'IPFS_METADATA_UPLOAD_FAILED',
        message: '메타데이터 업로드에 실패했습니다',
        cause: error as Error,
      });
    }
  }
} 