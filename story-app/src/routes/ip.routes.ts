import { Router } from 'express';
import { IpController } from '../controllers/ip.controller';
import { validateRequest } from '../middlewares/error.middleware';
import { registerIpSchema, registerExistingNftSchema, ipIdSchema } from '../middlewares/validation.middleware';

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
 *             type: object
 *             required: [nftContractAddress, tokenId]
 *             properties:
 *               nftContractAddress:
 *                 type: string
 *                 description: Address of the NFT contract
 *               tokenId:
 *                 type: string
 *                 description: ID of the NFT token
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

/**
 * @swagger
 * /api/v1/ip/{ipId}:
 *   get:
 *     summary: Get IP asset details
 *     description: Retrieve detailed information about an IP asset
 *     tags: [IP]
 *     parameters:
 *       - in: path
 *         name: ipId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the IP asset
 *     responses:
 *       200:
 *         description: IP asset details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoryDetailResponse'
 *       404:
 *         description: IP asset not found
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
router.get('/:ipId', validateRequest(ipIdSchema), ipController.getStoryDetail);

export { router as ipRouter };