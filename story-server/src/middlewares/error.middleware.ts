import { Request, Response, NextFunction, ErrorRequestHandler, RequestHandler } from 'express';
import { StoryProtocolError } from '../types/errors';
import { Logger } from '../services/logger.service';

// 로거 인스턴스 생성
const logger = new Logger();

/**
 * 전역 에러 핸들러 미들웨어
 */
export const errorHandler: ErrorRequestHandler = (
  err: Error | StoryProtocolError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 기본 응답 구조
  const response = {
    status: 'error',
    errorMessage: err.message || 'An unexpected error occurred',
    errorCode: 'UNKNOWN_ERROR',
    details: undefined as string | undefined,
  };

  // 스택 트레이스 (개발 환경에서만)
  const stack = process.env.NODE_ENV === 'development' ? err.stack : undefined;

  // StoryProtocolError인 경우 추가 정보 설정
  if (err instanceof StoryProtocolError) {
    response.errorCode = err.code;
    response.details = err.cause?.message;

    // 에러 코드에 따른 HTTP 상태 코드 매핑
    const statusCodeMap: Record<string, number> = {
      'INVALID_REQUEST': 400,
      'INVALID_ETHEREUM_ADDRESS': 400,
      'IPFS_UPLOAD_FAILED': 500,
      'IPFS_METADATA_UPLOAD_FAILED': 500,
      'STORY_CLIENT_INIT_FAILED': 500,
      'STORY_REGISTER_FAILED': 500,
      'IP_METADATA_GENERATION_FAILED': 500,
      'INVALID_IP_REGISTRATION_RESPONSE': 500,
    };

    const statusCode = statusCodeMap[err.code] || 500;
    
    // 에러 로깅
    logger.error(`[${response.errorCode}] ${response.errorMessage}`, {
      path: req.path,
      method: req.method,
      error: err,
      context: err.context
    });

    res.status(statusCode).json(response);
    return;
  }

  // 기타 에러 처리
  logger.error(`Unhandled error: ${response.errorMessage}`, {
    path: req.path,
    method: req.method,
    stack
  });

  // 500 Internal Server Error 반환
  res.status(500).json(response);
};

/**
 * 404 Not Found 핸들러 미들웨어
 */
export const notFoundHandler: RequestHandler = (req: Request, res: Response): void => {
  logger.warn(`Not found: ${req.method} ${req.path}`);
  
  res.status(404).json({
    status: 'error',
    errorCode: 'NOT_FOUND',
    errorMessage: `Route not found: ${req.method} ${req.path}`,
  });
};

/**
 * 유효성 검증 미들웨어
 */
export const validateRequest = (schema: any): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // 요청 데이터 검증
      const { error } = schema.validate(req.body);
      
      if (error) {
        throw new StoryProtocolError({
          code: 'INVALID_REQUEST',
          message: 'Invalid request data',
          context: { validationError: error.details },
          cause: error
        });
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};