import React from 'react';
import { Plus, Edit2, Trash2, FileText } from 'lucide-react';
import { Order, Client, OrderItem, Product, TechnicalSpec } from '../../types';

interface SalesTabProps {
  orders: Order[];
  clients: Client[];
  orderItems: OrderItem[];
  products: Product[];
  techSpecs: TechnicalSpec[];
  orderTotals: Record<string, number>;
  searchTerm: string;
  selectedOrderId: string | null;
  onSelectOrder: (id: string | null) => void;
  onCopy: (id: string) => void;
  onEdit: (o: Order) => void;
  onDelete: (id: string) => void;
  onGeneratePDF: (id: string) => void;
}

export const SalesTab = React.memo(({ 
  orders, 
  clients, 
  orderItems, 
  products, 
  techSpecs, 
  orderTotals, 
  searchTerm, 
  selectedOrderId,
  onSelectOrder,
  onCopy, 
  onEdit, 
  onDelete,
  onGeneratePDF
}: SalesTabProps) => {
  const filteredOrders = orders.filter(o => {
    const client = clients.find(c => c.id === o.clientId);
    return (client?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const pMap = React.useMemo(() => new Map(products.map(p => [p.id, p])), [products]);
  const sMap = React.useMemo(() => new Map(techSpecs.map(s => [s.size, s])), [techSpecs]);
  const oiGroup = React.useMemo(() => {
    const group: Record<string, OrderItem[]> = {};
    orderItems.forEach(oi => {
      if (!group[oi.orderId]) group[oi.orderId] = [];
      group[oi.orderId].push(oi);
    });
    return group;
  }, [orderItems]);

  return (
    <div className="saas-card overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="px-8 py-5 text-sm font-bold text-text-muted uppercase tracking-wider">Дата</th>
              <th className="px-8 py-5 text-sm font-bold text-text-muted uppercase tracking-wider">Клієнт</th>
              <th className="px-8 py-5 text-sm font-bold text-text-muted uppercase tracking-wider">Сума</th>
              <th className="px-8 py-5 text-sm font-bold text-text-muted uppercase tracking-wider">Гелій</th>
              <th className="px-8 py-5 text-sm font-bold text-text-muted uppercase tracking-wider">Статус</th>
              <th className="px-8 py-5 text-sm font-bold text-text-muted uppercase tracking-wider text-right">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredOrders.map(o => {
              const client = clients.find(c => c.id === o.clientId);
              const items = oiGroup[o.id] || [];
              const helium = items.reduce((acc, oi) => {
                const product = pMap.get(oi.productId);
                if (!product?.size) return acc;
                const spec = sMap.get(product.size);
                const volume = spec?.heliumVolume || 0;
                return acc + (volume * (oi.qty + (oi.defect || 0)));
              }, 0);
              
              return (
                <tr key={o.id} className={`hover:bg-background/50 transition-colors cursor-pointer ${selectedOrderId === o.id ? 'bg-primary/5' : ''}`} onClick={() => onSelectOrder(selectedOrderId === o.id ? null : o.id)}>
                  <td className="px-8 py-5 text-text-muted font-medium">{new Date(o.date).toLocaleDateString()}</td>
                  <td className="px-8 py-5 font-bold text-text-main">{client?.name || 'Невідомий'}</td>
                  <td className="px-8 py-5 font-bold text-text-main">{orderTotals[o.id] || 0} ₴</td>
                  <td className="px-8 py-5 font-bold text-indigo-500">{helium.toFixed(2)}</td>
                  <td className="px-8 py-5">
                    <span className={`badge ${o.status === 'Виконано' ? 'badge-success' : o.status === 'Скасовано' ? 'badge-danger' : 'badge-warning'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => onCopy(o.id)} className="p-3 hover:bg-card0/10 rounded-xl transition-colors text-text-muted hover:text-indigo-500" title="Копіювати"><Plus className="w-5 h-5" /></button>
                      <button onClick={() => onEdit(o)} className="p-3 hover:bg-card0/10 rounded-xl transition-colors text-text-muted hover:text-primary"><Edit2 className="w-5 h-5" /></button>
                      <button onClick={() => onDelete(o.id)} className="p-3 hover:bg-rose-500/10 rounded-xl transition-colors text-text-muted hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile List */}
      <div className="md:hidden divide-y divide-border">
        {filteredOrders.map(o => {
          const client = clients.find(c => c.id === o.clientId);
          const total = orderTotals[o.id] || 0;
          const items = oiGroup[o.id] || [];
          
          return (
            <div key={o.id} className={`p-4 flex flex-col gap-3 ${selectedOrderId === o.id ? 'bg-primary/5' : ''}`} onClick={() => onSelectOrder(selectedOrderId === o.id ? null : o.id)}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{new Date(o.date).toLocaleDateString()}</span>
                <span className={`badge ${o.status === 'Виконано' ? 'badge-success' : o.status === 'Скасовано' ? 'badge-danger' : 'badge-warning'}`}>
                  {o.status}
                </span>
              </div>
              <div className="flex flex-col">
                <div className="text-base font-black text-text-main">{client?.name || 'Невідомий'}</div>
                <div className="flex items-center gap-4 mt-1">
                  <div className="text-sm font-bold text-primary">{total} ₴</div>
                  <div className="text-[11px] text-text-muted">Позицій: {items.length}</div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-border pt-3 mt-1" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => onCopy(o.id)} className="flex-1 flex items-center justify-center gap-2 p-3 bg-card0/5 rounded-xl text-text-muted font-bold text-xs">
                  <Plus className="w-4 h-4" /> Копія
                </button>
                <button onClick={() => onEdit(o)} className="flex-1 flex items-center justify-center gap-2 p-3 bg-primary/5 rounded-xl text-primary font-bold text-xs">
                  <Edit2 className="w-4 h-4" /> Редагувати
                </button>
                <button onClick={() => onDelete(o.id)} className="p-3 bg-rose-500/5 rounded-xl text-rose-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
