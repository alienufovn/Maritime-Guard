export interface BenchmarkTask {
  id: string;
  category: 'Pattern Recognition' | 'Threat Assessment' | 'Anomaly Detection' | 'Route Analysis';
  name: string;
  description: string;
  datasetSize: number;
}

export interface ModelPerformance {
  modelName: string;
  accuracy: number;
  latency: number;
  reasoningScore: number;
  safetyCompliance: number;
  taskResults: {
    taskId: string;
    score: number;
    responseTime: number;
  }[];
}

export interface BenchmarkResult {
  id: string;
  timestamp: string;
  taskType: string;
  models: ModelPerformance[];
}

export const TASKS: BenchmarkTask[] = [
  {
    id: 't1',
    category: 'Anomaly Detection',
    name: 'Unusual AIS Patterns',
    description: 'Identifying vessels with irregular AIS transmission cycles or speed anomalies.',
    datasetSize: 450,
  },
  {
    id: 't2',
    category: 'Threat Assessment',
    name: 'Border Proximity Warning',
    description: 'Evaluating risk levels for vessels approaching restricted maritime zones.',
    datasetSize: 320,
  },
  {
    id: 't3',
    category: 'Pattern Recognition',
    name: 'Dark Ship Detection',
    description: 'Correlating satellite imagery with reported positions to identify non-transmitting vessels.',
    datasetSize: 600,
  },
  {
    id: 't4',
    category: 'Route Analysis',
    name: 'Strategic Chokepoint Risk',
    description: 'Predicting potential congestion or security bottlenecks in narrow straits.',
    datasetSize: 280,
  },
];
