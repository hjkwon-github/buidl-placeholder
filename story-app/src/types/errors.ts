/**
 * 에러 옵션 인터페이스
 */
export interface ErrorOptions {
  code: string;
  message: string;
  context?: Record<string, any>;
  cause?: Error;
}

/**
 * Story Protocol 에러 클래스
 */
export class StoryProtocolError extends Error {
  code: string;
  context?: Record<string, any>;
  cause?: Error;

  constructor(options: ErrorOptions) {
    super(options.message);
    this.name = "StoryProtocolError";
    this.code = options.code;
    this.context = options.context;
    this.cause = options.cause;
  }
} 