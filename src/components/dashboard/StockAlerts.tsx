import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Product } from '../../types';

interface StockAlertsProps {
  alerts: Product[];
  inventory: Record<string, number>;
}

export const StockAlerts = React.memo(({ alerts, inventory }: StockAlertsProps) => (
  <div className="saas-card hover-depth p-6 flex flex-col">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold text-text-main flex items-center gap-2">
        <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
        Критичні залишки
      </h3>
      <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded-full text-[10px] font-semibold">
        {alerts.length}
      </span>
    </div>
    
    <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center text-text-muted opacity-40">
          <CheckCircle2 className="w-8 h-8 mb-2" />
          <p className="text-[10px] italic">Все в наявності</p>
        </div>
      ) : alerts.map(product => (
        <div 
          key={product.id} 
          className="p-3 bg-background/60 border border-border rounded-xl flex items-center justify-between group transition-all duration-200 hover:bg-rose-500/5 hover:border-rose-500/20 hover:scale-[1.02]"
        >
          <div className="overflow-hidden">
            <p className="text-[11px] font-semibold text-text-main truncate">
              {product.name}
            </p>
            <p className="text-[9px] text-text-muted">
              {product.size} {product.color}
            </p>
          </div>

          <div className="text-right shrink-0 ml-3">
            <p className="text-xs font-semibold text-rose-500">
              {inventory[product.id] || 0}
            </p>
            <p className="text-[8px] text-text-muted uppercase">шт</p>
          </div>
        </div>
      ))}
    </div>
  </div>
));