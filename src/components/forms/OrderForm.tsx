import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Order, Client, Product, OrderItem } from '../../types';

interface OrderFormProps {
  editingItem: Order | null;
  clients: Client[];
  products: Product[];
  draftOrderItems: Omit<OrderItem, 'id' | 'orderId'>[];
  setDraftOrderItems: (items: Omit<OrderItem, 'id' | 'orderId'>[]) => void;
  productSearch: string;
  setProductSearch: (s: string) => void;
}

export const OrderForm = ({
  editingItem,
  clients,
  products,
  draftOrderItems,
  setDraftOrderItems,
  productSearch,
  setProductSearch
}: OrderFormProps) => {
  const draftProductRef = React.useRef<HTMLSelectElement>(null);
  const draftQtyRef = React.useRef<HTMLInputElement>(null);
  const draftDefectRef = React.useRef<HTMLInputElement>(null);
  const draftPriceRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="grid grid-cols-2 gap-8">
      <div>
        <label className="text-sm font-bold text-slate-500 block mb-3">Дата</label>
        <input name="date" type="datetime-local" defaultValue={editingItem?.date || new Date().toISOString().slice(0, 16)} required className="input-field" />
      </div>
      <div>
        <label className="text-sm font-bold text-slate-500 block mb-3">Клієнт</label>
        <select name="clientId" defaultValue={editingItem?.clientId} required className="input-field">
          <option value="">Оберіть клієнта</option>
          {clients.filter(c => !c.isArchived).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm font-bold text-slate-500 block mb-3">Доставка до клієнта</label>
        <input name="deliveryDate" defaultValue={editingItem?.deliveryDate || editingItem?.delivery} maxLength={500} className="input-field" placeholder="Адреса або самовивіз" />
      </div>
      <div>
        <label className="text-sm font-bold text-slate-500 block mb-3">Витрати (таксі/інше), ₴</label>
        <input name="extraCosts" type="number" step="any" defaultValue={editingItem?.extraCosts || 0} className="input-field" />
      </div>
      <div>
        <label className="text-sm font-bold text-slate-500 block mb-3">Менеджер</label>
        <input name="managerId" defaultValue={editingItem?.managerId || editingItem?.manager} maxLength={100} className="input-field" />
      </div>
      <div>
        <label className="text-sm font-bold text-slate-500 block mb-3">Статус</label>
        <select name="status" defaultValue={editingItem?.status || 'Чернетка'} className="input-field">
          <option value="Чернетка">Чернетка</option>
          <option value="В обробці">В обробці</option>
          <option value="Виконано">Виконано</option>
          <option value="Скасовано">Скасовано</option>
        </select>
      </div>
      <div className="col-span-2">
        <label className="text-sm font-bold text-slate-500 block mb-3">Коментар</label>
        <textarea name="comment" defaultValue={editingItem?.comment} maxLength={2000} className="input-field h-24" />
      </div>
      
      {!editingItem && (
        <div className="col-span-2 mt-6 border-t border-slate-100 pt-6">
          <h4 className="font-bold text-slate-900 mb-4">Позиції замовлення</h4>
          
          {draftOrderItems.length > 0 && (
            <div className="mb-6 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100/50">
                  <tr>
                    <th className="px-4 py-2 text-xs font-bold text-slate-500">Товар</th>
                    <th className="px-4 py-2 text-xs font-bold text-slate-500">Кількість</th>
                    <th className="px-4 py-2 text-xs font-bold text-slate-500">Брак</th>
                    <th className="px-4 py-2 text-xs font-bold text-slate-500">Ціна</th>
                    <th className="px-4 py-2 text-xs font-bold text-slate-500">Сума</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {draftOrderItems.map((item, idx) => {
                    const p = products.find(prod => prod.id === item.productId);
                    return (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm font-bold">{p?.name}</td>
                        <td className="px-4 py-3 text-sm">{item.qty}</td>
                        <td className="px-4 py-3 text-sm">{item.defect || 0}</td>
                        <td className="px-4 py-3 text-sm">{item.price} ₴</td>
                        <td className="px-4 py-3 text-sm font-bold">{item.qty * item.price} ₴</td>
                        <td className="px-4 py-3 text-right">
                          <button type="button" onClick={() => setDraftOrderItems(draftOrderItems.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Товар</label>
                <div className="space-y-2">
                  <input 
                    type="text" 
                    placeholder="Пошук..." 
                    className="input-field text-xs py-2"
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                  <select ref={draftProductRef} className="input-field">
                    <option value="">Оберіть товар</option>
                    {products.filter(p => !p.isArchived && p.name.toLowerCase().includes(productSearch.toLowerCase())).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Кількість</label>
                <input ref={draftQtyRef} type="number" step="any" min="0.01" className="input-field" placeholder="0" />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Брак</label>
                <input ref={draftDefectRef} type="number" step="any" min="0" className="input-field" placeholder="0" />
              </div>
              <div className="md:col-span-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Ціна за од.</label>
                <input ref={draftPriceRef} type="number" step="any" min="0" className="input-field" placeholder="0.00" />
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => {
                const pId = draftProductRef.current?.value || '';
                const qty = Number(draftQtyRef.current?.value || 0);
                const defect = Number(draftDefectRef.current?.value || 0) || 0;
                const price = Number(draftPriceRef.current?.value || 0);
                
                if (pId && qty > 0 && price >= 0) {
                  setDraftOrderItems([...draftOrderItems, { productId: pId, qty, price, defect }]);
                  if (draftQtyRef.current) draftQtyRef.current.value = '';
                  if (draftDefectRef.current) draftDefectRef.current.value = '';
                  if (draftPriceRef.current) draftPriceRef.current.value = '';
                }
              }}
              className="w-full mt-4 py-3 bg-white border border-slate-200 hover:border-primary hover:text-primary text-slate-600 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Додати позицію
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
