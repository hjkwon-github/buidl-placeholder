// @ts-ignore - 타입 문제 무시 (SDK와 타입 호환성 문제)
import dotenv from 'dotenv';
import { StoryService } from '../services/story.service';
import { Logger } from '../services/logger.service';
import { IPFSService } from '../services/ipfs.service';
import { createHash } from 'crypto';
import { type Address, isAddress } from 'viem';
import { Validator } from '../utils/validator';
import { HashOrAddress, MintAndRegisterIpParams } from '../types/story.types';

// 환경 변수 로드
dotenv.config();

/**
 * 이더리움 주소 형식으로 변환 및 유효성 검증
 * @param address 주소 문자열
 * @returns 0x로 시작하는 이더리움 주소
 */
function formatAddress(address: string): Address {
  const formattedAddress = address.startsWith('0x') ? address : `0x${address}`;
  
  if (!Validator.isValidEthereumAddress(formattedAddress)) {
    throw new Error(`유효하지 않은 이더리움 주소: ${formattedAddress}`);
  }
  
  return formattedAddress as Address;
}

/**
 * Story Protocol 서비스 테스트
 */
async function testStoryProtocol() {
  // 로거 초기화
  const logger = new Logger();
  logger.info('Story Protocol 서비스 테스트 시작');

  try {
    // 1. Story 서비스 초기화
    const storyService = new StoryService(logger);
    logger.info('Story 서비스 초기화 완료');

    // 2. IPFS 서비스 초기화
    const ipfsService = new IPFSService(logger);
    logger.info('IPFS 서비스 초기화 완료');

    // 3. 샘플 이미지 IPFS에 업로드 
    const testImageUrl = 'https://picsum.photos/200';
    const contentResult = await ipfsService.uploadContent(testImageUrl);
    logger.info('이미지 업로드 결과', contentResult);

    // 주소 유효성 검증
    const creatorAddress = formatAddress('0xCaa2da8aF50327B31FC5Ee19472E883D830B9c4B');
    logger.info('크리에이터 주소 검증 완료', { address: creatorAddress });
    
    // 콘텐츠 해시값 저장 (이더리움 주소로 사용하지 않음)
    const imageContentHash = contentResult.contentHash || '';
    
    // 가상 주소 (실제 테스트에서만 사용) - 여기서는 creator 주소를 재사용
    const dummyAddress = creatorAddress;

    // 4. IP 메타데이터 생성
    const ipMetadata = storyService.generateIpMetadata({
      title: 'Story Protocol 테스트 이미지',
      description: 'Story Protocol SDK를 테스트하기 위한 이미지입니다.',
      image: `https://ipfs.io/ipfs/${contentResult.ipfsCid}`,
      imageHash: dummyAddress.toString(), // 가상 주소 사용
      mediaUrl: `https://ipfs.io/ipfs/${contentResult.ipfsCid}`,
      mediaHash: dummyAddress.toString(), // 가상 주소 사용
      mediaType: contentResult.contentType || 'image/jpeg',
      creators: [
        {
          name: '테스트 사용자',
          address: creatorAddress.toString(),
          contributionPercent: 100,
        },
      ],
    });
    logger.info('IP 메타데이터 생성 완료', { metadata: ipMetadata });

    // 5. NFT 메타데이터 생성
    const nftMetadata = {
      name: 'Story Protocol 테스트 NFT',
      description: 'Story Protocol SDK를 테스트하기 위한 NFT입니다.',
      image: `https://ipfs.io/ipfs/${contentResult.ipfsCid}`,
      attributes: [
        {
          trait_type: 'Type',
          value: 'Test',
        },
        {
          trait_type: 'Category',
          value: 'Image',
        },
      ],
    };
    logger.info('NFT 메타데이터 생성 완료');

    // 6. 메타데이터 IPFS에 업로드
    const ipIpfsResult = await ipfsService.uploadJSON(ipMetadata);
    const ipHash = ipIpfsResult.hash || '0x' + createHash('sha256').update(JSON.stringify(ipMetadata)).digest('hex');
    
    const nftIpfsResult = await ipfsService.uploadJSON(nftMetadata);
    const nftHash = nftIpfsResult.hash || '0x' + createHash('sha256').update(JSON.stringify(nftMetadata)).digest('hex');
    
    logger.info('메타데이터 업로드 완료', {
      ipIpfsCid: ipIpfsResult.ipfsCid,
      nftIpfsCid: nftIpfsResult.ipfsCid
    });

    // 7. 등록 정보 출력 및 실제 등록 실행
    console.log('\n===== Story Protocol 등록 정보 =====');
    console.log(`IP 메타데이터 IPFS CID: ${ipIpfsResult.ipfsCid}`);
    console.log(`IP 메타데이터 URL: https://ipfs.io/ipfs/${ipIpfsResult.ipfsCid}`);
    console.log(`NFT 메타데이터 IPFS CID: ${nftIpfsResult.ipfsCid}`);
    console.log(`NFT 메타데이터 URL: https://ipfs.io/ipfs/${nftIpfsResult.ipfsCid}`);
    
    // 실제 등록 수행
    if (process.env.WALLET_PRIVATE_KEY) {
      logger.info('Story Protocol에 IP 등록 시작');
      
      // bytes32 해시 생성 - Validator 사용
      const ipMetadataBytes32Hash = Validator.generateBytes32Hash(JSON.stringify(ipMetadata));
      const nftMetadataBytes32Hash = Validator.generateBytes32Hash(JSON.stringify(nftMetadata));
      
      // 해시 형식 검증
      if (!Validator.isValidBytes32Hash(ipMetadataBytes32Hash) || !Validator.isValidBytes32Hash(nftMetadataBytes32Hash)) {
        throw new Error('유효하지 않은 해시 형식입니다. 32바이트 해시가 필요합니다.');
      }
      
      // 타입 호환성을 위해 타입 단언 사용
      const registerParams = {
        ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsResult.ipfsCid}`,
        ipMetadataHash: ipMetadataBytes32Hash as HashOrAddress,
        nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsResult.ipfsCid}`,
        nftMetadataHash: nftMetadataBytes32Hash as HashOrAddress,
      } as MintAndRegisterIpParams;
      
      console.log('\n등록 파라미터:', registerParams);
      
      const registerResult = await storyService.mintAndRegisterIp(registerParams);
      logger.info('IP 등록 결과', registerResult);
      
      console.log('\n===== 등록 결과 =====');
      console.log(`IP ID: ${registerResult.ipId}`);
      console.log(`트랜잭션 해시: ${registerResult.txHash}`);
      console.log(`StoryScan 주소: ${registerResult.viewUrl || `https://aeneid.storyscan.io/tx/${registerResult.txHash}`}`);
      console.log('=====================\n');
    } else {
      console.log('\n실제 등록을 수행하려면 WALLET_PRIVATE_KEY 환경 변수를 설정하세요.');
      
      // bytes32 해시 생성 - Validator 사용
      const ipMetadataBytes32Hash = Validator.generateBytes32Hash(JSON.stringify(ipMetadata));
      const nftMetadataBytes32Hash = Validator.generateBytes32Hash(JSON.stringify(nftMetadata));
      
      console.log('등록에 필요한 파라미터:', {
        ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsResult.ipfsCid}`,
        ipMetadataHash: ipMetadataBytes32Hash as HashOrAddress,
        nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsResult.ipfsCid}`,
        nftMetadataHash: nftMetadataBytes32Hash as HashOrAddress,
      } as MintAndRegisterIpParams);
    }
    
    logger.info('Story Protocol 테스트 완료');
  } catch (error) {
    logger.error('Story Protocol 테스트 실패', { error });
    console.error('테스트 중 오류가 발생했습니다:', error);
  }
}

// 테스트 실행
testStoryProtocol().catch(console.error); 