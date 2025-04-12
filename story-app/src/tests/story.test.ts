import dotenv from 'dotenv';
import { StoryService } from '../services/story.service';
import { Logger } from '../services/logger.service';
import { IPFSService } from '../services/ipfs.service';
import { createHash } from 'crypto';
import { type Address, isAddress } from 'viem';
import { Validator } from '../utils/validator';
import { HashOrAddress, MintAndRegisterIpParams } from '../types/story.types';

// Load environment variables
dotenv.config();

/**
 * Convert and validate to Ethereum address format
 * @param address Address string
 * @returns Ethereum address starting with 0x
 */
function formatAddress(address: string): Address {
  const formattedAddress = address.startsWith('0x') ? address : `0x${address}`;
  
  if (!Validator.isValidEthereumAddress(formattedAddress)) {
    throw new Error(`Invalid Ethereum address: ${formattedAddress}`);
  }
  
  return formattedAddress as Address;
}

/**
 * Story Protocol Service Test
 */
async function testStoryProtocol() {
  // Initialize logger
  const logger = new Logger();
  logger.info('Starting Story Protocol service test');

  try {
    // 1. Initialize IPFS service (using singleton instance)
    const ipfsService = IPFSService.getInstance(logger);
    logger.info('IPFS service initialization completed');

    // 2. Initialize Story service (automatically using singleton IPFSService)
    const storyService = new StoryService(logger);
    logger.info('Story service initialization completed');

    // 3. Upload sample image to IPFS
    const testImageUrl = 'https://picsum.photos/200';
    const contentResult = await ipfsService.uploadContent(testImageUrl);
    logger.info('Image upload result', contentResult);

    // Validate address
    const creatorAddress = formatAddress('0xCaa2da8aF50327B31FC5Ee19472E883D830B9c4B');
    logger.info('Creator address validation completed', { address: creatorAddress });
    
    // Store content hash (not used as Ethereum address)
    const imageContentHash = contentResult.contentHash || '';
    
    // Virtual address (used only in testing) - reusing creator address here
    const dummyAddress = creatorAddress;

    // 4. Generate IP metadata
    const ipMetadata = storyService.generateIpMetadata({
      title: 'Story Protocol Test Image',
      description: 'This is an image for testing Story Protocol SDK.',
      image: `https://ipfs.io/ipfs/${contentResult.ipfsCid}`,
      imageHash: dummyAddress.toString(), // Using virtual address
      mediaUrl: `https://ipfs.io/ipfs/${contentResult.ipfsCid}`,
      mediaHash: dummyAddress.toString(), // Using virtual address
      mediaType: contentResult.contentType || 'image/jpeg',
      creators: [
        {
          name: 'Test User',
          address: creatorAddress.toString(),
          contributionPercent: 100,
        },
      ],
    });
    logger.info('IP metadata generation completed', { metadata: ipMetadata });

    // 5. Generate NFT metadata
    const nftMetadata = {
      name: 'Story Protocol Test NFT',
      description: 'This is an NFT for testing Story Protocol SDK.',
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
    logger.info('NFT metadata generation completed');

    // 6. Upload metadata to IPFS
    const ipIpfsResult = await ipfsService.uploadJSON(ipMetadata);
    const ipHash = ipIpfsResult.hash || '0x' + createHash('sha256').update(JSON.stringify(ipMetadata)).digest('hex');
    
    const nftIpfsResult = await ipfsService.uploadJSON(nftMetadata);
    const nftHash = nftIpfsResult.hash || '0x' + createHash('sha256').update(JSON.stringify(nftMetadata)).digest('hex');
    
    logger.info('Metadata upload completed', {
      ipIpfsCid: ipIpfsResult.ipfsCid,
      nftIpfsCid: nftIpfsResult.ipfsCid
    });

    // 7. Print registration info and execute actual registration
    console.log('\n===== Story Protocol Registration Info =====');
    console.log(`IP Metadata IPFS CID: ${ipIpfsResult.ipfsCid}`);
    console.log(`IP Metadata URL: https://ipfs.io/ipfs/${ipIpfsResult.ipfsCid}`);
    console.log(`NFT Metadata IPFS CID: ${nftIpfsResult.ipfsCid}`);
    console.log(`NFT Metadata URL: https://ipfs.io/ipfs/${nftIpfsResult.ipfsCid}`);
    
    // Execute actual registration
    if (process.env.WALLET_PRIVATE_KEY) {
      logger.info('Starting IP registration with Story Protocol');
      
      // Generate bytes32 hash - Using Validator
      const ipMetadataBytes32Hash = Validator.generateBytes32Hash(JSON.stringify(ipMetadata));
      const nftMetadataBytes32Hash = Validator.generateBytes32Hash(JSON.stringify(nftMetadata));
      
      // Validate hash format
      if (!Validator.isValidBytes32Hash(ipMetadataBytes32Hash) || !Validator.isValidBytes32Hash(nftMetadataBytes32Hash)) {
        throw new Error('Invalid hash format. 32-byte hash required.');
      }
      
      // Using type assertion for type compatibility
      const registerParams = {
        ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsResult.ipfsCid}`,
        ipMetadataHash: ipMetadataBytes32Hash as HashOrAddress,
        nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsResult.ipfsCid}`,
        nftMetadataHash: nftMetadataBytes32Hash as HashOrAddress,
      } as MintAndRegisterIpParams;
      
      console.log('\nRegistration parameters:', registerParams);
      
      const registerResult = await storyService.mintAndRegisterIp(registerParams);
      logger.info('IP registration result', registerResult);
      
      console.log('\n===== Registration Result =====');
      console.log(`IP ID: ${registerResult.ipId}`);
      console.log(`Transaction Hash: ${registerResult.txHash}`);
      console.log(`StoryScan URL: ${registerResult.viewUrl || `https://aeneid.storyscan.io/tx/${registerResult.txHash}`}`);
      console.log('=====================\n');
    } else {
      console.log('\nSet WALLET_PRIVATE_KEY environment variable to perform actual registration.');
      
      // Generate bytes32 hash - Using Validator
      const ipMetadataBytes32Hash = Validator.generateBytes32Hash(JSON.stringify(ipMetadata));
      const nftMetadataBytes32Hash = Validator.generateBytes32Hash(JSON.stringify(nftMetadata));
      
      console.log('Required parameters for registration:', {
        ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsResult.ipfsCid}`,
        ipMetadataHash: ipMetadataBytes32Hash as HashOrAddress,
        nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsResult.ipfsCid}`,
        nftMetadataHash: nftMetadataBytes32Hash as HashOrAddress,
      } as MintAndRegisterIpParams);
    }
    
    logger.info('Story Protocol test completed');
  } catch (error) {
    logger.error('Story Protocol test failed', { error });
    console.error('An error occurred during testing:', error);
  }
}

// Run test
testStoryProtocol().catch(console.error); 