import {
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class PinataApi implements ICredentialType {
  name = 'pinataApi';
  displayName = 'Pinata API';
  documentationUrl = 'https://docs.pinata.cloud/reference/authentication';
  properties: INodeProperties[] = [
    {
      displayName: 'JWT',
      name: 'jwt',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'Pinata JWT token (Generate from Pinata dashboard > API Keys > + New Key > Enable JWT)',
    },
  ];
} 