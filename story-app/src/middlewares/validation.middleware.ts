import Joi from 'joi';

/**
 * IP 등록 요청 검증 스키마
 */
export const registerIpSchema = Joi.object({
  title: Joi.string()
    .required()
    .min(1)
    .max(100)
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 1 characters long',
      'string.max': 'Title cannot exceed 100 characters',
      'any.required': 'Title is required'
    }),
  
  description: Joi.string()
    .required()
    .min(3)
    .max(1000)
    .messages({
      'string.empty': 'Description is required',
      'string.min': 'Description must be at least 3 characters long',
      'string.max': 'Description cannot exceed 1000 characters',
      'any.required': 'Description is required'
    }),
  
  fileUrl: Joi.string()
    .required()
    .uri()
    .messages({
      'string.empty': 'File URL is required',
      'string.uri': 'File URL must be a valid URL',
      'any.required': 'File URL is required'
    }),
  
  creators: Joi.array().items(
    Joi.object({
      name: Joi.string()
        .required()
        .min(1)
        .max(100)
        .messages({
          'string.empty': 'Creator name cannot be empty',
          'string.min': 'Creator name cannot be empty',
          'string.max': 'Creator name cannot exceed 100 characters',
          'any.required': 'Creator name is required'
        }),
      
      address: Joi.string()
        .required()
        .pattern(/^(0x)?[0-9a-fA-F]{40}$/)
        .messages({
          'string.pattern.base': 'Invalid Ethereum address format',
          'any.required': 'Creator address is required'
        }),
      
      contributionPercent: Joi.number()
        .required()
        .min(1)
        .max(100)
        .messages({
          'number.min': 'Contribution percentage must be at least 1',
          'number.max': 'Contribution percentage cannot exceed 100',
          'any.required': 'Contribution percentage is required'
        }),
      
      socialMedia: Joi.array().items(
        Joi.object({
          platform: Joi.string().required().messages({
            'any.required': 'Social media platform is required'
          }),
          url: Joi.string()
            .required()
            .uri()
            .messages({
              'string.uri': 'Social media URL must be a valid URL',
              'any.required': 'Social media URL is required'
            })
        })
      ).optional()
    })
  )
  .required()
  .min(1)
  .messages({
    'array.min': 'At least one creator is required',
    'any.required': 'Creators information is required'
  }),
  
  licenseTerms: Joi.object({
    commercialUse: Joi.boolean().required().messages({
      'any.required': 'Commercial use flag is required'
    }),
    mintFee: Joi.object({
      amount: Joi.string().required().messages({
        'any.required': 'Mint fee amount is required'
      }),
      token: Joi.string().required().messages({
        'any.required': 'Mint fee token is required'
      })
    }).optional(),
    royaltyPercentage: Joi.number()
      .min(0)
      .max(100)
      .messages({
        'number.min': 'Royalty percentage cannot be negative',
        'number.max': 'Royalty percentage cannot exceed 100'
      })
      .optional()
  }).optional()
});

/**
 * 기존 NFT IP 등록 요청 검증 스키마
 */
export const registerExistingNftSchema = Joi.object({
  nftContract: Joi.string()
    .required()
    .pattern(/^(0x)?[0-9a-fA-F]{40}$/)
    .messages({
      'string.pattern.base': 'Invalid NFT contract address format',
      'any.required': 'NFT contract address is required'
    }),
  
  tokenId: Joi.string().required().messages({
    'any.required': 'Token ID is required'
  }),
  
  ipMetadataURI: Joi.string()
    .required()
    .uri()
    .messages({
      'string.uri': 'IP metadata URI must be a valid URI',
      'any.required': 'IP metadata URI is required'
    }),
  
  ipMetadataHash: Joi.string()
    .required()
    .pattern(/^(0x)?[0-9a-fA-F]{64}$/)
    .messages({
      'string.pattern.base': 'Invalid IP metadata hash format',
      'any.required': 'IP metadata hash is required'
    }),
  
  nftMetadataURI: Joi.string()
    .required()
    .uri()
    .messages({
      'string.uri': 'NFT metadata URI must be a valid URI',
      'any.required': 'NFT metadata URI is required'
    }),
  
  nftMetadataHash: Joi.string()
    .required()
    .pattern(/^(0x)?[0-9a-fA-F]{64}$/)
    .messages({
      'string.pattern.base': 'Invalid NFT metadata hash format',
      'any.required': 'NFT metadata hash is required'
    })
});

/**
 * IP ID 검증 스키마
 */
export const ipIdSchema = Joi.object({
  ipId: Joi.string()
    .required()
    .pattern(/^IP-0x[0-9a-fA-F]+$/)
    .messages({
      'string.pattern.base': 'Invalid IP ID format. Must start with IP-0x followed by hexadecimal characters',
      'any.required': 'IP ID is required'
    })
});