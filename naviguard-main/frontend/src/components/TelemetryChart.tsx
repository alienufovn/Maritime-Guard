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
          <defs>
            <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorWind" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }} />
          <YAxis stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
            itemStyle={{ fontSize: '12px' }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-2xl">
                    <p className="text-slate-400 text-xs font-bold mb-2 uppercase tracking-widest">{label}</p>
                    <div className="space-y-1">
                      <p className="text-red-400 text-sm">
                        <span className="opacity-70">Risk Score:</span> <span className="font-bold">{payload[0].value}</span>
                      </p>
                      <p className="text-blue-400 text-sm">
                        <span className="opacity-70">Wind Speed:</span> <span className="font-bold">{payload[1]?.value} kn</span>
                      </p>
                      {payload[0].payload.wave !== undefined && (
                        <p className="text-emerald-400 text-sm">
                          <span className="opacity-70">Wave Height:</span> <span className="font-bold">{payload[0].payload.wave} m</span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle"
            wrapperStyle={{ paddingBottom: '20px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          />
          <Area 
            name="PVM Risk Score" 
            type="monotone" 
            dataKey="risk" 
            stroke="#ef4444" 
            fillOpacity={1}
            fill="url(#colorRisk)" 
          />
          <Area 
            name="Wind Speed (kn)" 
            type="monotone" 
            dataKey="wind" 
            stroke="#3b82f6" 
            fillOpacity={1}
            fill="url(#colorWind)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TelemetryChart;