import React, { useState, useRef } from 'react';
import { Plus, X, Search } from 'lucide-react';
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
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showProductResults, setShowProductResults] = useState(false);
  const [status, setStatus] = useState(editingItem?.status || 'Чернетка');

  const draftQtyRef = useRef<HTMLInputElement>(null);
  const draftPriceRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(p => 
    !p.isArchived && (
      p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
      (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
    )
  ).slice(0, 5);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <div className="space-y-4 lg:space-y-8 pb-32 lg:pb-40">
      <div className="grid grid-cols-2 gap-3 lg:gap-8">
        <div>
          <label className="text-[10px] font-bold text-text-muted block mb-1 lg:mb-3 uppercase tracking-wider">Дата</label>
          <input name="date" type="datetime-local" defaultValue={editingItem?.date || new Date().toISOString().slice(0, 16)} required className="input-field h-9 lg:h-11 text-xs sm:text-sm" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-text-muted block mb-1 lg:mb-3 uppercase tracking-wider">Клієнт</label>
          <select name="clientId" defaultValue={editingItem?.clientId} required className="input-field h-9 lg:h-11 text-xs sm:text-sm">
            <option value="">Оберіть клієнта</option>
            {clients.filter(c => !c.isArchived).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-text-muted block mb-1 lg:mb-3 uppercase tracking-wider">Доставка / Самовивіз</label>
          <input name="deliveryDate" defaultValue={editingItem?.deliveryDate || editingItem?.delivery} maxLength={500} className="input-field h-9 lg:h-11 text-xs sm:text-sm" placeholder="Адреса або м. Київ..." />
        </div>
        <div>
          <label className="text-[10px] font-bold text-text-muted block mb-1 lg:mb-3 uppercase tracking-wider">Витрати (таксі/інше), ₴</label>
          <input name="extraCosts" type="number" step="any" defaultValue={editingItem?.extraCosts || 0} className="input-field h-9 lg:h-11 text-xs sm:text-sm" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-text-muted block mb-1 lg:mb-3 uppercase tracking-wider">Менеджер</label>
          <input name="managerId" defaultValue={editingItem?.managerId || editingItem?.manager} maxLength={100} className="input-field h-9 lg:h-11 text-xs sm:text-sm" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-text-muted block mb-1 lg:mb-3 uppercase tracking-wider">Статус</label>
          <select 
            name="status" 
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="input-field h-9 lg:h-11 text-xs sm:text-sm"
            disabled={editingItem?.status === 'Виконано' || editingItem?.status === 'Скасовано'}
          >
            <option value="Чернетка">Чернетка</option>
            <option value="Виконано">Виконано</option>
            <option value="Скасовано">Скасовано</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-[10px] font-bold text-text-muted block mb-1 lg:mb-3 uppercase tracking-wider">Коментар</label>
          <textarea name="comment" defaultValue={editingItem?.comment} maxLength={2000} className="input-field h-14 lg:h-20 lg:resize-none text-xs sm:text-sm" placeholder="Додайте деталі замовлення..." />
        </div>
      </div>

        <div className="col-span-full border-t border-border pt-4 lg:pt-8 mt-4 lg:mt-0">
        <h4 className="font-bold text-[11px] lg:text-sm text-text-muted mb-2 lg:mb-4 uppercase tracking-widest">Позиції замовлення</h4>
        
        {(status === 'Чернетка') && (
          <div className="p-3 lg:p-5 bg-primary/5 rounded-2xl border border-primary/10 space-y-3 mb-4 lg:mb-6">
            <div className="space-y-3">
              {/* Row 1: Search, Qty, Price */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                <div className="sm:col-span-6 relative">
                  <label className="text-[9px] font-black text-text-muted uppercase mb-1 block tracking-widest">Товар (SKU/Назва)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder={selectedProduct ? selectedProduct.name : "Пошук товару..."} 
                      className={`input-field h-9 lg:h-10 text-xs sm:text-sm ${selectedProduct ? 'border-primary bg-primary/5 font-bold text-primary shadow-sm' : ''}`}
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setShowProductResults(true);
                        if (!e.target.value) setSelectedProductId(null);
                      }}
                      onFocus={() => setShowProductResults(true)}
                    />
                    {(productSearch || selectedProductId) && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setProductSearch('');
                          setSelectedProductId(null);
                          setShowProductResults(false);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-background rounded-lg text-text-muted"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  
                  {showProductResults && productSearch && (
                    <div className="absolute z-[100] left-0 right-0 top-[100%] mt-1 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {filteredProducts.length > 0 ? (
                        <div className="p-1 max-h-60 overflow-y-auto custom-scrollbar">
                          {filteredProducts.map(p => (
                            <button 
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedProductId(p.id);
                                setProductSearch(p.name);
                                setShowProductResults(false);
                                if (draftQtyRef.current) draftQtyRef.current.focus();
                              }}
                              className="w-full text-left px-3 py-2 lg:py-3 hover:bg-primary/10 rounded-lg transition-all flex items-center justify-between group"
                            >
                              <div>
                                <div className="font-bold text-xs lg:text-sm text-text-main group-hover:text-primary transition-colors">{p.name}</div>
                                {p.sku && <div className="text-[9px] font-mono font-black text-primary/60">SKU: {p.sku}</div>}
                              </div>
                              <Plus className="w-4 h-4 text-text-muted group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-text-muted text-xs italic">Нічого не знайдено</div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 sm:col-span-6">
                  <div>
                    <label className="text-[9px] font-black text-text-muted uppercase mb-1 block tracking-widest text-center sm:text-left">К-сть</label>
                    <input ref={draftQtyRef} type="number" step="any" className="input-field h-9 lg:h-10 text-center sm:text-left text-xs lg:text-sm font-black text-indigo-600" placeholder="0" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-text-muted uppercase mb-1 block tracking-widest text-center sm:text-left">Ціна</label>
                    <input ref={draftPriceRef} type="number" step="any" className="input-field h-9 lg:h-10 text-center sm:text-left text-xs lg:text-sm font-black text-rose-600" placeholder="0" />
                  </div>
                </div>
              </div>
              
              {/* Row 2: Add Button */}
              <button 
                type="button"
                onClick={() => {
                  const pId = selectedProductId;
                  const qty = Number(draftQtyRef.current?.value || 0);
                  const price = Number(draftPriceRef.current?.value || 0);
                  if (pId && qty > 0) {
                    setDraftOrderItems([...draftOrderItems, { productId: pId, qty, price }]);
                    if (draftQtyRef.current) draftQtyRef.current.value = '';
                    if (draftPriceRef.current) draftPriceRef.current.value = '';
                    setSelectedProductId(null);
                    setProductSearch('');
                  } else {
                    alert('Оберіть товар та вкажіть додатну кількість');
                  }
                }}
                disabled={!selectedProductId}
                className="w-full h-9 lg:h-10 bg-primary text-white hover:bg-primary-dark disabled:opacity-50 disabled:grayscale transition-all rounded-xl font-black text-[10px] lg:text-xs shadow-lg shadow-primary/25 flex items-center justify-center gap-2 uppercase tracking-widest border-b-2 border-primary-dark/30"
              >
                <Plus className="w-4 h-4" /> Додати товар
              </button>
            </div>
          </div>
        )}

        {draftOrderItems.length > 0 && (
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] lg:text-sm">
                <thead className="bg-background border-b border-border">
                  <tr>
                    <th className="px-3 py-2 font-bold text-text-muted uppercase tracking-wider">Товар</th>
                    <th className="px-3 py-2 font-bold text-text-muted text-center uppercase tracking-wider">К-сть</th>
                    <th className="px-3 py-2 font-bold text-text-muted text-right uppercase tracking-wider">Ціна</th>
                    <th className="px-3 py-2 font-bold text-text-muted text-right uppercase tracking-wider">Сума</th>
                    <th className="px-3 py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {draftOrderItems.map((item, idx) => {
                    const p = products.find(prod => prod.id === item.productId);
                    return (
                      <tr key={idx} className="hover:bg-primary/5 transition-colors group">
                        <td className="px-3 lg:px-4 py-2 lg:py-3 font-bold text-text-main">
                          <div className="truncate max-w-[120px] sm:max-w-xs">{p?.name}</div>
                          {p?.sku && <span className="block text-[8px] lg:text-[10px] text-primary/60 font-mono font-black">SKU: {p.sku}</span>}
                        </td>
                        <td className="px-3 lg:px-4 py-2 lg:py-3 text-center font-black text-indigo-600">{item.qty}</td>
                        <td className="px-3 lg:px-4 py-2 lg:py-3 text-right text-text-muted font-medium">{item.price.toLocaleString()} ₴</td>
                        <td className="px-3 lg:px-4 py-2 lg:py-3 text-right font-black text-text-main">{(item.qty * item.price).toLocaleString()} ₴</td>
                        <td className="px-3 lg:px-4 py-2 lg:py-3 text-right">
                          {(status === 'Чернетка') && (
                            <button type="button" onClick={() => setDraftOrderItems(draftOrderItems.filter((_, i) => i !== idx))} className="p-1 lg:p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                              <X className="w-3.5 h-3.5 lg:w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-primary/5 border-t border-primary/10">
                  <tr>
                    <td colSpan={3} className="px-3 lg:px-4 py-3 lg:py-4 text-right font-bold text-text-muted">Загальна сума:</td>
                    <td className="px-3 lg:px-4 py-3 lg:py-4 text-right font-black text-base lg:text-xl text-primary whitespace-nowrap">
                      {draftOrderItems.reduce((acc, curr) => acc + (curr.qty * curr.price), 0).toLocaleString()} ₴
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
