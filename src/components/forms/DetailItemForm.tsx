import React from 'react';
import { Product, OrderItem } from '../../types';

interface DetailItemFormProps {
  itemModalType: 'order' | 'purchase';
  products: Product[];
  orderItems: OrderItem[];
  selectedOrderId: string | null;
}

export const DetailItemForm = ({
  itemModalType,
  products,
  orderItems,
  selectedOrderId
}: DetailItemFormProps) => {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="col-span-2">
        <label className="text-sm font-bold text-slate-500 block mb-3">Товар</label>
        <select name="productId" required className="input-field">
          <option value="">Оберіть товар</option>
          {products.filter(p => !p.isArchived || (itemModalType === 'order' && orderItems.some(oi => oi.productId === p.id && oi.orderId === selectedOrderId))).map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.size}) {p.isArchived ? '[АРХІВ]' : ''}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-bold text-slate-500 block mb-3">Кількість</label>
        <input name="qty" type="number" required min={1} className="input-field" />
      </div>
      <div>
        <label className="text-sm font-bold text-slate-500 block mb-3">Ціна (фіксується)</label>
        <input name="price" type="number" required min={0} className="input-field" />
      </div>
      {itemModalType === 'order' && (
        <div>
          <label className="text-sm font-bold text-slate-500 block mb-3">Брак</label>
          <input name="defect" type="number" defaultValue={0} min={0} className="input-field" />
        </div>
      )}
    </div>
  );
};
