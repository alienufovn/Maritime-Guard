import { ethers } from 'ethers';

interface MockAisData {
  vessel: string;
  windSpeed: number;
  waveHeight: number;
  lat: number;
  lng: number;
}

/**
 * Generates realistic maritime telemetry for testing.
 */
export const generateMockAisData = (vesselAddress: string): MockAisData => {
  return {
    vessel: vesselAddress,
    // Simulate a storm brewing (higher ranges)
    windSpeed: Math.floor(Math.random() * 45) + 5, // 5-50 knots
    waveHeight: parseFloat((Math.random() * 6).toFixed(1)), // 0-6 meters
    lat: 51.5074 + (Math.random() - 0.5) * 2, // General North Sea area
    lng: 0.1278 + (Math.random() - 0.5) * 2,
  };
};

/**
 * Manually dispatches a "Mock" event to the UI.
 * This simulates the Indexer/Asset Hub sending data back to the dashboard.
 */
export const triggerMockRiskEvent = (vesselAddress: string, onEvent: (data: any) => void) => {
  const data = generateMockAisData(vesselAddress);
  
  // Calculate a mock score based on the random data
  // Similar logic to what your PVM Risk Engine does in Rust
  const mockScore = Math.min(100, Math.floor((data.windSpeed * 1.5) + (data.waveHeight * 10)));

  const mockEvent = {
    vessel: vesselAddress,
    score: mockScore,
    event: {
      log: {
        transactionHash: `0x_mock_${Math.random().toString(36).substring(7)}`,
        index: Math.floor(Math.random() * 100)
      }
    }
  };

  // Simulate network latency (500ms - 1500ms)
  setTimeout(() => {
    onEvent(mockEvent);
  }, 500 + Math.random() * 1000);

  return data;
};