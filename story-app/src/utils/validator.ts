import { RegisterIPRequest } from '../types/ip.types';
import { StoryProtocolError } from '../types/errors';

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
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
} 