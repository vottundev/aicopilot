'use client';

import { useState, useEffect } from 'react';
import { VottunService } from '@/services/vottun';
import { 
  ArrowRightIcon, 
  CodeBracketIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClipboardDocumentIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

const VOTTUN_ENDPOINTS = [
  // CORE API
  {
    category: 'Core API',
    name: 'Get Balance',
    path: '/core/v1/evm/chain/{account}/balance',
    method: 'GET',
    description: 'Get wallet balance of native cryptocurrency',
    requestTemplate: { 
      network: 43113
    },
    urlParams: {
      account: '' // Parámetro que va en la URL
    },
    dynamicPath: true // Indicador de que la ruta contiene parámetros dinámicos
  },
  {
    category: 'Core API',
    name: 'Get Available Networks',
    path: '/core/v1/evm/info/chains',
    method: 'GET',
    description: 'Get list of available blockchain networks',
    requestTemplate: {}
  },
  {
    category: 'Core API',
    name: 'Query Smart Contract',
    path: '/core/v1/evm/transact/view',
    method: 'POST',
    description: 'Call a view function on a smart contract',
    requestTemplate: {
      contractAddress: '',
      blockchainNetwork: 43113, // Avalanche Fuji testnet by default
      method: '',
      params: []
    }
  },
  {
    category: 'Core API',
    name: 'Send Transaction',
    path: '/core/v1/evm/transact/mutable',
    method: 'POST',
    description: 'Call a function that changes state on a smart contract',
    requestTemplate: {
      contractAddress: '',
      sender: '',
      blockchainNetwork: 43113, // Avalanche Fuji testnet by default
      gasLimit: 250000,
      method: '',
      params: []
    }
  },
  {
    category: 'Core API',
    name: 'Deploy Smart Contract',
    path: '/core/v1/evm/contract/deploy',
    method: 'POST',
    description: 'Deploy a smart contract to the blockchain',
    requestTemplate: {
      contractSpecsId: 0,
      sender: '',
      blockchainNetwork: 43113, // Avalanche Fuji testnet by default
      gasLimit: 4000000,
      alias: '',
      params: []
    }
  },
  {
    category: 'Core API',
    name: 'Get Transaction Status',
    path: '/core/v1/evm/info/transaction/{txHash}/status',
    method: 'GET',
    description: 'Check the status of a transaction',
    requestTemplate: {
      network: 43113 // Avalanche Fuji testnet by default
    },
    urlParams: {
      txHash: ''
    }
  },
  {
    category: 'Core API',
    name: 'Get Transaction Info',
    path: '/core/v1/evm/info/transaction/{txHash}',
    method: 'GET',
    description: 'Get detailed information about a transaction',
    requestTemplate: {
      network: 43113 // Avalanche Fuji testnet by default
    },
    urlParams: {
      txHash: ''
    }
  },
  {
    category: 'Core API',
    name: 'Get Gas Price',
    path: '/core/v1/evm/network/gasprice',
    method: 'GET',
    description: 'Get current gas price for a blockchain network',
    requestTemplate: {
      network: 43113 // Avalanche Fuji testnet by default
    }
  },
  {
    category: 'Core API',
    name: 'Get Available Contract Specs',
    path: '/core/v1/evm/info/specs',
    method: 'GET',
    description: 'Get list of available contract specifications',
    requestTemplate: {}
  },
  {
    category: 'Core API',
    name: 'Check If Address Is Contract',
    path: '/core/v1/evm/info/address/{address}/iscontract',
    method: 'GET',
    description: 'Check if an address is a smart contract',
    requestTemplate: {
      network: 43113
    },
    urlParams: {
      address: ''
    }
  },
  {
    category: 'Core API',
    name: 'Get Transaction Status By Reference',
    path: '/core/v1/evm/info/transaction/reference/{reference}',
    method: 'GET',
    description: 'Get transaction status by customer reference',
    requestTemplate: {},
    urlParams: {
      reference: ''
    }
  },
  {
    category: 'Core API',
    name: 'Estimate Gas For Contract Deployment',
    path: '/core/v1/evm/contract/deploy/estimategas',
    method: 'POST',
    description: 'Estimate gas required to deploy a smart contract',
    requestTemplate: {
      contractSpecsId: 0,
      sender: '',
      network: 43113,
      params: []
    }
  },
  {
    category: 'Core API',
    name: 'Estimate Gas For Transaction',
    path: '/core/v1/evm/transact/mutable/estimategas',
    method: 'POST',
    description: 'Estimate gas required to send a transaction',
    requestTemplate: {
      contractAddress: '',
      sender: '',
      network: 43113,
      method: '',
      params: []
    }
  },
  {
    category: 'Core API',
    name: 'Estimate Gas For Native Transfer',
    path: '/core/v1/evm/chain/transfer/estimategas',
    method: 'POST',
    description: 'Estimate gas required to transfer native cryptocurrency',
    requestTemplate: {
      sender: '',
      recipient: '',
      network: 43113,
      value: 0
    }
  },
  {
    category: 'Core API',
    name: 'Native Crypto Transfer',
    path: '/core/v1/evm/chain/transfer',
    method: 'POST',
    description: 'Transfer native cryptocurrency between accounts',
    requestTemplate: {
      sender: '',
      recipient: '',
      network: 43113,
      value: 0,
      gasLimit: 21000
    }
  },
  
  // IPFS API
  {
    category: 'IPFS API',
    name: 'Upload File',
    path: '/ipfs/v2/file/upload',
    method: 'POST',
    description: 'Upload a binary file to IPFS',
    requestTemplate: {
      note: 'This endpoint requires a multipart/form-data request with filename and file fields'
    }
  },
  {
    category: 'IPFS API',
    name: 'Upload Metadata (JSON)',
    path: '/ipfs/v2/file/metadata',
    method: 'POST',
    description: 'Upload JSON metadata to IPFS',
    requestTemplate: {
      name: 'Asset name',
      image: '',
      description: 'Asset description',
      attributes: [
        {
          trait_type: 'Trait 1',
          value: 'Value 1'
        }
      ],
      data: {
        creator: ''
      }
    }
  },
  
  // ERC-20 API
  {
    category: 'ERC-20 API',
    name: 'Deploy ERC-20 Token',
    path: '/erc/v1/erc20/deploy',
    method: 'POST',
    description: 'Deploy an ERC-20 token contract',
    requestTemplate: {
      name: 'Token Name',
      symbol: 'TKN',
      alias: 'My Token',
      initialSupply: 1000000000000000000000000, // 1 million tokens with 18 decimals
      network: 43113,
      gasLimit: 6000000
    }
  },
  {
    category: 'ERC-20 API',
    name: 'Transfer ERC-20 Tokens',
    path: '/erc/v1/erc20/transfer',
    method: 'POST',
    description: 'Transfer ERC-20 tokens to another address',
    requestTemplate: {
      contractAddress: '',
      recipient: '',
      network: 43113,
      amount: 100,
      gasLimit: 250000
    }
  },
  {
    category: 'ERC-20 API',
    name: 'Transfer From ERC-20',
    path: '/erc/v1/erc20/transferFrom',
    method: 'POST',
    description: 'Transfer ERC-20 tokens from one address to another using allowance',
    requestTemplate: {
      contractAddress: '',
      sender: '',
      recipient: '',
      network: 43113,
      amount: 100,
      gasLimit: 250000
    }
  },
  {
    category: 'ERC-20 API',
    name: 'Increase Allowance',
    path: '/erc/v1/erc20/increaseAllowance',
    method: 'POST',
    description: 'Increase the allowance granted to a spender',
    requestTemplate: {
      contractAddress: '',
      spender: '',
      network: 43113,
      amount: 100,
      gasLimit: 250000
    }
  },
  {
    category: 'ERC-20 API',
    name: 'Decrease Allowance',
    path: '/erc/v1/erc20/decreaseAllowance',
    method: 'POST',
    description: 'Decrease the allowance granted to a spender',
    requestTemplate: {
      contractAddress: '',
      spender: '',
      network: 43113,
      amount: 100,
      gasLimit: 250000
    }
  },
  {
    category: 'ERC-20 API',
    name: 'Get Allowance',
    path: '/erc/v1/erc20/allowance',
    method: 'POST',
    description: 'Get the remaining allowance for a spender',
    requestTemplate: {
      contractAddress: '',
      owner: '',
      spender: '',
      network: 43113
    }
  },
  {
    category: 'ERC-20 API',
    name: 'Get ERC-20 Name',
    path: '/erc/v1/erc20/name',
    method: 'POST',
    description: 'Get the name of an ERC-20 token',
    requestTemplate: {
      contractAddress: '',
      network: 43113
    }
  },
  {
    category: 'ERC-20 API',
    name: 'Get ERC-20 Symbol',
    path: '/erc/v1/erc20/symbol',
    method: 'POST',
    description: 'Get the symbol of an ERC-20 token',
    requestTemplate: {
      contractAddress: '',
      network: 43113
    }
  },
  {
    category: 'ERC-20 API',
    name: 'Get ERC-20 Total Supply',
    path: '/erc/v1/erc20/totalSupply',
    method: 'POST',
    description: 'Get the total supply of an ERC-20 token',
    requestTemplate: {
      contractAddress: '',
      network: 43113
    }
  },
  {
    category: 'ERC-20 API',
    name: 'Get ERC-20 Decimals',
    path: '/erc/v1/erc20/decimals',
    method: 'POST',
    description: 'Get the number of decimals of an ERC-20 token',
    requestTemplate: {
      contractAddress: '',
      network: 43113
    }
  },
  {
    category: 'ERC-20 API',
    name: 'Get ERC-20 Balance',
    path: '/erc/v1/erc20/balanceOf',
    method: 'POST',
    description: 'Get the token balance of an address',
    requestTemplate: {
      contractAddress: '',
      address: '',
      network: 43113
    }
  },
  
  // NFT (ERC-721) API
  {
    category: 'NFT API',
    name: 'Deploy ERC-721 Collection',
    path: '/erc/v1/erc721/deploy',
    method: 'POST',
    description: 'Deploy an ERC-721 NFT collection',
    requestTemplate: {
      name: 'NFT Collection',
      symbol: 'NFT',
      alias: 'My NFT Collection',
      baseURI: '',
      network: 43113,
      gasLimit: 6000000
    }
  },
  {
    category: 'NFT API',
    name: 'Mint ERC-721 NFT',
    path: '/erc/v1/erc721/mint',
    method: 'POST',
    description: 'Mint a new NFT in an ERC-721 collection',
    requestTemplate: {
      contractAddress: '',
      to: '',
      tokenId: 1,
      tokenURI: '',
      network: 43113,
      gasLimit: 250000
    }
  },
  {
    category: 'NFT API',
    name: 'Transfer ERC-721 NFT',
    path: '/erc/v1/erc721/transferFrom',
    method: 'POST',
    description: 'Transfer an NFT from one address to another',
    requestTemplate: {
      contractAddress: '',
      from: '',
      to: '',
      tokenId: 1,
      network: 43113,
      gasLimit: 250000
    }
  },
  {
    category: 'NFT API',
    name: 'Safe Transfer ERC-721 NFT',
    path: '/erc/v1/erc721/safeTransferFrom',
    method: 'POST',
    description: 'Safely transfer an NFT from one address to another',
    requestTemplate: {
      contractAddress: '',
      from: '',
      to: '',
      tokenId: 1,
      data: '0x',
      network: 43113,
      gasLimit: 250000
    }
  },
  {
    category: 'NFT API',
    name: 'Approve ERC-721 NFT',
    path: '/erc/v1/erc721/approve',
    method: 'POST',
    description: 'Approve an address to transfer a specific NFT',
    requestTemplate: {
      contractAddress: '',
      to: '',
      tokenId: 1,
      network: 43113,
      gasLimit: 250000
    }
  },
  {
    category: 'NFT API',
    name: 'Set Approval For All ERC-721',
    path: '/erc/v1/erc721/setApprovalForAll',
    method: 'POST',
    description: 'Approve an operator to transfer all NFTs',
    requestTemplate: {
      contractAddress: '',
      operator: '',
      approved: true,
      network: 43113,
      gasLimit: 250000
    }
  },
  {
    category: 'NFT API',
    name: 'Get NFT Owner',
    path: '/erc/v1/erc721/ownerOf',
    method: 'POST',
    description: 'Get the owner of a specific NFT',
    requestTemplate: {
      contractAddress: '',
      tokenId: 1,
      network: 43113
    }
  },
  {
    category: 'NFT API',
    name: 'Get NFT Balance',
    path: '/erc/v1/erc721/balanceOf',
    method: 'POST',
    description: 'Get the number of NFTs owned by an address',
    requestTemplate: {
      contractAddress: '',
      owner: '',
      network: 43113
    }
  },
  {
    category: 'NFT API',
    name: 'Get NFT Token URI',
    path: '/erc/v1/erc721/tokenURI',
    method: 'POST',
    description: 'Get the URI of a specific NFT',
    requestTemplate: {
      contractAddress: '',
      tokenId: 1,
      network: 43113
    }
  },
  {
    category: 'NFT API',
    name: 'Get NFT Approved',
    path: '/erc/v1/erc721/getApproved',
    method: 'POST',
    description: 'Get the approved address for a specific NFT',
    requestTemplate: {
      contractAddress: '',
      tokenId: 1,
      network: 43113
    }
  },
  {
    category: 'NFT API',
    name: 'Is Approved For All',
    path: '/erc/v1/erc721/isApprovedForAll',
    method: 'POST',
    description: 'Check if an operator is approved for all NFTs',
    requestTemplate: {
      contractAddress: '',
      owner: '',
      operator: '',
      network: 43113
    }
  },
  
  // NFT (ERC-1155) API
  {
    category: 'NFT 1155 API',
    name: 'Deploy ERC-1155 Collection',
    path: '/erc/v1/erc1155/deploy',
    method: 'POST',
    description: 'Deploy an ERC-1155 multi-token collection',
    requestTemplate: {
      name: 'Multi-Token Collection',
      alias: 'My ERC-1155 Collection',
      uri: '',
      network: 43113,
      gasLimit: 6000000
    }
  },
  {
    category: 'NFT 1155 API',
    name: 'Mint ERC-1155 Tokens',
    path: '/erc/v1/erc1155/mint',
    method: 'POST',
    description: 'Mint tokens in an ERC-1155 collection',
    requestTemplate: {
      contractAddress: '',
      to: '',
      id: 1,
      amount: 10,
      data: '0x',
      network: 43113,
      gasLimit: 250000
    }
  },
  {
    category: 'NFT 1155 API',
    name: 'Mint Batch ERC-1155',
    path: '/erc/v1/erc1155/mintBatch',
    method: 'POST',
    description: 'Mint multiple token types in a single transaction',
    requestTemplate: {
      contractAddress: '',
      to: '',
      ids: [1, 2, 3],
      amounts: [10, 20, 30],
      data: '0x',
      network: 43113,
      gasLimit: 500000
    }
  },
  {
    category: 'NFT 1155 API',
    name: 'Safe Transfer ERC-1155',
    path: '/erc/v1/erc1155/safeTransferFrom',
    method: 'POST',
    description: 'Transfer tokens from one address to another',
    requestTemplate: {
      contractAddress: '',
      from: '',
      to: '',
      id: 1,
      amount: 5,
      data: '0x',
      network: 43113,
      gasLimit: 250000
    }
  },
  {
    category: 'NFT 1155 API',
    name: 'Safe Batch Transfer ERC-1155',
    path: '/erc/v1/erc1155/safeBatchTransferFrom',
    method: 'POST',
    description: 'Transfer multiple token types in a single transaction',
    requestTemplate: {
      contractAddress: '',
      from: '',
      to: '',
      ids: [1, 2, 3],
      amounts: [5, 10, 15],
      data: '0x',
      network: 43113,
      gasLimit: 500000
    }
  },
  {
    category: 'NFT 1155 API',
    name: 'Set Approval For All ERC-1155',
    path: '/erc/v1/erc1155/setApprovalForAll',
    method: 'POST',
    description: 'Approve an operator to transfer all tokens',
    requestTemplate: {
      contractAddress: '',
      operator: '',
      approved: true,
      network: 43113,
      gasLimit: 250000
    }
  },
  {
    category: 'NFT 1155 API',
    name: 'Get ERC-1155 Balance',
    path: '/erc/v1/erc1155/balanceOf',
    method: 'POST',
    description: 'Get the balance of a specific token for an address',
    requestTemplate: {
      contractAddress: '',
      account: '',
      id: 1,
      network: 43113
    }
  },
  {
    category: 'NFT 1155 API',
    name: 'Get Batch Balance ERC-1155',
    path: '/erc/v1/erc1155/balanceOfBatch',
    method: 'POST',
    description: 'Get balances for multiple accounts and token IDs',
    requestTemplate: {
      contractAddress: '',
      accounts: ['', ''],
      ids: [1, 2],
      network: 43113
    }
  },
  {
    category: 'NFT 1155 API',
    name: 'Is Approved For All ERC-1155',
    path: '/erc/v1/erc1155/isApprovedForAll',
    method: 'POST',
    description: 'Check if an operator is approved for all tokens',
    requestTemplate: {
      contractAddress: '',
      account: '',
      operator: '',
      network: 43113
    }
  },
  {
    category: 'NFT 1155 API',
    name: 'Get ERC-1155 URI',
    path: '/erc/v1/erc1155/uri',
    method: 'POST',
    description: 'Get the URI for a token type',
    requestTemplate: {
      contractAddress: '',
      id: 1,
      network: 43113
    }
  },
  
  // POAP API
  {
    category: 'POAP API',
    name: 'Deploy POAP',
    path: '/poap/v1/deploy',
    method: 'POST',
    description: 'Deploy a POAP (Proof of Attendance Protocol) contract',
    requestTemplate: {
      name: 'My Event POAP',
      symbol: 'POAP',
      alias: 'My First POAP',
      baseURI: '',
      network: 43113,
      gasLimit: 6000000
    }
  },
  {
    category: 'POAP API',
    name: 'Mint POAP',
    path: '/poap/v1/mint',
    method: 'POST',
    description: 'Mint a POAP token for an attendee',
    requestTemplate: {
      contractAddress: '',
      to: '',
      tokenId: 1,
      tokenURI: '',
      network: 43113,
      gasLimit: 250000
    }
  },
  {
    category: 'POAP API',
    name: 'Batch Mint POAP',
    path: '/poap/v1/batchMint',
    method: 'POST',
    description: 'Mint multiple POAP tokens in a single transaction',
    requestTemplate: {
      contractAddress: '',
      recipients: ['', ''],
      tokenIds: [1, 2],
      tokenURIs: ['', ''],
      network: 43113,
      gasLimit: 500000
    }
  },
  {
    category: 'POAP API',
    name: 'Get POAP Owner',
    path: '/poap/v1/ownerOf',
    method: 'POST',
    description: 'Get the owner of a specific POAP token',
    requestTemplate: {
      contractAddress: '',
      tokenId: 1,
      network: 43113
    }
  },
  
  // Custodied Wallets API
  {
    category: 'Custodied Wallets API',
    name: 'Create Custodied Wallet',
    path: '/custodied/v1/wallet/create',
    method: 'POST',
    description: 'Create a new custodied wallet',
    requestTemplate: {
      alias: 'My Custodied Wallet'
    }
  },
  {
    category: 'Custodied Wallets API',
    name: 'Get Custodied Wallet',
    path: '/custodied/v1/wallet/{walletAddress}',
    method: 'GET',
    description: 'Get information about a custodied wallet',
    requestTemplate: {},
    urlParams: {
      walletAddress: ''
    }
  },
  {
    category: 'Custodied Wallets API',
    name: 'List Custodied Wallets',
    path: '/custodied/v1/wallet',
    method: 'GET',
    description: 'List all custodied wallets',
    requestTemplate: {}
  },
  {
    category: 'Custodied Wallets API',
    name: 'Send Transaction From Custodied Wallet',
    path: '/custodied/v1/evm/transact/mutable',
    method: 'POST',
    description: 'Send a transaction from a custodied wallet',
    requestTemplate: {
      walletAddress: '',
      contractAddress: '',
      blockchainNetwork: 43113,
      gasLimit: 250000,
      method: '',
      params: []
    }
  },
  {
    category: 'Custodied Wallets API',
    name: 'Transfer Native Crypto From Custodied Wallet',
    path: '/custodied/v1/evm/chain/transfer',
    method: 'POST',
    description: 'Transfer native cryptocurrency from a custodied wallet',
    requestTemplate: {
      walletAddress: '',
      recipient: '',
      blockchainNetwork: 43113,
      value: 0,
      gasLimit: 21000
    }
  }
];

// Método para obtener un color de fondo según la categoría
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Core API':
      return 'bg-blue-600 hover:bg-blue-700';
    case 'IPFS API':
      return 'bg-purple-600 hover:bg-purple-700';
    case 'ERC-20 API':
      return 'bg-green-600 hover:bg-green-700';
    case 'NFT API':
      return 'bg-pink-600 hover:bg-pink-700';
    case 'NFT 1155 API':
      return 'bg-orange-600 hover:bg-orange-700';
    case 'POAP API':
      return 'bg-yellow-600 hover:bg-yellow-700';
    case 'Custodied Wallets API':
      return 'bg-red-600 hover:bg-red-700';
    default:
      return 'bg-gray-600 hover:bg-gray-700';
  }
};

