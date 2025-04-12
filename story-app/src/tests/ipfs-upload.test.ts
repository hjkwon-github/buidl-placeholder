import dotenv from 'dotenv';
import { IPFSService } from '../services/ipfs.service';
import { Logger } from '../services/logger.service';

dotenv.config();

async function testIPFSUpload() {
  // 로거 초기화
  const logger = new Logger();
  logger.info('IPFS 업로드 테스트 시작');

  // IPFS 서비스 초기화
  const ipfsService = new IPFSService(logger);

  try {
    // 샘플 이미지 URL (테스트용)
    const testImageUrl = 'https://picsum.photos/200';
    
    // 파일 업로드 테스트
    logger.info('이미지 파일 업로드 테스트');
    const contentResult = await ipfsService.uploadContent(testImageUrl);
    logger.info('이미지 업로드 결과', contentResult);
    
    // 메타데이터 업로드 테스트
    logger.info('JSON 메타데이터 업로드 테스트');
    const metadata = {
      title: '테스트 이미지',
      description: 'IPFS 업로드 테스트를 위한 이미지입니다.',
      image: `ipfs://${contentResult.ipfsCid}`,
      attributes: [
        {
          trait_type: 'Category',
          value: 'Test'
        }
      ]
    };
    
    const jsonResult = await ipfsService.uploadJSON(metadata);
    logger.info('메타데이터 업로드 결과', jsonResult);
    
    // 결과 출력
    console.log('\n========== IPFS 업로드 테스트 결과 ==========');
    console.log(`이미지 IPFS CID: ${contentResult.ipfsCid}`);
    console.log(`이미지 URL: https://ipfs.io/ipfs/${contentResult.ipfsCid}`);
    console.log(`메타데이터 IPFS CID: ${jsonResult.ipfsCid}`);
    console.log(`메타데이터 URL: https://ipfs.io/ipfs/${jsonResult.ipfsCid}`);
    console.log('===============================================\n');
    
    logger.info('IPFS 업로드 테스트 완료');
  } catch (error) {
    logger.error('IPFS 업로드 테스트 실패', { error });
    console.error('테스트 중 오류가 발생했습니다:', error);
  }
}

// 테스트 실행
testIPFSUpload().catch(console.error); 