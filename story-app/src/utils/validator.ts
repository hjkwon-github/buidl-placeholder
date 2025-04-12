import { RegisterIPRequest } from '../types/ip.types';
import { StoryProtocolError } from '../types/errors';
import { isAddress } from 'viem';

/**
 * 요청 유효성 검증 유틸리티
 */
export class Validator {
  /**
   * IP 등록 요청 유효성 검증
   * @param request 요청 데이터
   */
  static validateRegisterIPRequest(request: RegisterIPRequest): void {
    // 필수 필드 확인
    if (!request.title) {
      throw new StoryProtocolError({
        code: 'INVALID_REQUEST',
        message: '제목은 필수 입력 항목입니다.',
      });
    }

    if (!request.description) {
      throw new StoryProtocolError({
        code: 'INVALID_REQUEST',
        message: '설명은 필수 입력 항목입니다.',
      });
    }

    if (!request.fileUrl) {
      throw new StoryProtocolError({
        code: 'INVALID_REQUEST',
        message: '파일 URL은 필수 입력 항목입니다.',
      });
    }

    if (!request.creators || request.creators.length === 0) {
      throw new StoryProtocolError({
        code: 'INVALID_REQUEST',
        message: '최소 한 명 이상의 창작자 정보가 필요합니다.',
      });
    }

    // URL 형식 확인
    if (!Validator.isValidUrl(request.fileUrl)) {
      throw new StoryProtocolError({
        code: 'INVALID_CONTENT_URL',
        message: '유효하지 않은 파일 URL 형식입니다.',
      });
    }

    // 창작자 기여도 합계 확인
    const totalContribution = request.creators.reduce(
      (sum, creator) => sum + creator.contributionPercent,
      0
    );

    if (totalContribution !== 100) {
      throw new StoryProtocolError({
        code: 'INVALID_REQUEST',
        message: '창작자 기여도의 합계는 100%가 되어야 합니다.',
      });
    }

    // 창작자 주소 형식 확인
    for (const creator of request.creators) {
      if (!Validator.isValidEthereumAddress(creator.address)) {
        throw new StoryProtocolError({
          code: 'INVALID_REQUEST',
          message: `유효하지 않은 창작자 주소 형식입니다: ${creator.address}`,
        });
      }
    }
  }

  /**
   * URL 유효성 검증
   * @param url 검증할 URL
   * @returns 유효 여부
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * 이더리움 주소 유효성 검증
   * @param address 검증할 주소
   * @returns 유효 여부
   */
  static isValidEthereumAddress(address: string): boolean {
    // 기본 정규식 검증: 0x로 시작하는 40자리 16진수 문자열
    const basicCheck = /^0x[a-fA-F0-9]{40}$/.test(address);
    
    const viemCheck = isAddress(address);
    return basicCheck && viemCheck;
  }
  
  /**
   * bytes32 해시 유효성 검증
   * @param hash 검증할 해시 값
   * @returns 유효 여부
   */
  static isValidBytes32Hash(hash: string): boolean {
    // bytes32 해시는 0x로 시작하는 64자리 16진수 문자열
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
  }
  
  /**
   * 32바이트 해시 생성
   * @param input 해시 생성 대상 문자열
   * @returns 32바이트 해시
   */
  static generateBytes32Hash(input: string): string {
    const crypto = require('crypto');
    return '0x' + crypto.createHash('sha256').update(input).digest('hex');
  }
  
  /**
   * 이더리움 주소 또는 해시 형식 검증 (유연한 검증)
   * @param value 검증할 문자열
   * @returns 유효 여부
   */
  static isValidAddressOrHash(value: string): boolean {
    // 0x로 시작하고 최소 40자 이상의 16진수 문자열
    return /^0x[a-fA-F0-9]{40,}$/.test(value);
  }
} 