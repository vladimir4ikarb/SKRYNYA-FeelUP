import React from 'react';
import { Order, Client } from '../../types';

interface RecentOrdersProps {
  orders: Order[];
  clients: Client[];
  orderTotals: Record<string, number>;
  onViewAll: () => void;
}

export const RecentOrders = React.memo(({ orders, clients, orderTotals, onViewAll }: RecentOrdersProps) => (
  <div className="saas-card overflow-hidden flex flex-col h-full min-h-[420px]">
    <div className="p-6 lg:p-8 border-b border-slate-100 flex items-center justify-between">
      <div>
        <p className="text-caption mb-0.5">Операційна діяльність</p>
        <h3 className="text-xl font-black text-text-main tracking-tight">Останні замовлення</h3>
      </div>
      <button 
        onClick={onViewAll} 
        className="px-4 py-2 bg-violet-soft text-violet-electric font-black hover:bg-violet-electric hover:text-white rounded-xl transition-all text-xs uppercase tracking-widest"
      >
        Всі
      </button>
    </div>
    <div className="flex-1 overflow-y-auto no-scrollbar">
      <div className="divide-y divide-slate-50">
        {orders.slice(0, 10).map((order) => (
          <div key={order.id} className="px-6 lg:px-8 py-5 hover:bg-ice-white transition-all flex items-center justify-between gap-6 group">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-electric/40 group-hover:bg-violet-electric transition-colors"></span>
                <p className="font-bold text-text-main text-sm tracking-tight">#{order.id.slice(-6).toUpperCase()}</p>
              </div>
              <p className="text-[12px] text-slate-500 truncate font-semibold">
                {clients.find(c => c.id === order.clientId)?.name || 'Гість'}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-black text-text-main text-base mb-1.5">{orderTotals[order.id]?.toLocaleString() || 0} ₴</p>
              <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                order.status === 'Виконано' ? 'bg-emerald-500/10 text-emerald-600' : 
                order.status === 'Скасовано' ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'
              }`}>
                {order.status}
              </span>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="px-8 py-24 text-center">
            <p className="text-sm font-bold text-slate-400">Замовлень поки немає</p>
          </div>
        )}
      </div>
    </div>
  </div>
));
