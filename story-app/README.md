# Story Protocol IP Registration API

This repository contains a backend API server built with Express.js and TypeScript for registering intellectual property (IP) assets using Story Protocol's SDK.

## Features

- Register IP assets with files (images, videos, etc.)
- Generate NFTs for IP assets
- Upload content to IPFS using Pinata
- Register existing NFTs as IP assets
- Swagger documentation

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Pinata account (for IPFS storage)
- A wallet with Story Protocol testnet tokens

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/yourusername/story-hack.git
cd story-hack/story-app
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

1. Create a `.env` file by copying the example file:

```bash
cp .env.example .env
```

2. Edit the `.env` file and fill in the required values:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# Story Protocol Configuration
RPC_PROVIDER_URL=https://aeneid.storyrpc.io
SPG_NFT_CONTRACT_ADDRESS=0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc
WALLET_PRIVATE_KEY=your_wallet_private_key_here
BLOCK_EXPLORER_URL=https://aeneid.storyscan.io/tx/

# Pinata Configuration
PINATA_API_KEY=your_pinata_api_key_here
PINATA_API_SECRET=your_pinata_secret_key_here
PINATA_JWT=your_pinata_jwt_token_here
```

> **Important**: You need to get Story Protocol testnet tokens from [https://cloud.google.com/application/web3/faucet/story/aeneid](https://cloud.google.com/application/web3/faucet/story/aeneid)

### Build the Project

```bash
npm run build
```

### Run the Server

#### Development Mode

This will start the server with hot reloading:

```bash
npm run dev
```

#### Production Mode

```bash
npm start
```

The server will start on the port defined in your `.env` file (default: 3000).

You should see output similar to:
```
info: Server is running at http://localhost:3000
info: Swagger documentation available at http://localhost:3000/api-docs
```

## API Documentation

Once the server is running, you can access the Swagger documentation at:

```
http://localhost:3000/api-docs
```

This provides a UI to interact with all available API endpoints.

## Available Endpoints

- `POST /api/v1/ip/register` - Register a new IP asset with a file
- `POST /api/v1/ip/register-existing-nft` - Register an existing NFT as an IP asset

## Testing

### Test IPFS Upload

```bash
npm run test:ipfs
```

### Test IP Registration

```bash
npm run test:ip
```

## Deployment

### Deploy to Vercel

```bash
npm run deploy
```

## Troubleshooting

### Common Issues

1. **FUNCTION_INVOCATION_FAILED (500 error)**:
   - Check if all environment variables are properly set in Vercel
   - Ensure the PINATA_JWT is valid and not expired
   - Verify wallet has enough tokens for transactions

2. **CORS errors**:
   - If deploying on Vercel, check vercel.json configuration

3. **File Upload Issues**:
   - Ensure you're using multipart/form-data for file uploads
   - The field name for the file must be 'file'

## License

This project is licensed under the ISC License.
