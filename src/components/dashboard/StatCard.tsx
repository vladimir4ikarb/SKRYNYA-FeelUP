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
  <div className={`saas-card transition-all duration-300 group ${isLarge ? 'p-6 lg:p-7' : 'p-4 lg:p-5'}`}>
    <div className="flex items-center justify-between mb-5">
      <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center ${color.replace('bg-', 'bg-opacity-10 ')} ${color.replace('bg-', 'text-')} group-hover:scale-110 transition-all duration-500`}>
        <Icon className={isLarge ? "w-6 h-6 lg:w-7 lg:h-7" : "w-5 h-5 lg:w-6 lg:h-6"} />
      </div>
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] lg:text-xs font-black uppercase tracking-wider ${up ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
        {up ? '↑' : '↓'} {trend}
      </div>
    </div>
    <div>
      <p className="text-caption mb-1">{label}</p>
      <h3 className={`${isLarge ? 'text-2xl lg:text-3xl' : 'text-xl lg:text-2xl'} font-black text-text-main leading-tight tracking-tight`}>
        {value}
      </h3>
    </div>
  </div>
));
