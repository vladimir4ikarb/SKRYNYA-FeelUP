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

export const ProfitChart = React.memo(({ data }: ProfitChartProps) => (
  <div className="saas-card p-8 h-[420px] flex flex-col">
    <div className="mb-8">
      <p className="text-caption mb-1">Фінансова аналітика</p>
      <h3 className="text-2xl font-black text-text-main tracking-tight">Приріст прибутку</h3>
    </div>
    <div className="flex-1 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8A2BE1" stopOpacity={0.2}/>
              <stop offset="100%" stopColor="#8A2BE1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(203, 213, 225, 0.4)" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }} 
            dy={15} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }} 
          />
          <Tooltip 
            cursor={{ stroke: '#8A2BE1', strokeWidth: 1 }}
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              border: '1px solid rgba(226, 232, 240, 0.8)', 
              borderRadius: '16px', 
              boxShadow: '0 10px 25px -5px rgba(31, 30, 46, 0.1)',
              padding: '12px 16px'
            }}
            itemStyle={{ color: '#8A2BE1', fontWeight: 700, fontSize: '13px' }}
            labelStyle={{ color: '#64748B', fontWeight: 600, fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#8A2BE1" 
            strokeWidth={4} 
            fillOpacity={1} 
            fill="url(#colorValue)" 
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
));
