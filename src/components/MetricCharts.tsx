import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

interface MetricChartProps {
  data: any[];
  title: string;
  type: 'bar' | 'line' | 'radar';
}

export function MetricChart({ data, title, type }: MetricChartProps) {
  // Animate values up from 0 on load
  const [chartData, setChartData] = useState<any[]>(() => 
    data.map(item => {
      const copy = { ...item };
      if ('value' in copy) copy.value = 0;
      if ('A' in copy) copy.A = 0;
      return copy;
    })
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setChartData(data);
    }, 150);
    return () => clearTimeout(timer);
  }, [data]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-[#1a1c1e] border border-white/5 rounded-xl p-8 shadow-2xl animate-in duration-500"
    >
      <h3 className="text-sm font-medium text-white/60 uppercase tracking-widest mb-8 font-mono">
        {title}
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#141517', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar 
                dataKey="value" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]} 
                isAnimationActive={true}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            </BarChart>
          ) : type === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} />
              <YAxis stroke="#ffffff40" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#141517', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={{ fill: '#3b82f6' }} 
                isAnimationActive={true}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            </LineChart>
          ) : (
             <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid stroke="#ffffff10" />
              <PolarAngleAxis dataKey="subject" stroke="#ffffff40" fontSize={10} />
              <PolarRadiusAxis stroke="#ffffff10" fontSize={10} />
              <Radar
                name="Performance"
                dataKey="A"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
                isAnimationActive={true}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            </RadarChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
