import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';
import { Express } from 'express';
import path from 'path';

// 기본 Swagger 옵션 정의
const getSwaggerOptions = (serverUrl: string): swaggerJsdoc.Options => ({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Story Protocol IP Registration API',
      version: '1.0.0',
      description: 'API for registering and managing IP assets using Story Protocol',
    },
    servers: [
      {
        url: serverUrl,
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        RegisterIPRequest: {
          type: 'object',
          required: ['title', 'description', 'fileUrl', 'creators'],
          properties: {
            title: {
              type: 'string',
              description: 'Title of the IP asset',
              minLength: 1,
              maxLength: 100,
            },
            description: {
              type: 'string',
              description: 'Description of the IP asset',
              minLength: 3,
              maxLength: 1000,
            },
            fileUrl: {
              type: 'string',
              description: 'URL of the IP asset content',
              format: 'uri',
            },
            creators: {
              type: 'array',
              description: 'List of creators of the IP asset',
              minItems: 1,
              items: {
                type: 'object',
                required: ['name', 'address', 'contributionPercent'],
                properties: {
                  name: {
                    type: 'string',
                    description: 'Name of the creator',
                    minLength: 1,
                    maxLength: 100,
                  },
                  address: {
                    type: 'string',
                    description: 'Ethereum address of the creator',
                    pattern: '^(0x)?[0-9a-fA-F]{40}$',
                  },
                  contributionPercent: {
                    type: 'number',
                    description: 'Contribution percentage of the creator',
                    minimum: 1,
                    maximum: 100,
                  },
                  socialMedia: {
                    type: 'array',
                    description: 'Social media links of the creator',
                    items: {
                      type: 'object',
                      required: ['platform', 'url'],
                      properties: {
                        platform: {
                          type: 'string',
                          description: 'Social media platform name',
                        },
                        url: {
                          type: 'string',
                          description: 'Social media URL',
                          format: 'uri',
                        },
                      },
                    },
                  },
                },
              },
            },
            licenseTerms: {
              type: 'object',
              description: 'License terms for the IP asset',
              properties: {
                commercialUse: {
                  type: 'boolean',
                  description: 'Whether commercial use is allowed',
                },
                mintFee: {
                  type: 'object',
                  description: 'Fee for minting the IP asset',
                  properties: {
                    amount: {
                      type: 'string',
                      description: 'Amount of the mint fee',
                    },
                    token: {
                      type: 'string',
                      description: 'Token for the mint fee',
                    },
                  },
                  required: ['amount', 'token'],
                },
                royaltyPercentage: {
                  type: 'number',
                  description: 'Royalty percentage for the IP asset',
                  minimum: 0,
                  maximum: 100,
                },
              },
              required: ['commercialUse'],
            },
          },
        },
        RegisterExistingNftRequest: {
          type: 'object',
          required: ['nftContract', 'tokenId', 'ipMetadataURI', 'ipMetadataHash', 'nftMetadataURI', 'nftMetadataHash'],
          properties: {
            nftContract: {
              type: 'string',
              description: 'Address of the NFT contract',
              pattern: '^(0x)?[0-9a-fA-F]{40}$',
            },
            tokenId: {
              type: 'string',
              description: 'ID of the NFT token',
            },
            ipMetadataURI: {
              type: 'string',
              description: 'URI of the IP metadata',
              format: 'uri',
            },
            ipMetadataHash: {
              type: 'string',
              description: 'Hash of the IP metadata',
              pattern: '^(0x)?[0-9a-fA-F]{64}$',
            },
            nftMetadataURI: {
              type: 'string',
              description: 'URI of the NFT metadata',
              format: 'uri',
            },
            nftMetadataHash: {
              type: 'string',
              description: 'Hash of the NFT metadata',
              pattern: '^(0x)?[0-9a-fA-F]{64}$',
            },
          },
        },
        RegisterIPResponse: {
          type: 'object',
          properties: {
            ipId: {
              type: 'string',
              description: 'Unique identifier of the registered IP asset',
            },
            metadataUrl: {
              type: 'string',
              description: 'URL of the IP asset metadata on IPFS',
            },
            transactionHash: {
              type: 'string',
              description: 'Transaction hash of the IP registration',
            },
          },
        },
        StoryDetailResponse: {
          type: 'object',
          properties: {
            ipId: {
              type: 'string',
              description: 'Unique identifier of the IP asset',
            },
            title: {
              type: 'string',
              description: 'Title of the IP asset',
            },
            description: {
              type: 'string',
              description: 'Description of the IP asset',
            },
            contentUrl: {
              type: 'string',
              description: 'URL of the IP asset content',
            },
            metadataUrl: {
              type: 'string',
              description: 'URL of the IP asset metadata on IPFS',
            },
            owner: {
              type: 'string',
              description: 'Address of the IP asset owner',
            },
          },
        },
        StoryProtocolError: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: 'Error code',
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, '../routes/*.ts')], // Path to the API routes
});

const swaggerUiOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Story Protocol API Documentation',
};

export const setupSwagger = (app: Express): void => {
  // 실행 중인 서버의 PORT 정보 가져오기
  const port = process.env.PORT || 3000;
  const serverUrl = `http://localhost:${port}`;
  
  // 현재 서버 URL로 Swagger 옵션 생성
  const options = getSwaggerOptions(serverUrl);
  const specs = swaggerJsdoc(options);
  
  // Swagger UI 설정
  app.use('/api-docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs, swaggerUiOptions));
}; 