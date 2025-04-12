import { Router } from 'express';
import { IpController } from '../controllers/ip.controller';
import { validateRequest } from '../middlewares/error.middleware';
import { registerIpSchema, registerExistingNftSchema, ipIdSchema } from '../middlewares/validation.middleware';

// IP 컨트롤러 인스턴스 생성
const ipController = new IpController();
const router = Router();

/**
 * @route POST /api/v1/ip/register
 * @desc IP 등록 엔드포인트
 * @access Public
 */
router.post('/register', validateRequest(registerIpSchema), ipController.register);

/**
 * @route POST /api/v1/ip/register-existing-nft
 * @desc 기존 NFT를 IP로 등록하는 엔드포인트
 * @access Public
 */
router.post('/register-existing-nft', validateRequest(registerExistingNftSchema), ipController.registerExistingNft);

/**
 * @route GET /api/v1/ip/:ipId
 * @desc IP 자산 상세 정보 조회 엔드포인트
 * @access Public
 */
router.get('/:ipId', validateRequest(ipIdSchema), ipController.getStoryDetail);

export { router as ipRouter };