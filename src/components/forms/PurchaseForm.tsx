import React from 'react';
import { Plus, X } from 'lucide-react';
import { Purchase, Product, PurchaseItem } from '../../types';

interface PurchaseFormProps {
  editingItem: Purchase | null;
  products: Product[];
  draftPurchaseItems: { productId: string; qty: number; price: number }[];
  setDraftPurchaseItems: (items: { productId: string; qty: number; price: number }[]) => void;
  productSearch: string;
  setProductSearch: (s: string) => void;
}

export const PurchaseForm = ({
  editingItem,
  products,
  draftPurchaseItems,
  setDraftPurchaseItems,
  productSearch,
  setProductSearch
}: PurchaseFormProps) => {
  const draftProductRef = React.useRef<HTMLSelectElement>(null);
  const draftQtyRef = React.useRef<HTMLInputElement>(null);
  const draftPriceRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-8">
        <div>
          <label className="text-sm font-bold text-slate-500 block mb-3">Дата</label>
          <input name="date" type="datetime-local" defaultValue={editingItem?.date || new Date().toISOString().slice(0, 16)} required className="input-field" />
        </div>
        <div>
          <label className="text-sm font-bold text-slate-500 block mb-3">Постачальник</label>
          <input name="supplierName" defaultValue={editingItem?.supplierName || editingItem?.supplier} required maxLength={200} className="input-field" />
        </div>
        <div>
          <label className="text-sm font-bold text-slate-500 block mb-3">Сума доставки нам, ₴</label>
          <input name="deliveryCost" type="number" step="any" defaultValue={editingItem?.deliveryCost || 0} className="input-field" />
        </div>
        <div>
          <label className="text-sm font-bold text-slate-500 block mb-3">Статус</label>
          <select name="status" defaultValue={editingItem?.status || 'Чернетка'} className="input-field">
            <option value="Чернетка">Чернетка</option>
            <option value="Обробляється">Обробляється</option>
            <option value="Оплачено">Оплачено</option>
            <option value="Борг">Борг</option>
            <option value="Скасовано">Скасовано</option>
          </select>
        </div>
      </div>

      {!editingItem && (
        <div className="p-6 bg-card rounded-[24px] border border-slate-200 space-y-6">
          <h4 className="font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" /> Додати товари до закупівлі
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
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
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Кількість</label>
              <input ref={draftQtyRef} type="number" step="any" className="input-field" placeholder="0.00" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Ціна</label>
              <input ref={draftPriceRef} type="number" step="any" className="input-field" placeholder="0.00" />
            </div>
          </div>
          <button 
            type="button"
            onClick={() => {
              const pId = draftProductRef.current?.value || '';
              const qty = Number(draftQtyRef.current?.value || 0);
              const price = Number(draftPriceRef.current?.value || 0);
              if (pId && qty > 0) {
                setDraftPurchaseItems([...draftPurchaseItems, { productId: pId, qty, price }]);
                if (draftQtyRef.current) draftQtyRef.current.value = '';
                if (draftPriceRef.current) draftPriceRef.current.value = '';
              }
            }}
            className="w-full py-3 bg-white border border-slate-200 hover:border-primary hover:text-primary text-slate-600 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Додати до списку
          </button>

          <div className="space-y-2 mt-4">
            {draftPurchaseItems.map((item, idx) => {
              const p = products.find(prod => prod.id === item.productId);
              return (
                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <span className="font-bold text-slate-700">{p?.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-indigo-600">{item.qty} x {item.price} ₴</span>
                    <button type="button" onClick={() => setDraftPurchaseItems(draftPurchaseItems.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
