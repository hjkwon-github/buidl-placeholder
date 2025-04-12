import { Router } from 'express';
import { IpController } from '../controllers/ip.controller';
import { validateRequest } from '../middlewares/error.middleware';
import { registerIpSchema, registerExistingNftSchema } from '../middlewares/validation.middleware';

// IP 컨트롤러 인스턴스 생성
const ipController = new IpController();
const router = Router();

/**
 * @swagger
 * /api/v1/ip/register:
 *   post:
 *     summary: Register a new IP asset
 *     description: Register a new IP asset with Story Protocol
 *     tags: [IP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterIPRequest'
 *     responses:
 *       200:
 *         description: IP asset registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterIPResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoryProtocolError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoryProtocolError'
 */
router.post('/register', validateRequest(registerIpSchema), ipController.register);

/**
 * @swagger
 * /api/v1/ip/register-existing-nft:
 *   post:
 *     summary: Register an existing NFT as an IP asset
 *     description: Register an existing NFT as an IP asset with Story Protocol
 *     tags: [IP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterExistingNftRequest'
 *     responses:
 *       200:
 *         description: NFT registered as IP asset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterIPResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoryProtocolError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoryProtocolError'
 */
router.post('/register-existing-nft', validateRequest(registerExistingNftSchema), ipController.registerExistingNft);

export { router as ipRouter };