import dotenv from 'dotenv';
import { IpController } from '../controllers/ip.controller';
import { Logger } from '../services/logger.service';
import { IPFSService } from '../services/ipfs.service';
import { RegisterIPRequest } from '../types/ip.types';

// Load environment variables
dotenv.config();

/**
 * IP Registration Test
 */
async function testIpRegistration() {
  // Initialize logger
  const logger = new Logger();
  logger.info('Starting IP registration test');

  try {
    // Initialize IP controller
    const ipController = new IpController();
    logger.info('IP controller initialized');

    // Create test request data
    const requestData: RegisterIPRequest = {
      title: 'Test IP Asset',
      description: 'This is a test asset for IP registration.',
      fileUrl: 'https://picsum.photos/200',
      creators: [
        {
          name: 'Test User',
          address: '0xCaa2da8aF50327B31FC5Ee19472E883D830B9c4B',
          contributionPercent: 100
        }
      ],
      licenseTerms: {
        commercialUse: true,
        royaltyPercentage: 5
      }
    };

    logger.info('Test request data created', { requestData });

    // Perform actual registration (if WALLET_PRIVATE_KEY environment variable is set)
    if (process.env.WALLET_PRIVATE_KEY) {
      logger.info('Starting actual IP registration test');
      
      // Mock Express request/response objects
      const mockReq = {
        body: requestData,
        path: '/api/v1/ip/register',
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        }
      };
      
      const mockRes = {
        status: (statusCode: number) => {
          logger.info(`Response status code: ${statusCode}`);
          return {
            json: (data: any) => {
              logger.info('Response data:', data);
              console.log('\n===== IP Registration Response Data =====');
              console.log(JSON.stringify(data, null, 2));
              console.log('=======================================\n');
            }
          };
        }
      };
      
      const mockNext = (error?: any) => {
        if (error) {
          logger.error('Error occurred:', error);
          console.error('\n===== Error Occurred =====');
          console.error(error);
          console.error('=========================\n');
        }
      };
      
      // Call IP registration controller
      await ipController.register(
        mockReq as any, 
        mockRes as any, 
        mockNext as any
      );
      
      logger.info('IP registration test completed');
    } else {
      // If environment variable is not set - perform simulation only
      logger.warn('WALLET_PRIVATE_KEY not set, performing simulation only.');
      
      console.log('\n===== IP Registration Simulation =====');
      console.log('1. Download content from file URL');
      console.log('2. Upload content to IPFS');
      console.log('3. Create IP metadata');
      console.log('4. Create NFT metadata');
      console.log('5. Upload metadata to IPFS');
      console.log('6. Register IP with Story Protocol');
      console.log('7. Generate response');
      console.log('====================================\n');
      
      logger.info('IP registration simulation completed');
    }
    
    // Existing NFT IP registration test
    console.log('\n===== Existing NFT IP Registration =====');
    console.log('To register an existing NFT as IP, the following parameters are required:');
    console.log('- NFT contract address');
    console.log('- Token ID');
    console.log('- IP metadata URI');
    console.log('- IP metadata hash');
    console.log('- NFT metadata URI');
    console.log('- NFT metadata hash');
    console.log('======================================\n');
    
    logger.info('IP test completed');
  } catch (error) {
    logger.error('IP test failed', { error });
    console.error('An error occurred during testing:', error);
  }
}

// Run test
testIpRegistration().catch(console.error); 