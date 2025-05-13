import { NextRequest, NextResponse } from 'next/server';

// RPC URLs for different testnets
const rpcUrls: Record<string, string> = {
  'sepolia': 'https://eth-sepolia.public.blastapi.io',
  'goerli': 'https://eth-goerli.public.blastapi.io',
  'amoy': 'https://ethereum-amoy.publicnode.com',
  'base-sepolia': 'https://sepolia.base.org',
  'base-mainnet': 'https://mainnet.base.org',
  'optimism-sepolia': 'https://sepolia.optimism.io',
  'optimism-mainnet': 'https://mainnet.optimism.io',
  'arbitrum-sepolia': 'https://sepolia-rollup.arbitrum.io/rpc',
  'arbitrum-mainnet': 'https://arb1.arbitrum.io/rpc',
  'polygon-mumbai': 'https://polygon-mumbai.blockpi.network/v1/rpc/public',
  'polygon-mainnet': 'https://polygon-rpc.com',
  'avalanche-fuji': 'https://api.avax-test.network/ext/bc/C/rpc',
  'avalanche-mainnet': 'https://api.avax.network/ext/bc/C/rpc',
  'fantom-testnet': 'https://rpc.testnet.fantom.network',
  'fantom-mainnet': 'https://rpc.ftm.tools',
  'bsc-testnet': 'https://data-seed-prebsc-1-s1.binance.org:8545',
  'bsc-mainnet': 'https://bsc-dataseed.binance.org',
  'gnosis-chiado': 'https://rpc.chiadochain.net',
  'gnosis-mainnet': 'https://rpc.gnosischain.com',
  'celo-alfajores': 'https://alfajores-forno.celo-testnet.org',
  'celo-mainnet': 'https://forno.celo.org'
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { network, address } = body;
    
    if (!network || !address) {
      return NextResponse.json(
        { error: 'Network and address are required' },
        { status: 400 }
      );
    }
    
    const rpcUrl = rpcUrls[network];
    
    if (!rpcUrl) {
      return NextResponse.json(
        { error: `No RPC URL found for network: ${network}` },
        { status: 400 }
      );
    }
    
    console.log(`Fetching balance for ${address} on ${network} using ${rpcUrl}`);
    
    try {
      // Make the RPC request to get the balance
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [address, 'latest'],
          id: 1,
        }),
      });
      
      if (!response.ok) {
        console.error(`RPC request failed with status: ${response.status}`);
        const text = await response.text();
        console.error(`Response body: ${text}`);
        return NextResponse.json(
          { error: `RPC request failed with status: ${response.status}` },
          { status: 502 }
        );
      }
      
      const responseText = await response.text();
      console.log(`RPC response: ${responseText}`);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error(`Failed to parse JSON response: ${parseError}`);
        return NextResponse.json(
          { error: `Invalid JSON response from RPC endpoint: ${responseText.substring(0, 100)}...` },
          { status: 502 }
        );
      }
      
      if (data.error) {
        console.error(`RPC error: ${JSON.stringify(data.error)}`);
        return NextResponse.json(
          { error: `RPC error: ${JSON.stringify(data.error)}` },
          { status: 502 }
        );
      }
      
      if (!data.result) {
        console.error(`No result in RPC response: ${JSON.stringify(data)}`);
        return NextResponse.json(
          { error: `No result in RPC response` },
          { status: 502 }
        );
      }
      
      // Convert the balance from hex to decimal
      const balanceHex = data.result;
      const balanceWei = parseInt(balanceHex, 16);
      const balanceEther = balanceWei / 1e18;
      
      console.log(`Balance for ${address}: ${balanceEther} ETH (${balanceWei} wei)`);
      
      return NextResponse.json({
        balance: balanceEther,
        balanceWei: balanceWei,
        network: network
      });
    } catch (fetchError) {
      console.error(`Fetch error: ${fetchError}`);
      return NextResponse.json(
        { error: `Failed to fetch from RPC endpoint: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}` },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Error in RPC proxy:', error);
    return NextResponse.json(
      { error: `Failed to fetch balance: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
