import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TelemetryData } from '../services/api';

interface ChartProps {
  data: TelemetryData[];
}

const TelemetryChart = ({ data }: ChartProps) => {
  if (data.length === 0) {
    return <div className="flex items-center justify-center h-full text-slate-500 italic">No telemetry data available for this vessel.</div>;
  }

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          {/* ... existing Gradient Defs, XAxis, YAxis, and Areas from the previous step ... */}
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
          <Legend verticalAlign="top" height={36} />
          <Area name="PVM Risk Score" type="monotone" dataKey="risk" stroke="#ef4444" fill="url(#colorRisk)" />
          <Area name="Wind Speed (kn)" type="monotone" dataKey="wind" stroke="#3b82f6" fill="url(#colorWind)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TelemetryChart;