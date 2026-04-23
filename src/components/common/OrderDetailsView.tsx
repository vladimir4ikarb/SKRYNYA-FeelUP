import React from 'react';
import { motion } from 'motion/react';
import { Clock, FileText, Plus, Trash2 } from 'lucide-react';
import { Order, Purchase, OrderItem, PurchaseItem, Product } from '../../types';

interface OrderDetailsViewProps {
  selectedOrderId: string | null;
  selectedPurchaseId: string | null;
  orders: Order[];
  purchases: Purchase[];
  orderItems: OrderItem[];
  purchaseItems: PurchaseItem[];
  products: Product[];
  onGeneratePDF: (id: string) => void;
  onAddItem: () => void;
  onDeleteItem: (item: any, type: 'order' | 'purchase') => void;
}

export const OrderDetailsView = ({
  selectedOrderId,
  selectedPurchaseId,
  orders,
  purchases,
  orderItems,
  purchaseItems,
  products,
  onGeneratePDF,
  onAddItem,
  onDeleteItem
}: OrderDetailsViewProps) => {
  if (!selectedOrderId && !selectedPurchaseId) return null;

  const order = selectedOrderId ? orders.find(o => o.id === selectedOrderId) : null;
  const purchase = selectedPurchaseId ? purchases.find(p => p.id === selectedPurchaseId) : null;
  const isCompleted = (order?.status === 'Виконано') || (purchase?.status === 'Оплачено');

  const items = selectedOrderId 
    ? orderItems.filter(oi => oi.orderId === selectedOrderId)
    : purchaseItems.filter(pi => pi.purchaseId === selectedPurchaseId);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="saas-card p-4 lg:p-8 mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h3 className="text-lg lg:text-xl font-bold text-text-main flex items-center gap-2">
            {selectedOrderId ? 'Позиції замовлення' : 'Позиції закупівлі'}
            {isCompleted && <Clock className="w-5 h-5 text-amber-500" />}
          </h3>
          {selectedOrderId && (
            <button 
              onClick={() => onGeneratePDF(selectedOrderId)}
              className="flex items-center justify-center gap-2 text-primary font-black text-xs bg-primary/10 px-4 py-2 rounded-xl transition-all w-full sm:w-auto uppercase tracking-wider"
            >
              <FileText className="w-4 h-4" /> Чек (PDF)
            </button>
          )}
        </div>
        {!isCompleted && (
          <button onClick={onAddItem} className="btn-primary flex items-center justify-center gap-2 py-2.5 px-6 text-xs font-bold w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Додати позицію
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-background/50">
              <th className="px-4 lg:px-8 py-4 text-[10px] lg:text-xs font-black text-text-muted uppercase tracking-widest leading-none">Товар</th>
              <th className="px-4 lg:px-8 py-4 text-[10px] lg:text-xs font-black text-text-muted uppercase tracking-widest leading-none">Кіл-ть</th>
              <th className="px-4 lg:px-8 py-4 text-[10px] lg:text-xs font-black text-text-muted uppercase tracking-widest leading-none text-right">Сума</th>
              <th className="px-4 lg:px-8 py-4 text-[10px] lg:text-xs font-black text-text-muted uppercase tracking-widest leading-none text-right">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map(item => {
              const product = products.find(p => p.id === item.productId);
              const unitPrice = (item as any).costPrice ?? item.price ?? 0;
              return (
                <tr key={item.id} className="hover:bg-background/30 transition-colors">
                  <td className="px-4 lg:px-8 py-4">
                    <p className="font-bold text-text-main text-sm lg:text-base leading-tight break-words max-w-[120px] lg:max-w-none">{product?.name || 'Невідомий'}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">{unitPrice} ₴ / шт</p>
                  </td>
                  <td className="px-4 lg:px-8 py-4 font-black text-text-muted text-sm">{item.qty}</td>
                  <td className="px-4 lg:px-8 py-4 font-black text-text-main text-sm lg:text-base text-right">{item.qty * unitPrice} ₴</td>
                  <td className="px-4 lg:px-8 py-4 text-right">
                    {!isCompleted && (
                      <button onClick={() => onDeleteItem(item, selectedOrderId ? 'order' : 'purchase')} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
