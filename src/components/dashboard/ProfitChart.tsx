import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface ProfitChartProps {
  data: any[];
}

export const ProfitChart = React.memo(({ data }: ProfitChartProps) => {
  React.useEffect(() => {
    // Trigger a window resize event to force Recharts to recalculate dimensions
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="card-base card-chart p-6 h-full flex flex-col min-h-[350px]">
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-text-main">Приріст прибутку</h3>
      <p className="text-text-muted text-xs">За останній тиждень</p>
    </div>
    <div className="h-[300px] lg:h-[350px] w-full relative">
      <ResponsiveContainer width="100%" height="100%" debounce={1} minWidth={0}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border opacity-30" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 10 }} dy={10} className="text-text-muted" />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 10 }} className="text-text-muted" />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '10px' }}
            itemStyle={{ color: '#818CF8' }}
          />
          <Area type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);
});
