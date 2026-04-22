import { triggerMockRiskEvent } from './mockAisGenerator';

/**
 * Orchestrates the "Perfect State" for a video presentation.
 * Pre-loads 5 historical data points and sets the app to Simulation Mode.
 */
export const runOneClickDemo = (
  setMode: (sim: boolean) => void,
  setEvents: (events: any[]) => void,
  setTelemetryData: (data: any[]) => void,
  vesselAddress: string
) => {
  console.log("🎬 Initializing One-Click Demo Mode...");

  // 1. Switch to Simulation Mode immediately
  setMode(true);

  // 2. Generate 5 historical data points to fill the chart and log
  const historicalEvents: any[] = [];
  const chartData: any[] = [];

  for (let i = 0; i < 5; i++) {
    const timeOffset = (5 - i) * 15; // 15-minute intervals
    const timeLabel = new Date(Date.now() - timeOffset * 60000).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Create a mock event
    const mock = triggerMockRiskEvent(vesselAddress, () => {});
    
    historicalEvents.unshift({
      id: `demo-${i}`,
      vessel: vesselAddress,
      score: Math.min(100, Math.floor((Math.random() * 40) + 20)),
      timestamp: timeLabel,
      txHash: `0x_demo_tx_${i}`
    });

    chartData.push({
      time: timeLabel,
      wind: Math.floor(Math.random() * 20) + 10,
      risk: historicalEvents[0].score
    });
  }

  // 3. Update states simultaneously for a "Populated" look
  setEvents(historicalEvents);
  setTelemetryData(chartData);

  console.log("✅ Demo State Ready.");
};