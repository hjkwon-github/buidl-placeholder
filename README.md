# Story Protocol IP Registration Server & n8n Upstage Node

This repository contains:

1. **Story Protocol IP Registration Server** – A Node.js-based backend server for registering IP assets to the Story Protocol blockchain and managing metadata via IPFS.
2. **n8n-nodes-upstage** – A custom node for integrating [Upstage](https://upstage.ai/) document parsing capabilities into your [n8n](https://n8n.io/) workflows.

---

## 📘 Project 1: Story Protocol IP Registration Server

A server to register stories (IP assets) and manage them on the blockchain through Story Protocol's SDK.

### 🚀 Overview

This server provides APIs for:
- Registering IP assets on Story Protocol blockchain
- Retrieving details about registered IP assets
- Handling metadata through IPFS (Pinata)

### 🛠️ Technologies Used

- Node.js & Express
- TypeScript
- [@story-protocol/core-sdk](https://www.npmjs.com/package/@story-protocol/core-sdk)
- IPFS/Pinata for metadata storage
- Swagger for API documentation

### 📦 Installation

```bash
git clone <repository-url>
cd story-server
npm install
```

### ⚙️ Environment Setup

Create a `.env` file in the root directory with the following variables (see `.env.example`):

```
WALLET_PRIVATE_KEY=your_wallet_private_key
PINATA_JWT=your_pinata_jwt_token
RPC_PROVIDER_URL=https://aeneid.storyrpc.io
SPG_NFT_CONTRACT_ADDRESS=0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc
PORT=3000
BLOCK_EXPLORER_URL=https://aeneid.storyscan.io/tx/
```

### 🔧 Running the Server

**Development mode:**

```bash
npm run dev
```

**Production mode:**

```bash
npm run build
npm start
```

### 📑 API Documentation

Visit:

```
http://localhost:3000/api-docs
```

### 📡 API Endpoints

- `POST /api/v1/ip/register`: Registers an IP asset.
- `GET /api/v1/ip/:ipId`: Retrieves IP asset details.

### 🧪 Testing

```bash
npm run test:ipfs         # Test IPFS upload
npm run test:ip           # Test IP registration
npm run test:story-detail # Test detail retrieval
```

### 📁 Project Structure

```
story-server/
├── src/
│   ├── config/         # Configuration files (Swagger, etc.)
│   ├── controllers/    # API controllers
│   ├── middlewares/    # Express middlewares
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── tests/          # Test files
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── index.ts        # Application entry point
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

### ✅ Features

- IP asset registration on Story Protocol blockchain
- IPFS metadata storage via Pinata
- Block explorer integration for transactions
- Swagger-based API docs
- NFT contract address support

---

## ⚙️ Project 2: n8n-nodes-upstage

This is a custom [n8n](https://n8n.io/) community node that allows you to use [Upstage](https://upstage.ai/)'s AI-powered document parsing within your workflows.

### 📦 Installation

Follow the [official guide](https://docs.n8n.io/integrations/community-nodes/installation/):

```bash
npm install n8n-nodes-upstage
```

### 📚 Supported Operations

- **Document Parsing**: Upload documents and extract structured data using Upstage's AI API.

### 🔐 Credentials

1. Sign up at [Upstage](https://upstage.ai/)
2. Generate an API token
3. In n8n:
   - Create a new credential of type **Upstage API**
   - Enter your API token and domain

### ✅ Compatibility

- n8n `v1.0.0+`
- Node.js `v18.10+`

### 🚀 Usage

1. Add the **Upstage Document Parsing** node to your n8n workflow
2. Configure it with your Upstage API credentials
3. Upload a document or provide its path
4. Execute the workflow to get parsed data

### 💻 Development

If you wish to contribute or test locally:

```bash
git clone https://github.com/hjkwon-github/upstage.git
cd upstage
pnpm install
pnpm build
pnpm link
```

Then link it to your n8n instance.

---

## 📚 Resources

- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Upstage API Docs](https://docs.upstage.ai/)
- [Story Protocol SDK on npm](https://www.npmjs.com/package/@story-protocol/core-sdk)

---

## 🪪 License

- Story Protocol Server: **ISC**
- n8n Upstage Node: **MIT**
