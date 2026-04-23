import React from 'react';
import { motion } from 'motion/react';
import { Zap, Settings2 } from 'lucide-react';

interface HeliumTankCardProps {
  balance: number;
  capacity?: number;
  onCalibrate: () => void;
}

export const HeliumTankCard = React.memo(({ balance, capacity = 6.0, onCalibrate }: HeliumTankCardProps) => {
  const percentage = Math.min(100, Math.max(0, (balance / capacity) * 100));
  const isLow = balance < 1.0;

  return (
    <div 
      className="saas-card p-6 cursor-pointer group flex flex-col h-full min-h-[180px] justify-between relative overflow-hidden" 
      onClick={onCalibrate}
    >
      {/* Background Decorative Element */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 blur-3xl rounded-full opacity-20 transition-colors duration-500 ${isLow ? 'bg-rose-500' : 'bg-cyan-500'}`} />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl transition-colors ${isLow ? 'bg-rose-500/10 text-rose-500' : 'bg-cyan-500/10 text-cyan-500'}`}>
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-caption">Гелій (40л)</h3>
        </div>
        <Settings2 className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
      </div>

      <div className="relative z-10">
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className={`text-3xl font-black tracking-tighter ${isLow ? 'text-rose-500' : 'text-text-main'}`}>
              {balance.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-slate-400 ml-1.5 uppercase">м³</span>
          </div>
          <span className={`text-xs font-black ${isLow ? 'text-rose-500' : 'text-cyan-600'}`}>
            {percentage.toFixed(0)}%
          </span>
        </div>

        <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className={`absolute inset-y-0 left-0 ${isLow ? 'bg-rose-500' : 'bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]'}`}
          />
        </div>
      </div>
    </div>
  );
});
