import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';
import axios from 'axios';
import FormData from 'form-data';

export class PinataUploader implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Pinata IPFS Uploader',
    name: 'pinataUploader',
    icon: 'file:pinata.svg',
    group: ['output'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Upload files to IPFS via Pinata',
    defaults: {
      name: 'Pinata IPFS Uploader',
      color: '#FFCC00',
    },
    inputs: '={{["main"]}}',
    outputs: '={{["main"]}}',
    credentials: [
      {
        name: 'pinataApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        options: [
          {
            name: 'Upload File',
            value: 'uploadFile',
            description: 'Upload a file to IPFS',
            action: 'Upload a file to IPFS',
          },
        ],
        default: 'uploadFile',
      },
      {
        displayName: 'Input Type',
        name: 'inputType',
        type: 'options',
        options: [
          {
            name: 'Binary File',
            value: 'binaryFile',
            description: 'Use binary data from workflow',
          },
          {
            name: 'File URL',
            value: 'fileUrl',
            description: 'Fetch file from URL',
          },
        ],
        default: 'binaryFile',
        displayOptions: {
          show: {
            operation: ['uploadFile'],
          },
        },
        description: 'How to input the file to upload',
      },
      {
        displayName: 'Binary Property',
        name: 'binaryPropertyName',
        type: 'string',
        default: 'data',
        required: true,
        displayOptions: {
          show: {
            operation: ['uploadFile'],
            inputType: ['binaryFile'],
          },
        },
        description: 'Name of the binary property containing the file data',
      },
      {
        displayName: 'File URL',
        name: 'fileUrl',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['uploadFile'],
            inputType: ['fileUrl'],
          },
        },
        description: 'URL of the file to upload',
      },
      {
        displayName: 'Custom File Name',
        name: 'fileName',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
          show: {
            operation: ['uploadFile'],
          },
        },
        description: 'Custom file name (leave empty to use original filename)',
      },
      {
        displayName: 'Pin Metadata',
        name: 'metadata',
        type: 'fixedCollection',
        default: {},
        placeholder: 'Add Metadata Field',
        typeOptions: {
          multipleValues: true,
        },
        displayOptions: {
          show: {
            operation: ['uploadFile'],
          },
        },
        options: [
          {
            name: 'metadataValues',
            displayName: 'Metadata',
            values: [
              {
                displayName: 'Key',
                name: 'key',
                type: 'string',
                default: '',
                description: 'Name of the metadata field',
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
                description: 'Value of the metadata field',
              },
            ],
          },
        ],
        description: 'Metadata for the uploaded file',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    // Get credentials
    const credentials = await this.getCredentials('pinataApi');
    const jwt = credentials.jwt as string;

    // Check for valid credentials
    if (!jwt) {
      throw new NodeOperationError(this.getNode(), 'No valid JWT token provided');
    }

    const apiBase = 'https://api.pinata.cloud';

    for (let i = 0; i < items.length; i++) {
      try {
        const operation = this.getNodeParameter('operation', i) as string;

        if (operation === 'uploadFile') {
          const inputType = this.getNodeParameter('inputType', i) as string;
          const customFileName = this.getNodeParameter('fileName', i, '') as string;
          const metadataValues = this.getNodeParameter('metadata.metadataValues', i, []) as Array<{
            key: string;
            value: string;
          }>;

          // Prepare metadata object
          const pinataMetadata: Record<string, string> = {
            name: customFileName || 'file', // Default name if not provided
          };

          // Add any custom metadata
          if (metadataValues && metadataValues.length) {
            for (const meta of metadataValues) {
              if (meta.key) {
                pinataMetadata[meta.key] = meta.value;
              }
            }
          }

          let fileBuffer: Buffer;
          let fileName: string = customFileName;

          // Get file data based on input type
          if (inputType === 'binaryFile') {
            const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;

            // Type assertion to ensure binary property exists
            const binary = items[i].binary as Record<string, { data: string; fileName?: string }>;
            
            if (!binary || !binary[binaryPropertyName]) {
              throw new NodeOperationError(this.getNode(), `No binary data found for property "${binaryPropertyName}"`, { itemIndex: i });
            }

            const binaryData = binary[binaryPropertyName];
            fileBuffer = Buffer.from(binaryData.data, 'base64');
            
            // Use original filename if custom name not provided
            if (!fileName) {
              fileName = binaryData.fileName || 'file';
            }
          } else if (inputType === 'fileUrl') {
            const fileUrl = this.getNodeParameter('fileUrl', i) as string;
            
            if (!fileUrl) {
              throw new NodeOperationError(this.getNode(), 'No file URL provided', { itemIndex: i });
            }

            try {
              const response = await axios.get(fileUrl, {
                responseType: 'arraybuffer',
              });
              
              fileBuffer = Buffer.from(response.data);
              
              // Use the URL's filename if custom name not provided
              if (!fileName) {
                const urlParts = fileUrl.split('/');
                fileName = urlParts[urlParts.length - 1].split('?')[0] || 'file';
              }
            } catch (error) {
              throw new NodeOperationError(
                this.getNode(),
                `Failed to download file from URL: ${(error as Error).message}`,
                { itemIndex: i },
              );
            }
          } else {
            throw new NodeOperationError(this.getNode(), `Unsupported input type: ${inputType}`, { itemIndex: i });
          }

          // Set filename in metadata if not empty
          if (fileName) {
            pinataMetadata.name = fileName;
          }

          // Create FormData for uploading
          const formData = new FormData();
          formData.append('file', fileBuffer, { filename: fileName || 'file' });
          formData.append('pinataMetadata', JSON.stringify({ name: pinataMetadata.name, keyvalues: pinataMetadata }));

          // Upload file to Pinata
          const uploadResponse = await axios.post(`${apiBase}/pinning/pinFileToIPFS`, formData, {
            headers: {
              'Content-Type': `multipart/form-data; boundary=${(formData as any).getBoundary()}`,
              'Authorization': `Bearer ${jwt}`,
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
          });

          if (uploadResponse.status === 200 && uploadResponse.data) {
            // Format successful response
            const ipfsHash = uploadResponse.data.IpfsHash;
            const gatewayURL = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
            const ipfsURL = `ipfs://${ipfsHash}`;

            returnData.push({
              json: {
                success: true,
                hash: ipfsHash,
                gatewayUrl: gatewayURL,
                ipfsUrl: ipfsURL,
                fileName: fileName,
                size: uploadResponse.data.PinSize || 0,
                timestamp: uploadResponse.data.Timestamp || new Date().toISOString(),
                metadata: pinataMetadata,
                originalItem: items[i].json,
              },
            });
          } else {
            throw new NodeOperationError(
              this.getNode(),
              `Failed to upload file to Pinata: ${uploadResponse.statusText}`,
              { itemIndex: i },
            );
          }
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              success: false,
              error: (error as Error).message || 'Unknown error',
            },
          });
          continue;
        }
        throw new NodeOperationError(
          this.getNode(),
          (error as Error).message || 'Unknown error',
          { itemIndex: i },
        );
      }
    }

    return [returnData];
  }
} 