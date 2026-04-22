import { fetchVoyageHistory, TelemetryData } from './services/api';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const [history, setHistory] = useState<TelemetryData[]>([]);
  const [account, setAccount] = useState<string | null>(null);

  // Fetch data from MongoDB whenever the account changes
  useEffect(() => {
    if (account) {
      loadHistory();
    }
  }, [account]);

  const loadHistory = async () => {
    if (!account) return;
    const data = await fetchVoyageHistory(account);
    setHistory(data);
  };

  // Inside your render:
  <div className="flex-grow">
    <TelemetryChart data={history} />
  </div>
}

export interface TelemetryData {
  time: string;
  wind: number;
  waves: number;
  risk: number;
}

export const fetchVoyageHistory = async (vesselId: string): Promise<TelemetryData[]> => {
  try {
    // This calls your backend which queries MongoDB Atlas Search
    const response = await axios.get(`${API_BASE_URL}/api/telemetry/${vesselId}`);
    
    // Formatting for Recharts: Ensure MongoDB timestamps are readable strings
    return response.data.map((item: any) => ({
      time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      wind: item.windSpeed,
      waves: item.waveHeight,
      risk: item.riskScore
    }));
  } catch (error) {
    console.error("Error fetching MongoDB telemetry:", error);
    return [];
  }
};