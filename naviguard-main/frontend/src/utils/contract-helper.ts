import { ethers } from 'ethers';

// This ABI must match the functions defined in your Rust/PVM contract
const CONTRACT_ABI = [
  "function calculateScore(bytes telemetry) public returns (uint32)",
  "function getLatestScore(address vessel) public view returns (uint32)",
  "event RiskScoreUpdated(address indexed vessel, uint32 score)"
];
const naviContract = new NaviGuardContract(
  import.meta.env.VITE_CONTRACT_ADDRESS, 
  signer
);

export class NaviGuardContract {
  private contract: ethers.Contract;
  private signer: ethers.Signer;

  constructor(contractAddress: string, signer: ethers.Signer) {
    this.signer = signer;
    this.contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
  }

  /**
   * Sends maritime telemetry to the PVM Risk Engine.
   * @param telemetryHex - Hex-encoded string (e.g., from ethers.hexlify)
   */
  async submitRiskAnalysis(telemetryHex: string) {
    try {
      console.log("🚢 Sending telemetry to PVM...");
      
      // We use a manual gasLimit because pallet-revive/PVM 
      // estimation can be tricky for complex RISC-V compute.
      const tx = await this.contract.calculateScore(telemetryHex, {
        gasLimit: 800000 
      });

      const receipt = await tx.wait();
      console.log("✅ PVM Execution Successful:", receipt.hash);
      return receipt;
    } catch (error) {
      console.error("❌ PVM Transaction Failed:", error);
      throw error;
    }
  }

  /**
   * Read-only call to get the current risk score from the ledger.
   */
  async getVesselScore(vesselAddress: string): Promise<number> {
    try {
      const score = await this.contract.getLatestScore(vesselAddress);
      return Number(score);
    } catch (error) {
      console.error("❌ Error fetching score:", error);
      return 0;
    }
  }
}