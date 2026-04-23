import React from 'react';
import { Order, Client } from '../../types';

interface RecentOrdersProps {
  orders: Order[];
  clients: Client[];
  orderTotals: Record<string, number>;
  onViewAll: () => void;
}

export const RecentOrders = React.memo(({ orders, clients, orderTotals, onViewAll }: RecentOrdersProps) => (
  <div className="saas-card hover-depth overflow-hidden h-auto lg:h-[380px] flex flex-col">
    <div className="p-4 lg:p-5 border-b border-border flex items-center justify-between bg-card/50">
      <h3 className="text-base lg:text-lg font-semibold text-text-main">Останні замовлення</h3>
      <button onClick={onViewAll} className="text-primary font-semibold hover:underline text-xs bg-primary/10 px-3 py-1 rounded-lg transition-all">
        Всі
      </button>
    </div>

    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="divide-y divide-border">
        {orders.slice(0, 10).map((order) => (
          <div
            key={order.id}
            className="p-4 lg:px-5 lg:py-3 hover:bg-background/50 transition-all duration-200 flex items-center justify-between gap-4"
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-text-main text-sm">#{order.id.slice(-4)}</p>
              <p className="text-[11px] text-text-muted truncate font-medium">
                {clients.find(c => c.id === order.clientId)?.name || 'Невідомий'}
              </p>
            </div>

            <div className="text-right shrink-0">
              <p className="font-semibold text-text-main text-sm">{orderTotals[order.id] || 0} ₴</p>

              <span
                className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-tight mt-1 ${
                  order.status === 'Виконано'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : order.status === 'Скасовано'
                    ? 'bg-rose-500/10 text-rose-500'
                    : 'bg-amber-500/10 text-amber-500'
                }`}
              >
                {order.status}
              </span>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="px-5 py-20 text-center text-text-muted italic text-sm">
            Замовлень поки немає
          </div>
        )}
      </div>
    </div>
  </div>
));