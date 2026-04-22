// src/components/RiskAnalyzer.tsx
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xYourDeployedAddress";
const ABI = ["function calculateScore(...)"];

export const analyzeVoyage = async (voyageData: any) => {
  // 1. Connect to user's wallet (e.g., MetaMask/Talisman)
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  // 2. Connect to the PVM Contract
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  try {
    // 3. Call the high-performance Rust logic on-chain
    const score = await contract.calculateScore(voyageData);
    return score;
  } catch (error) {
    console.error("Scoring failed:", error);
  }
};