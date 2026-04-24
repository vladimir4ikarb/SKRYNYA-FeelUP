import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend: string;
  up: boolean;
  isLarge?: boolean;
}

export const StatCard = React.memo(({ label, value, icon: Icon, color, trend, up, isLarge }: StatCardProps) => (
 <div className={`stat-card stat-card-profit group ${isLarge ? 'p-5 lg:p-6' : 'p-3 lg:p-4'}`}>
    <div className="flex items-center justify-between mb-2">
      <div className={`${color} ${isLarge ? 'w-10 h-10 lg:w-12 lg:h-12' : 'w-8 h-8 lg:w-10 lg:h-10'} rounded-xl flex items-center justify-center text-white shadow-lg shadow-current/20`}>
        <Icon className={isLarge ? "w-5 h-5 lg:w-6 lg:h-6" : "w-4 h-4 lg:w-5 lg:h-5"} />
      </div>
      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] lg:text-xs font-semibold ${up ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
        {trend}
      </div>
    </div>
    <p className={`text-text-muted font-bold ${isLarge ? 'text-[10px] lg:text-xs' : 'text-[9px] lg:text-[10px]'} uppercase tracking-wider mb-0.5`}>{label}</p>
   <h3 className={`${isLarge ? 'text-xl lg:text-2xl' : 'text-base lg:text-lg'} font-semibold text-text-main leading-none tracking-tight`}>{value}</h3>
  </div>
));
