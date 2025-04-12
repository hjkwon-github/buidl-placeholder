import dotenv from 'dotenv';
import { IpController } from '../controllers/ip.controller';
import { Logger } from '../services/logger.service';
import { StoryService } from '../services/story.service';

// Load environment variables
dotenv.config();

/**
 * IP 자산 상세 정보 조회 테스트
 */
async function testGetStoryDetail() {
  // 로거 초기화
  const logger = new Logger();
  logger.info('IP 자산 상세 정보 조회 테스트 시작');

  try {
    // StoryService 직접 테스트
    logger.info('StoryService 초기화');
    const storyService = new StoryService(logger);
    
    // IP 컨트롤러 초기화
    logger.info('IP 컨트롤러 초기화');
    const ipController = new IpController();

    // 테스트할 IP ID 설정
    // 참고: 이는 테스트 IP ID로, 실제 존재하는 IP ID로 변경해야 합니다.
    const testIpId = process.env.TEST_IP_ID || 'IP-0x0000000000000000000000000000000000000000000000000000000000000001';
    
    logger.info('테스트 IP ID:', { ipId: testIpId });

    // 테스트 방식 선택 (환경 변수 RUN_ACTUAL_TEST가 'true'인 경우 실제 테스트 실행)
    if (process.env.RUN_ACTUAL_TEST === 'true') {
      logger.info('실제 블록체인 조회 테스트 시작');
      
      try {
        // 1. StoryService 직접 테스트
        logger.info('StoryService.getStoryDetail 호출');
        const ipAssetDetail = await storyService.getStoryDetail(testIpId);
        
        logger.info('StoryService 조회 성공', { 
          ipId: ipAssetDetail.ipId,
          title: ipAssetDetail.title,
          owner: ipAssetDetail.owner
        });
        
        console.log('\n===== StoryService 응답 데이터 =====');
        console.log(JSON.stringify(ipAssetDetail, null, 2));
        console.log('=====================================\n');
        
        // 2. 컨트롤러 테스트
        logger.info('컨트롤러 테스트 시작');
        
        // 목 요청/응답 객체 생성
        const mockReq = {
          params: { ipId: testIpId },
          path: `/api/v1/ip/${testIpId}`,
          method: 'GET',
          headers: {
            'content-type': 'application/json'
          }
        };
        
        const mockRes = {
          status: (statusCode: number) => {
            logger.info(`응답 상태 코드: ${statusCode}`);
            return {
              json: (data: any) => {
                logger.info('응답 데이터:', data);
                console.log('\n===== 컨트롤러 응답 데이터 =====');
                console.log(JSON.stringify(data, null, 2));
                console.log('===================================\n');
              }
            };
          }
        };
        
        const mockNext = (error?: any) => {
          if (error) {
            logger.error('에러 발생:', error);
            console.error('\n===== 에러 발생 =====');
            console.error(error);
            console.error('=====================\n');
          }
        };
        
        // 컨트롤러 메서드 호출
        await ipController.getStoryDetail(
          mockReq as any, 
          mockRes as any, 
          mockNext as any
        );
        
        logger.info('컨트롤러 테스트 완료');
      } catch (error) {
        logger.error('블록체인 조회 테스트 실패', { error });
        console.error('\n===== 블록체인 조회 실패 =====');
        console.error(error);
        console.error('=============================\n');
      }
    } else {
      // 실제 테스트가 아닌 시뮬레이션만 실행
      logger.warn('RUN_ACTUAL_TEST가 true로 설정되지 않아 시뮬레이션만 수행합니다.');
      
      console.log('\n===== IP 자산 상세 정보 조회 시뮬레이션 =====');
      console.log('1. IP ID 유효성 검증');
      console.log('2. Story Protocol SDK 초기화');
      console.log('3. SDK를 통해 블록체인에서 IP 자산 정보 조회');
      console.log('4. IPFS에서 IP 메타데이터 조회');
      console.log('5. IPFS에서 NFT 메타데이터 조회');
      console.log('6. 결과 데이터 가공');
      console.log('7. 응답 생성');
      console.log('===========================================\n');
      
      // 조회 실패 테스트 (유효하지 않은 IP ID)
      console.log('\n===== 예상 실패 케이스 =====');
      console.log('1. 유효하지 않은 IP ID 형식: "invalid-id"');
      console.log('2. 존재하지 않는 IP ID: "IP-0x9999999999999999999999999999999999999999999999999999999999999999"');
      console.log('3. IPFS 메타데이터 조회 실패');
      console.log('===========================\n');
      
      logger.info('IP 자산 상세 정보 조회 시뮬레이션 완료');
    }
    
    // HTTP 테스트 안내
    console.log('\n===== HTTP 요청 테스트 방법 =====');
    console.log('다음 HTTP 요청을 사용하여 API를 테스트할 수 있습니다:');
    console.log('GET http://localhost:3000/api/v1/ip/[IP-ID]');
    console.log('예시: GET http://localhost:3000/api/v1/ip/IP-0x123...');
    console.log('===================================\n');
    
    logger.info('IP 자산 상세 정보 조회 테스트 완료');
  } catch (error) {
    logger.error('IP 자산 상세 정보 조회 테스트 실패', { error });
    console.error('테스트 중 오류가 발생했습니다:', error);
  }
}

// 테스트 실행
testGetStoryDetail().catch(console.error); 