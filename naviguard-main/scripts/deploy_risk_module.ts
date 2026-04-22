import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  const binaryPath = path.join(__dirname, '../assets/risk_engine.polkavm');
  const abiPath = path.join(__dirname, '../assets/pvm-output/Escrow.abi');

  const pvmBinary = fs.readFileSync(binaryPath);
  const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

  const factory = new ethers.ContractFactory(abi, pvmBinary, wallet);

  console.log("📡 Uploading PVM binary to Asset Hub...");
  const contract = await factory.deploy({ gasLimit: 2000000 });
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log(`✅ Contract Deployed at: ${address}`);

  // --- START VERIFICATION STEP ---
  console.log("🔍 Running Post-Deployment Verification...");

  try {
    // 1. Check if Code Exists at Address
    // On pallet-revive, this confirms the PVM binary is properly stored
    const code = await provider.getCode(address);
    if (code === '0x' || code === '0x0') {
      throw new Error("Verification Failed: No bytecode found at the deployed address.");
    }
    console.log(`  ✔ Bytecode Verified (${(code.length / 2).toLocaleString()} bytes)`);

    // 2. Test Contract Interaction (Read Call)
    // We call a simple view function like 'getLatestScore' to ensure the PVM is responsive
    console.log("  📡 Testing PVM responsiveness...");
    const testContract = new ethers.Contract(address, abi, provider);
    
    // We use a zero-address as a test parameter
    const initialScore = await testContract.getLatestScore(ethers.ZeroAddress);
    console.log(`  ✔ PVM Interaction Verified. Initial Score: ${initialScore}`);

    console.log("\n🚀 ALL SYSTEMS GO: Contract is live and reachable.");
  } catch (error: any) {
    console.error(`\n❌ VERIFICATION FAILED: ${error.message}`);
    console.log("Check if the PVM binary is compatible with the current pallet-revive version.");
    process.exit(1);
  }
  // --- END VERIFICATION STEP ---

  console.log(`\n📝 Update your .env: CONTRACT_ADDRESS=${address}`);
}

main().catch(console.error);