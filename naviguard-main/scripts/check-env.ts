import { ethers } from 'ethers';

async function verifyNetwork() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const network = await provider.getNetwork();
    console.log(`✅ Connected to Network: ${network.name} (Chain ID: ${network.chainId})`);
  } catch (error) {
    console.error(`❌ Could not connect to RPC_URL: ${process.env.RPC_URL}`);
    process.exit(1);
  }
}

// Call this inside your checkEnv function