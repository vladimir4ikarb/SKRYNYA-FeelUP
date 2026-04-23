import React from 'react';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';

interface HeliumTankCardProps {
  balance: number;
  capacity?: number;
  onCalibrate: () => void;
}

export const HeliumTankCard = React.memo(({ balance, capacity = 6.0, onCalibrate }: HeliumTankCardProps) => (
  <div className="saas-card p-3 lg:p-4 cursor-pointer hover:border-primary transition-all group flex flex-col justify-center" onClick={onCalibrate}>
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-cyan-50 rounded-xl text-cyan-600 shrink-0">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Балон 40л</p>
          <p className={`text-base lg:text-lg font-black leading-none ${balance < 1 ? 'text-rose-500' : 'text-slate-900'}`}>
            {balance.toFixed(1)} <span className="text-[10px] font-normal text-slate-400 tracking-normal">м³</span>
          </p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col gap-1 items-end">
        <div className="relative w-full h-4 flex items-center">
          <div className="relative w-full h-3 flex items-center">
            <div className="relative flex-1 h-full bg-slate-100 rounded-full border border-slate-200 overflow-hidden shadow-inner z-10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (balance / capacity) * 100)}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-600 to-cyan-400"
              />
            </div>
            <div className="flex items-center -ml-[1px] z-0">
              <div className="w-1 h-2 bg-slate-300 border-y border-r border-slate-400"></div>
              <div className="w-2 h-3 bg-slate-400 rounded-r-sm border border-slate-500 shadow-sm"></div>
            </div>
          </div>
        </div>
        <p className="text-[9px] text-slate-400 font-bold whitespace-nowrap">{((balance / capacity) * 100).toFixed(0)}% залишок</p>
      </div>
    </div>
  </div>
));
