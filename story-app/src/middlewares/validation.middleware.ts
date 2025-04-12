import Joi from 'joi';

/**
 * IP 등록 요청 검증 스키마
 */
export const registerIpSchema = Joi.object({
  title: Joi.string()
    .required().message('Title is required')
    .min(1).message('Title must be at least 1 characters long')
    .max(100).message('Title cannot exceed 100 characters'),
  
  description: Joi.string()
    .required().message('Description is required')
    .min(3).message('Description must be at least 3 characters long')
    .max(1000).message('Description cannot exceed 1000 characters'),
  
  fileUrl: Joi.string()
    .required().message('File URL is required')
    .uri().message('File URL must be a valid URL'),
  
  creators: Joi.array().items(
    Joi.object({
      name: Joi.string()
        .required().message('Creator name is required')
        .min(1).message('Creator name cannot be empty')
        .max(100).message('Creator name cannot exceed 100 characters'),
      
      address: Joi.string()
        .required().message('Creator address is required')
        .pattern(/^(0x)?[0-9a-fA-F]{40}$/).message('Invalid Ethereum address format'),
      
      contributionPercent: Joi.number()
        .required().message('Contribution percentage is required')
        .min(1).message('Contribution percentage must be at least 1')
        .max(100).message('Contribution percentage cannot exceed 100'),
      
      socialMedia: Joi.array().items(
        Joi.object({
          platform: Joi.string().required().message('Social media platform is required'),
          url: Joi.string()
            .required().message('Social media URL is required')
            .uri().message('Social media URL must be a valid URL')
        })
      ).optional()
    })
  )
  .required().message('Creators information is required')
  .min(1).message('At least one creator is required'),
  
  licenseTerms: Joi.object({
    commercialUse: Joi.boolean().required().message('Commercial use flag is required'),
    mintFee: Joi.object({
      amount: Joi.string().required().message('Mint fee amount is required'),
      token: Joi.string().required().message('Mint fee token is required')
    }).optional(),
    royaltyPercentage: Joi.number()
      .min(0).message('Royalty percentage cannot be negative')
      .max(100).message('Royalty percentage cannot exceed 100')
      .optional()
  }).optional()
});

/**
 * 기존 NFT IP 등록 요청 검증 스키마
 */
export const registerExistingNftSchema = Joi.object({
  nftContract: Joi.string()
    .required().message('NFT contract address is required')
    .pattern(/^(0x)?[0-9a-fA-F]{40}$/).message('Invalid NFT contract address format'),
  
  tokenId: Joi.string().required().message('Token ID is required'),
  
  ipMetadataURI: Joi.string()
    .required().message('IP metadata URI is required')
    .uri().message('IP metadata URI must be a valid URI'),
  
  ipMetadataHash: Joi.string()
    .required().message('IP metadata hash is required')
    .pattern(/^(0x)?[0-9a-fA-F]{64}$/).message('Invalid IP metadata hash format'),
  
  nftMetadataURI: Joi.string()
    .required().message('NFT metadata URI is required')
    .uri().message('NFT metadata URI must be a valid URI'),
  
  nftMetadataHash: Joi.string()
    .required().message('NFT metadata hash is required')
    .pattern(/^(0x)?[0-9a-fA-F]{64}$/).message('Invalid NFT metadata hash format')
});