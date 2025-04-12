import dotenv from 'dotenv';
import { IPFSService } from '../services/ipfs.service';
import { Logger } from '../services/logger.service';

// Load environment variables
dotenv.config();

/**
 * IPFS Upload Test
 */
async function testIpfsUpload() {
  // Initialize logger
  const logger = new Logger();
  logger.info('Starting IPFS upload test');

  try {
    // Initialize IPFS service using singleton pattern
    const ipfsService = IPFSService.getInstance(logger);
    logger.info('IPFS service initialized');

    // Test image upload
    const imageUrl = 'https://picsum.photos/200';
    logger.info('Uploading test image to IPFS', { imageUrl });

    const imageUploadResult = await ipfsService.uploadContent(imageUrl);
    logger.info('Image upload completed', { result: imageUploadResult });

    console.log('\n===== Image Upload Result =====');
    console.log('CID:', imageUploadResult.ipfsCid);
    console.log('URL:', `https://ipfs.io/ipfs/${imageUploadResult.ipfsCid}`);
    console.log('================================\n');

    // Test metadata upload
    const metadata = {
      name: 'Test Asset',
      description: 'This is a test asset for IPFS upload.',
      image: `ipfs://${imageUploadResult.ipfsCid}`,
      attributes: [
        {
          trait_type: 'Test',
          value: 'Value'
        }
      ]
    };

    logger.info('Uploading metadata to IPFS', { metadata });

    const metadataUploadResult = await ipfsService.uploadJSON(metadata);
    logger.info('Metadata upload completed', { result: metadataUploadResult });

    console.log('\n===== Metadata Upload Result =====');
    console.log('CID:', metadataUploadResult.ipfsCid);
    console.log('URL:', `https://ipfs.io/ipfs/${metadataUploadResult.ipfsCid}`);
    console.log('==================================\n');

    logger.info('IPFS upload test completed');
  } catch (error) {
    logger.error('IPFS upload test failed', { error });
    console.error('An error occurred during testing:', error);
  }
}

// Run test
testIpfsUpload().catch(console.error);