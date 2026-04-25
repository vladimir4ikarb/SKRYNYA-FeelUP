import React from 'react';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';

interface HeliumTankCardProps {
  balance: number;
  capacity?: number;
  onCalibrate: () => void;
}

export const HeliumTankCard = React.memo(({ balance, capacity = 6.0, onCalibrate }: HeliumTankCardProps) => (
  <div className="card-base card-helium p-3 lg:p-4 cursor-pointer group flex flex-col justify-center" onClick={onCalibrate}>
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-600 shrink-0">
          <Zap className="w-4 h-4" />
        </div>

        <div>
          <p className="text-[9px] font-semibold text-text-muted uppercase tracking-widest leading-none mb-1">
            Балон 40л
          </p>

          <p className={`text-base lg:text-lg font-semibold leading-none ${balance < 1 ? 'text-rose-500' : 'text-text-main'}`}>
            {balance.toFixed(1)}{' '}
            <span className="text-[10px] font-normal text-text-muted tracking-normal">м³</span>
          </p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-end justify-center">
        <div className="relative w-full h-8 flex items-center">
          <div className="relative w-full h-7 flex items-center">
            <div className="relative flex-1 h-full bg-card/60 rounded-full border border-border overflow-hidden shadow-inner z-10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (balance / capacity) * 100)}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-600 to-cyan-400"
              />
            </div>

            <div className="flex flex-col justify-center -ml-[1px] z-0">
              <div className="w-1.5 h-4 bg-sidebar/10 border-y border-r border-border rounded-r-sm"></div>
              <div className="w-1 h-2 -ml-[6px] absolute right-[-8px] bg-text-muted/30 rounded-r-sm border border-border shadow-sm"></div>
            </div>
          </div>
        </div>

        <p className="text-[9px] text-text-muted font-semibold whitespace-nowrap mt-1">
          {((balance / capacity) * 100).toFixed(0)}% залишок
        </p>
      </div>
    </div>
  </div>
));