// Método para obtener un color de texto según la categoría
const getCategoryTextColor = (category: string) => {
  switch (category) {
    case 'Core API':
      return 'text-blue-600';
    case 'IPFS API':
      return 'text-purple-600';
    case 'ERC-20 API':
      return 'text-green-600';
    case 'NFT API':
      return 'text-pink-600';
    case 'NFT 1155 API':
      return 'text-orange-600';
    case 'POAP API':
      return 'text-yellow-600';
    case 'Custodied Wallets API':
      return 'text-red-600';
    default:
      return 'text-gray-400';
  }
};

// Método para obtener un color de borde según la categoría
const getCategoryBorderColor = (category: string) => {
  switch (category) {
    case 'Core API':
      return 'border-blue-600';
    case 'IPFS API':
      return 'border-purple-600';
    case 'ERC-20 API':
      return 'border-green-600';
    case 'NFT API':
      return 'border-pink-600';
    case 'NFT 1155 API':
      return 'border-orange-600';
    case 'POAP API':
      return 'border-yellow-600';
    case 'Custodied Wallets API':
      return 'border-red-600';
    default:
      return 'border-gray-600';
  }
};

// Método para obtener un color de fondo claro según la categoría
const getCategoryBgLightColor = (category: string) => {
  switch (category) {
    case 'Core API':
      return 'bg-blue-50';
    case 'IPFS API':
      return 'bg-purple-50';
    case 'ERC-20 API':
      return 'bg-green-50';
    case 'NFT API':
      return 'bg-pink-50';
    case 'NFT 1155 API':
      return 'bg-orange-50';
    case 'POAP API':
      return 'bg-yellow-50';
    case 'Custodied Wallets API':
      return 'bg-red-50';
    default:
      return 'bg-gray-50';
  }
};

