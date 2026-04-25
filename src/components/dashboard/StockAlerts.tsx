import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Product } from '../../types';

interface StockAlertsProps {
  alerts: Product[];
  inventory: Record<string, number>;
}

export const StockAlerts = React.memo(({ alerts, inventory }: StockAlertsProps) => (
  <div className="card-base card-alert p-6 flex flex-col h-[320px]">
    <div className="flex items-center justify-between mb-4 flex-shrink-0">
      <h3 className="text-sm font-semibold text-text-main flex items-center gap-2">
        <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
        Критичні залишки
      </h3>
      <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded-full text-[10px] font-semibold">
        {alerts.length}
      </span>
    </div>
    
    <div className="flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar space-y-2">
      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center text-text-muted opacity-40">
          <CheckCircle2 className="w-10 h-10 mb-3" />
          <p className="text-[12px] font-medium italic">Все в наявності</p>
        </div>
      ) : alerts.map(product => (
        <div 
          key={product.id} 
          className="p-3 bg-background/60 border border-border rounded-xl flex items-center justify-between group transition-all duration-200 hover:bg-rose-500/5 hover:border-rose-500/20 hover:scale-[1.01]"
        >
          <div className="min-w-0 flex-1 mr-3">
            <p className="text-[11px] font-bold text-text-main truncate" title={product.name}>
              {product.name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {product.sku && (
                <span className="text-[8px] font-mono font-black text-primary px-1 bg-primary/5 rounded border border-primary/10">
                  {product.sku}
                </span>
              )}
              <p className="text-[9px] text-text-muted font-medium truncate">
                {product.size} | {product.color}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-sm font-black text-rose-500 leading-none">
              {inventory[product.id] || 0}
            </p>
            <p className="text-[8px] text-text-muted uppercase font-bold tracking-tighter">шт</p>
          </div>
        </div>
      ))}
    </div>
  </div>
));