// Método para obtener un icono según el método HTTP
const getMethodBadgeColor = (method: string) => {
  switch (method) {
    case 'GET':
      return 'bg-green-100 text-green-800';
    case 'POST':
      return 'bg-blue-100 text-blue-800';
    case 'PUT':
      return 'bg-yellow-100 text-yellow-800';
    case 'DELETE':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function Home() {
  const [credentials, setCredentials] = useState({
    apiKey: '',
    appId: '',
    wallet: ''
  });
  
  // Add state for wallet balance and selected testnet
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [selectedTestnet, setSelectedTestnet] = useState<string>('sepolia');
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);

  const [selectedEndpoint, setSelectedEndpoint] = useState<typeof VOTTUN_ENDPOINTS[0] | null>(null);
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Estado para controlar la categoría actualmente expandida (solo una a la vez)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Estado para los campos dinámicos del formulario
  const [formFields, setFormFields] = useState<Record<string, any>>({});
  const [urlParams, setUrlParams] = useState<Record<string, any>>({});

  const handleCredentialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Función para manejar cambios en los campos del formulario
  const handleFormFieldChange = (fieldName: string, value: any) => {
    const updatedFields = {
      ...formFields,
      [fieldName]: value
    };
    
    setFormFields(updatedFields);
    
    // Actualizar el JSON del cuerpo de la petición
    if (selectedEndpoint) {
      setRequestBody(JSON.stringify(updatedFields, null, 2));
    }
  };

  const handleUrlParamChange = (fieldName: string, value: any) => {
    const updatedFields = {
      ...urlParams,
      [fieldName]: value
    };
    
    setUrlParams(updatedFields);
  };

  // Function to check wallet balance using Web3 provider or direct RPC calls
  const checkWalletBalance = async () => {
    if (!credentials.wallet) {
      setError('Por favor, ingresa una dirección de wallet');
      return;
    }

    setIsCheckingBalance(true);
    setWalletBalance(null);
    setError(null);

    try {
      console.log(`Starting balance check for wallet: ${credentials.wallet} on network: ${selectedTestnet}`);
      
      // RPC URLs for different testnets with reliable CORS support
      const rpcUrls: Record<string, string> = {
        'sepolia': 'https://ethereum-sepolia.publicnode.com',
        'goerli': 'https://ethereum-goerli.publicnode.com',
        'amoy': 'https://rpc.ankr.com/polygon_amoy',  // Updated to Ankr's Polygon Amoy endpoint
        'base-sepolia': 'https://base-sepolia.publicnode.com',
        'base-mainnet': 'https://base.publicnode.com',
        'optimism-sepolia': 'https://optimism-sepolia.publicnode.com',
        'optimism-mainnet': 'https://optimism.publicnode.com',
        'arbitrum-sepolia': 'https://arbitrum-sepolia.publicnode.com',
        'arbitrum-mainnet': 'https://arbitrum-one.publicnode.com',
        'polygon-mumbai': 'https://polygon-mumbai.publicnode.com',
        'polygon-mainnet': 'https://polygon.publicnode.com',
        'avalanche-fuji': 'https://avalanche-fuji-c-chain.publicnode.com',
        'avalanche-mainnet': 'https://avalanche-c-chain.publicnode.com',
        'fantom-testnet': 'https://fantom-testnet.publicnode.com',
        'fantom-mainnet': 'https://fantom.publicnode.com',
        'bsc-testnet': 'https://bsc-testnet.publicnode.com',
        'bsc-mainnet': 'https://bsc.publicnode.com',
        'gnosis-chiado': 'https://gnosis-chiado.publicnode.com',
        'gnosis-mainnet': 'https://gnosis.publicnode.com',
        'celo-alfajores': 'https://celo-alfajores.publicnode.com',
        'celo-mainnet': 'https://celo.publicnode.com'
      };

      // Try a different endpoint specifically for Amoy
      if (selectedTestnet === 'amoy') {
        console.log('Using special handling for Amoy network');
        try {
          // Try Ankr's endpoint first
          console.log('Trying Ankr endpoint for Amoy');
          const ankrResponse = await fetch('https://rpc.ankr.com/polygon_amoy', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_getBalance',
              params: [credentials.wallet, 'latest'],
              id: 1,
            }),
          });
          
          console.log('Ankr response status:', ankrResponse.status);
          if (ankrResponse.ok) {
            const ankrData = await ankrResponse.json();
            console.log('Ankr response data:', ankrData);
            
            if (ankrData.result) {
              const balanceInWei = parseInt(ankrData.result, 16);
              console.log(`Ankr balance in wei: ${balanceInWei}`);
              const balanceInEther = balanceInWei / 1e18;
              console.log(`Ankr balance in MATIC: ${balanceInEther}`);
              
              // Format with up to 6 decimal places
              const formattedBalance = balanceInEther.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6
              });
              
              setWalletBalance(`${formattedBalance} MATIC`);
              setIsCheckingBalance(false);
              return;
            }
          }
          
          // If Ankr fails, try another endpoint
          console.log('Ankr endpoint failed, trying alternative endpoint');
          const altResponse = await fetch('https://polygon-amoy-rpc.publicnode.com', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_getBalance',
              params: [credentials.wallet, 'latest'],
              id: 1,
            }),
          });
          
          console.log('Alternative response status:', altResponse.status);
          if (altResponse.ok) {
            const altData = await altResponse.json();
            console.log('Alternative response data:', altData);
            
            if (altData.result) {
              const balanceInWei = parseInt(altData.result, 16);
              console.log(`Alternative balance in wei: ${balanceInWei}`);
              const balanceInEther = balanceInWei / 1e18;
              console.log(`Alternative balance in MATIC: ${balanceInEther}`);
              
              // Format with up to 6 decimal places
              const formattedBalance = balanceInEther.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6
              });
              
              setWalletBalance(`${formattedBalance} MATIC`);
              setIsCheckingBalance(false);
              return;
            }
          }
          
          // If both fail, show error
          setError('No se pudo conectar a la red Amoy. Intenta con otra red.');
          setIsCheckingBalance(false);
          return;
        } catch (amoyError) {
          console.error('Error with special Amoy handling:', amoyError);
          setError(`Error al verificar el balance en Amoy: ${amoyError instanceof Error ? amoyError.message : String(amoyError)}`);
          setIsCheckingBalance(false);
          return;
        }
      }
      
      // Currency symbols for each network
      const currencySymbols: Record<string, string> = {
        'sepolia': 'ETH',
        'goerli': 'ETH',
        'amoy': 'MATIC',
        'base-sepolia': 'ETH',
        'base-mainnet': 'ETH',
        'optimism-sepolia': 'ETH',
        'optimism-mainnet': 'ETH',
        'arbitrum-sepolia': 'ETH',
        'arbitrum-mainnet': 'ETH',
        'polygon-mumbai': 'MATIC',
        'polygon-mainnet': 'MATIC',
        'avalanche-fuji': 'AVAX',
        'avalanche-mainnet': 'AVAX',
        'fantom-testnet': 'FTM',
        'fantom-mainnet': 'FTM',
        'bsc-testnet': 'BNB',
        'bsc-mainnet': 'BNB',
        'gnosis-chiado': 'xDAI',
        'gnosis-mainnet': 'xDAI',
        'celo-alfajores': 'CELO',
        'celo-mainnet': 'CELO'
      };

      const rpcUrl = rpcUrls[selectedTestnet];
      const currencySymbol = currencySymbols[selectedTestnet] || 'ETH';
      
      if (!rpcUrl) {
        setError(`Red no soportada: ${selectedTestnet}`);
        return;
      }

      // Try using MetaMask/Web3 provider if available
      if (window.ethereum && window.ethereum.isMetaMask) {
        try {
          // Request account access if needed
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          // Get the balance
          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [credentials.wallet, 'latest']
          });
          
          // Convert balance from hex to decimal and then from wei to ether
          const balanceInWei = parseInt(balance, 16);
          const balanceInEther = balanceInWei / 1e18;
          
          // Format with up to 6 decimal places
          const formattedBalance = balanceInEther.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
          });
          
          setWalletBalance(`${formattedBalance} ${currencySymbol}`);
          return;
        } catch (metaMaskError) {
          console.warn('MetaMask error, trying direct RPC:', metaMaskError);
          // Continue to direct RPC if MetaMask fails
        }
      }

      // Direct RPC call as fallback (with better CORS handling)
      console.log(`Checking balance for ${credentials.wallet} on ${selectedTestnet} using ${rpcUrl}`);
      const response = await fetch(`${rpcUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [credentials.wallet, 'latest'],
          id: 1,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`RPC response:`, data);
      
      if (data.error) {
        throw new Error(`Error RPC: ${JSON.stringify(data.error)}`);
      }
      
      // Convert balance from hex to decimal and then from wei to ether
      const balanceInWei = parseInt(data.result, 16);
      console.log(`Balance in wei: ${balanceInWei}`);
      const balanceInEther = balanceInWei / 1e18;
      console.log(`Balance in ether: ${balanceInEther}`);
      
      // Format with up to 6 decimal places
      const formattedBalance = balanceInEther.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
      });
      
      setWalletBalance(`${formattedBalance} ${currencySymbol}`);
    } catch (error) {
      console.error('Error al verificar el balance:', error);
      setError(`Error al verificar el balance: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsCheckingBalance(false);
    }
  };

  const handleRequest = async () => {
    if (!selectedEndpoint) {
      setError('Por favor, selecciona un endpoint');
      return;
    }

    // Validar credenciales antes de hacer la petición
    if (!credentials.apiKey || !credentials.appId) {
      setError('Credenciales incompletas: API Key y App ID son obligatorios para hacer peticiones a Vottun API');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const vottunService = new VottunService(credentials);
      
      // Procesar la URL si tiene parámetros dinámicos
      let endpoint = selectedEndpoint.path;
      
      // Si hay parámetros de URL, reemplazarlos en la ruta
      if (selectedEndpoint.urlParams) {
        Object.entries(urlParams).forEach(([key, value]) => {
          if (value && endpoint.includes(`{${key}}`)) {
            endpoint = endpoint.replace(`{${key}}`, String(value));
          }
        });
      }
      
      // Si después de reemplazar aún quedan parámetros en la URL, intentar usar la wallet de las credenciales
      if (endpoint.includes('{account}') && credentials.wallet) {
        endpoint = endpoint.replace('{account}', credentials.wallet);
      }
      
      // Verificar si aún quedan parámetros sin reemplazar
      if (endpoint.includes('{')) {
        const missingParam = endpoint.match(/{([^}]+)}/)?.[1];
        setError(`Falta el parámetro de URL: ${missingParam}. Por favor, completa todos los campos requeridos.`);
        setIsLoading(false);
        return;
      }
      
      // Actualizar el requestBody con los campos del formulario
      let parsedBody;
      try {
        parsedBody = requestBody ? JSON.parse(requestBody) : undefined;
      } catch (error) {
        setError('El cuerpo de la petición no es un JSON válido');
        setIsLoading(false);
        return;
      }
      
      const result = await vottunService.makeRequest({
        endpoint: endpoint,
        method: selectedEndpoint.method as 'GET' | 'POST' | 'PUT' | 'DELETE',
        body: parsedBody,
      });
      setResponse(result);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      if (err instanceof Error) {
        // Mostrar mensaje de error más descriptivo
        if (err.message.includes('401')) {
          setError('Error de autenticación: Verifica que tu API Key y App ID sean correctos. Debes obtener estas credenciales en el portal de Vottun.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Ha ocurrido un error desconocido');
      }
      console.error('Request error:', err);
    }
  };

  const copyToClipboard = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Función para alternar la expansión de una categoría
  const toggleCategory = (category: string) => {
    setExpandedCategory(prev => prev === category ? null : category);
  };

  // Genera campos de formulario basados en el template del endpoint
  const generateFormFields = () => {
    if (!selectedEndpoint) return null;
    
    // Contenedor para ambas secciones
    const sections = [];
    
    // Sección 1: Parámetros de URL (si existen)
    if (selectedEndpoint.urlParams && typeof selectedEndpoint.urlParams === 'object') {
      const urlParamFields = Object.entries(selectedEndpoint.urlParams).map(([key, defaultValue]) => {
        // Determinar el tipo de campo
        let fieldType = 'text';
        let fieldComponent;
        
        if (typeof defaultValue === 'number') {
          fieldType = 'number';
        } else if (typeof defaultValue === 'boolean') {
          fieldType = 'checkbox';
        } else if (Array.isArray(defaultValue)) {
          fieldType = 'array';
        } else if (typeof defaultValue === 'object' && defaultValue !== null) {
          fieldType = 'object';
        }
        
        // Crear el componente de campo adecuado
        switch (fieldType) {
          case 'number':
            fieldComponent = (
              <input
                type="number"
                value={urlParams[key] !== undefined ? urlParams[key] : defaultValue}
                onChange={(e) => handleUrlParamChange(key, Number(e.target.value))}
                className="mt-1 block w-full rounded-md bg-[#13243a] text-white border border-[#004089] placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder={`Introduce ${key}`}
              />
            );
            break;
          case 'checkbox':
            fieldComponent = (
              <input
                type="checkbox"
                checked={urlParams[key] !== undefined ? urlParams[key] : defaultValue}
                onChange={(e) => handleUrlParamChange(key, e.target.checked)}
                className="h-4 w-4 rounded border-[#004089] text-indigo-600 focus:ring-indigo-500"
              />
            );
            break;
          case 'array':
            // Para arrays, mostramos un campo de texto que acepta valores separados por comas
            fieldComponent = (
              <div>
                <input
                  type="text"
                  value={urlParams[key] ? urlParams[key].join(', ') : ''}
                  onChange={(e) => handleUrlParamChange(key, e.target.value.split(',').map(item => item.trim()))}
                  className="mt-1 block w-full rounded-md bg-[#13243a] text-white border border-[#004089] placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder={`Introduce valores separados por comas`}
                />
                <p className="mt-1 text-xs text-gray-400">Introduce valores separados por comas</p>
              </div>
            );
            break;
          case 'object':
            // Para objetos, mostramos un área de texto JSON
            fieldComponent = (
              <div>
                <textarea
                  value={urlParams[key] ? JSON.stringify(urlParams[key], null, 2) : JSON.stringify(defaultValue, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsedValue = JSON.parse(e.target.value);
                      handleUrlParamChange(key, parsedValue);
                    } catch (error) {
                      // Si no es un JSON válido, guardamos el texto tal cual
                      console.warn('JSON inválido:', error);
                    }
                  }}
                  className="mt-1 block w-full rounded-md bg-[#13243a] text-white border border-[#004089] placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
                  rows={3}
                  placeholder={`Introduce objeto JSON`}
                />
                <p className="mt-1 text-xs text-gray-400">Introduce un objeto JSON válido</p>
              </div>
            );
            break;
          default:
            fieldComponent = (
              <input
                type="text"
                value={urlParams[key] !== undefined ? urlParams[key] : defaultValue}
                onChange={(e) => handleUrlParamChange(key, e.target.value)}
                className="mt-1 block w-full rounded-md bg-[#13243a] text-white border border-[#004089] placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder={`Introduce ${key}`}
              />
            );
        }
        
        return (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium text-white mb-1">
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            </label>
            {fieldComponent}
          </div>
        );
      });
      
      if (urlParamFields.length > 0) {
        sections.push(
          <div key="url-params" className="space-y-2 mb-4 p-4 bg-[#02192E] rounded-md">
            <h4 className="font-medium text-blue-900">Parámetros de URL</h4>
            <p className="text-xs text-blue-700 mb-3">Estos parámetros se reemplazarán en la ruta del endpoint</p>
            {urlParamFields}
          </div>
        );
      }
    }
    
    // Sección 2: Parámetros del Endpoint (query o body)
    if (selectedEndpoint.requestTemplate && typeof selectedEndpoint.requestTemplate === 'object') {
      const requestParamFields = Object.entries(selectedEndpoint.requestTemplate).map(([key, defaultValue]) => {
        // Código existente para generar campos de formulario
        let fieldType = 'text';
        let fieldComponent;
        
        if (typeof defaultValue === 'number') {
          fieldType = 'number';
        } else if (typeof defaultValue === 'boolean') {
          fieldType = 'checkbox';
        } else if (Array.isArray(defaultValue)) {
          fieldType = 'array';
        } else if (typeof defaultValue === 'object' && defaultValue !== null) {
          fieldType = 'object';
        }
        
        // Crear el componente de campo adecuado
        switch (fieldType) {
          case 'number':
            fieldComponent = (
              <input
                type="number"
                value={formFields[key] !== undefined ? formFields[key] : defaultValue}
                onChange={(e) => handleFormFieldChange(key, Number(e.target.value))}
                className="mt-1 block w-full rounded-md bg-[#13243a] text-white border border-[#004089] placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder={`Introduce ${key}`}
              />
            );
            break;
          case 'checkbox':
            fieldComponent = (
              <input
                type="checkbox"
                checked={formFields[key] !== undefined ? formFields[key] : defaultValue}
                onChange={(e) => handleFormFieldChange(key, e.target.checked)}
                className="h-4 w-4 rounded border-[#004089] text-indigo-600 focus:ring-indigo-500"
              />
            );
            break;
          case 'array':
            // Para arrays, mostramos un campo de texto que acepta valores separados por comas
            fieldComponent = (
              <div>
                <input
                  type="text"
                  value={formFields[key] ? formFields[key].join(', ') : ''}
                  onChange={(e) => handleFormFieldChange(key, e.target.value.split(',').map(item => item.trim()))}
                  className="mt-1 block w-full rounded-md bg-[#13243a] text-white border border-[#004089] placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder={`Introduce valores separados por comas`}
                />
                <p className="mt-1 text-xs text-gray-400">Introduce valores separados por comas</p>
              </div>
            );
            break;
          case 'object':
            // Para objetos, mostramos un área de texto JSON
            fieldComponent = (
              <div>
                <textarea
                  value={formFields[key] ? JSON.stringify(formFields[key], null, 2) : JSON.stringify(defaultValue, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsedValue = JSON.parse(e.target.value);
                      handleFormFieldChange(key, parsedValue);
                    } catch (error) {
                      // Si no es un JSON válido, guardamos el texto tal cual
                      console.warn('JSON inválido:', error);
                    }
                  }}
                  className="mt-1 block w-full rounded-md bg-[#13243a] text-white border border-[#004089] placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
                  rows={3}
                  placeholder={`Introduce objeto JSON`}
                />
                <p className="mt-1 text-xs text-gray-400">Introduce un objeto JSON válido</p>
              </div>
            );
            break;
          default:
            fieldComponent = (
              <input
                type="text"
                value={formFields[key] !== undefined ? formFields[key] : defaultValue}
                onChange={(e) => handleFormFieldChange(key, e.target.value)}
                className="mt-1 block w-full rounded-md bg-[#13243a] text-white border border-[#004089] placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder={`Introduce ${key}`}
              />
            );
        }
        
        return (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium text-white mb-1">
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            </label>
            {fieldComponent}
          </div>
        );
      });
      
      if (requestParamFields.length > 0) {
        sections.push(
          <div key="request-params" className="space-y-2 mb-4 p-4 bg-[#02192E] rounded-md">
            <h4 className="font-medium text-white">Parámetros del Endpoint</h4>
            <p className="text-xs text-gray-100 mb-3">
              {selectedEndpoint.method === 'GET' ? 'Estos parámetros se enviarán como query parameters' : 'Estos parámetros se enviarán en el body de la petición'}
            </p>
            {requestParamFields}
          </div>
        );
      }
    }
    
    return sections.length > 0 ? sections : null;
  };

  // Get unique categories
  const categories = Array.from(new Set(VOTTUN_ENDPOINTS.map(endpoint => endpoint.category)));

  // Construir la URL completa para mostrar
  const fullUrl = selectedEndpoint 
    ? `https://api.vottun.tech${selectedEndpoint.path}`
    : '';

  return (
    <div className="flex h-screen ">
      {/* Sidebar */}
      <div className="w-72 bg-[#02192E] text-white shadow-xl flex flex-col">
        <div className="p-4 border-b border-gray-700 flex items-center">
          <img src="/Vector-w.png" alt="Logo" className="h-8 mr-3" />
        </div>
        
        {/* Categorías con acordeón */}
        <div className="flex-1 overflow-y-auto p-3">
          <h3 className="text-xs uppercase text-gray-400 font-semibold mb-2 px-2">Categorías</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="rounded-md overflow-hidden">
                <button 
                  className={`w-full text-left px-3 py-2 flex justify-between items-center transition-colors ${
                    expandedCategory === category 
                      ? 'bg-gray-700 text-white' 
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                  }`}
                  onClick={() => toggleCategory(category)}
                >
                  <span>{category}</span>
                  {expandedCategory === category ? (
                    <ChevronUpIcon className="h-4 w-4" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4" />
                  )}
                </button>
                
                {/* Lista de endpoints para esta categoría */}
                {expandedCategory === category && (
                  <div className="bg-gray-900 max-h-60 overflow-y-auto">
                    {VOTTUN_ENDPOINTS.filter(endpoint => endpoint.category === category).map((endpoint) => (
                      <button 
                        key={endpoint.path}
                        className={`w-full text-left p-2 pl-6 transition-colors ${
                          selectedEndpoint?.path === endpoint.path 
                            ? getCategoryColor(endpoint.category) + ' text-white' 
                            : 'text-gray-300 hover:bg-gray-800'
                        }`}
                        onClick={() => {
                          setSelectedEndpoint(endpoint);
                          // Inicializar los campos del formulario con los valores del template
                          const initialFormFields = { ...endpoint.requestTemplate };
                          const initialUrlParams = { ...endpoint.urlParams } as { account?: string };
                          
                          // Si hay wallet en las credenciales y el endpoint lo requiere, usarla
                          if (endpoint.path === '/core/v1/evm/chain/{account}/balance' && credentials.wallet) {
                            // Para este endpoint, podemos pre-llenar el campo account con la wallet de las credenciales
                            initialUrlParams.account = credentials.wallet;
                          }
                          
                          // Para endpoints que requieren sender o wallet, usar la wallet de las credenciales
                          if (initialFormFields.sender !== undefined && credentials.wallet) {
                            initialFormFields.sender = credentials.wallet;
                          }
                          
                          setFormFields(initialFormFields);
                          setUrlParams(initialUrlParams);
                          setRequestBody(JSON.stringify(initialFormFields, null, 2));
                        }}
                      >
                        <div className="flex items-center">
                          <span className={`inline-flex items-center justify-center px-2 py-1 mr-2 text-xs font-bold leading-none rounded ${getMethodBadgeColor(endpoint.method)}`}>
                            {endpoint.method}
                          </span>
                          <span className="text-sm">{endpoint.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Credentials Section */}
          <div className="bg-[#02192E] text-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Credenciales API
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1">
                <label htmlFor="apiKey" className="block text-sm font-medium text-white">
                  API Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="apiKey"
                  id="apiKey"
                  value={credentials.apiKey}
                  onChange={handleCredentialsChange}
                  className="mt-1 block w-full rounded-md bg-[#13243a] text-white border border-[#004089] placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Introduce API Key"
                />
                {!credentials.apiKey && <p className="mt-1 text-xs text-red-500">Este campo es obligatorio</p>}
              </div>

              <div className="col-span-1">
                <label htmlFor="appId" className="block text-sm font-medium text-white">
                  App ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="appId"
                  id="appId"
                  value={credentials.appId}
                  onChange={handleCredentialsChange}
                  className="mt-1 block w-full rounded-md bg-[#13243a] text-white border border-[#004089] placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Introduce App ID"
                />
                {!credentials.appId && <p className="mt-1 text-xs text-red-500">Este campo es obligatorio</p>}
              </div>

              <div className="col-span-1">
                <label htmlFor="wallet" className="block text-sm font-medium text-white">
                  Wallet
                </label>
                <input
                  type="text"
                  name="wallet"
                  id="wallet"
                  value={credentials.wallet}
                  onChange={handleCredentialsChange}
                  className="mt-1 block w-full rounded-md bg-[#13243a] text-white border border-[#004089] placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Introduce dirección Wallet"
                />
              </div>
              
              <div className="col-span-1">
                <div className="flex items-end space-x-2">
                  <div className="flex-grow">
                    <label htmlFor="testnet" className="block text-sm font-medium text-white">
                      Red
                    </label>
                    <select
                      id="testnet"
                      value={selectedTestnet}
                      onChange={(e) => setSelectedTestnet(e.target.value)}
                      className="mt-1 block w-full rounded-md bg-[#13243a] text-white border border-[#004089] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="sepolia">Sepolia</option>
                      <option value="goerli">Goerli</option>
                      <option value="amoy">Amoy</option>
                      <option value="base-sepolia">Base Sepolia</option>
                      <option value="base-mainnet">Base</option>
                      <option value="optimism-sepolia">OP Sepolia</option>
                      <option value="optimism-mainnet">Optimism</option>
                      <option value="arbitrum-sepolia">Arb Sepolia</option>
                      <option value="arbitrum-mainnet">Arbitrum</option>
                      <option value="polygon-mumbai">Polygon Mumbai</option>
                      <option value="polygon-mainnet">Polygon</option>
                      <option value="avalanche-fuji">Avalanche Fuji</option>
                      <option value="avalanche-mainnet">Avalanche</option>
                      <option value="fantom-testnet">Fantom Testnet</option>
                      <option value="fantom-mainnet">Fantom</option>
                      <option value="bsc-testnet">BSC Testnet</option>
                      <option value="bsc-mainnet">BSC</option>
                      <option value="gnosis-chiado">Gnosis Chiado</option>
                      <option value="gnosis-mainnet">Gnosis</option>
                      <option value="celo-alfajores">Celo Alfajores</option>
                      <option value="celo-mainnet">Celo</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={checkWalletBalance}
                    disabled={isCheckingBalance || !credentials.wallet}
                    className="mb-0.5 inline-flex justify-center py-2 px-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isCheckingBalance ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verificando...
                      </>
                    ) : (
                      'Verificar'
                    )}
                  </button>
                </div>
                {walletBalance && (
                  <div className="mt-1 text-sm font-medium text-blue-800">
                    Balance: {walletBalance}
                  </div>
                )}
                {error && (
                  <div className="mt-1">
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-400">
              <p>Para obtener tus credenciales, regístrate en <a href="https://app.vottun.io/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">https://app.vottun.io/</a></p>
            </div>
            
            {/* Testnet Selector and Balance Checker */}
            
          </div>

          {/* Request Section */}
          <div className="bg-[#02192E] text-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Petición
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">Endpoint Seleccionado</label>
                <div className="mt-1 p-4 rounded-md bg-[#13243a] border border-[#004089] text-white">
                  {selectedEndpoint ? (
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`font-medium ${getCategoryTextColor(selectedEndpoint.category)}`}>{selectedEndpoint.name}</p>
                          <div className="flex items-center mt-1">
                            <span className="text-white font-mono text-sm">{fullUrl}</span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodBadgeColor(selectedEndpoint.method)}`}>
                          {selectedEndpoint.method}
                        </span>
                      </div>
                      <p className="text-white text-sm mt-2">{selectedEndpoint.description}</p>
                      <p className="text-white text-xs mt-2">Categoría: <span className={getCategoryTextColor(selectedEndpoint.category)}>{selectedEndpoint.category}</span></p>
                    </div>
                  ) : (
                    <p className="text-gray-400" >Ningún endpoint seleccionado</p>
                  )}
                </div>
              </div>
              
              {/* Formulario dinámico para los parámetros del endpoint */}
              {selectedEndpoint && generateFormFields()}
              
              <div>
                <label className="block text-sm font-medium text-white mb-1">Cuerpo de la Petición</label>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="mt-1 block w-full rounded-md bg-[#13243a] text-white border border-[#004089] placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
                  rows={10}
                  placeholder="Introduce el cuerpo JSON de la petición"
                />
              </div>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-4 rounded-md border border-red-200 flex items-start">
                  <XCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" />
                  <div>
                    <p className="font-medium">{error.includes(':') ? error.split(':')[0] : 'Error'}</p>
                    <p className="mt-1">{error.includes(':') ? error.split(':').slice(1).join(':').trim() : error}</p>
                    {error.includes('401') && (
                      <p className="mt-2 text-sm">
                        Asegúrate de que has introducido correctamente tus credenciales de Vottun. Puedes obtenerlas en el 
                        <a href="https://vottun.io" target="_blank" rel="noopener noreferrer" className="ml-1 text-red-700 hover:text-red-900 underline">
                          Dashboard de Vottun
                        </a>.
                      </p>
                    )}
                  </div>
                </div>
              )}
              <button
                onClick={handleRequest}
                disabled={!selectedEndpoint || isLoading}
                className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors flex items-center ${
                  !selectedEndpoint || isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  <>
                    <ArrowRightIcon className="h-4 w-4 mr-1" />
                    Enviar Petición
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Response Section */}
          <div className="bg-[#02192E] rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Respuesta
              </h3>
              {response && (
                <button 
                  onClick={copyToClipboard}
                  className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                >
                  {copied ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                      Copiar
                    </>
                  )}
                </button>
              )}
            </div>
            <pre className="p-4 rounded-md overflow-auto font-mono text-sm text-white max-h-96 bg-[#13243a] border border-[#004089]">
  {response ? JSON.stringify(response, null, 2) : 'No hay respuesta todavía'}
</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
