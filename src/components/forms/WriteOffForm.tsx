import React, { useState, useRef } from 'react';
import { Plus, X, Search } from 'lucide-react';
import { WriteOff, Product } from '../../types';

interface WriteOffFormProps {
  editingItem: WriteOff | null;
  products: Product[];
  draftItems: { productId: string; qty: number }[];
  setDraftItems: (items: { productId: string; qty: number }[]) => void;
  productSearch: string;
  setProductSearch: (s: string) => void;
}

export const WriteOffForm = ({
  editingItem,
  products,
  draftItems,
  setDraftItems,
  productSearch,
  setProductSearch
}: WriteOffFormProps) => {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showProductResults, setShowProductResults] = useState(false);
  const [status, setStatus] = useState(editingItem?.status || 'Чернетка');

  const draftQtyRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(p => 
    !p.isArchived && (
      p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
      (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
    )
  ).slice(0, 5);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <div className="space-y-6 lg:space-y-8 pb-32 lg:pb-40">
      <div className="grid grid-cols-2 gap-4 lg:gap-8">
        <div>
          <label className="text-xs font-bold text-text-muted block mb-1.5 lg:mb-3 uppercase tracking-wider">Дата</label>
          <input name="date" type="datetime-local" defaultValue={editingItem?.date || new Date().toISOString().slice(0, 16)} required className="input-field" />
        </div>
        <div>
          <label className="text-xs font-bold text-text-muted block mb-1.5 lg:mb-3 uppercase tracking-wider">Причина</label>
          <select name="reason" defaultValue={editingItem?.reason || 'Брак'} required className="input-field">
            <option value="Брак">Брак</option>
            <option value="Тест/Навчання">Тест/Навчання</option>
            <option value="Внутрішнє використання">Внутрішнє використання</option>
            <option value="Корекція">Корекція залишку</option>
            <option value="Інше">Інше</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-text-muted block mb-1.5 lg:mb-3 uppercase tracking-wider">Списати гелій, м³</label>
          <input name="heliumVolume" type="number" step="any" defaultValue={editingItem?.heliumVolume || 0} className="input-field" placeholder="0.000" />
        </div>
        <div>
          <label className="text-xs font-bold text-text-muted block mb-1.5 lg:mb-3 uppercase tracking-wider">Статус</label>
          <select 
            name="status" 
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="input-field"
            disabled={editingItem?.status === 'Скасовано'}
          >
            <option value="Чернетка" disabled={editingItem && editingItem.status !== 'Чернетка'}>Чернетка</option>
            <option value="Проведено">Проведено</option>
            <option value="Скасовано">Скасовано</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-xs font-bold text-text-muted block mb-1.5 lg:mb-3 uppercase tracking-wider">Коментар</label>
          <textarea name="comment" defaultValue={editingItem?.comment || ''} className="input-field h-20 resize-none" placeholder="Додайте деталі списання..." />
        </div>
      </div>

      <div className="col-span-full border-t border-border pt-4 lg:pt-8 mt-4 lg:mt-0">
        <h4 className="font-bold text-sm lg:text-base text-text-main mb-3 lg:mb-6">Товари до списання</h4>
        
        {draftItems.length > 0 && (
          <div className="mb-6 bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs lg:text-sm">
                <thead className="bg-background border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-bold text-text-muted uppercase tracking-wider">Товар</th>
                    <th className="px-4 py-3 font-bold text-text-muted text-center uppercase tracking-wider">Кількість</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {draftItems.map((item, idx) => {
                    const p = products.find(prod => prod.id === item.productId);
                    return (
                      <tr key={idx} className="hover:bg-primary/5 transition-colors group">
                        <td className="px-4 py-3 font-bold text-text-main">
                          {p?.name}
                          {p?.sku && <span className="block text-[10px] text-primary/60 font-mono">SKU: {p.sku}</span>}
                        </td>
                        <td className="px-4 py-3 text-center font-black text-rose-600">{item.qty}</td>
                        <td className="px-4 py-3 text-right">
                          {status === 'Чернетка' && (
                            <button type="button" onClick={() => setDraftItems(draftItems.filter((_, i) => i !== idx))} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {status === 'Чернетка' && (
          <div className="p-4 lg:p-6 bg-primary/5 rounded-3xl border border-primary/10 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
              <div className="sm:col-span-9 relative">
                <label className="text-[10px] font-black text-text-muted uppercase mb-1.5 block tracking-widest">Вибір товару (SKU/Назва)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder={selectedProduct ? selectedProduct.name : "Введіть назву або SKU..."} 
                    className={`input-field h-11 text-sm ${selectedProduct ? 'border-primary bg-primary/5 font-bold text-primary shadow-sm' : ''}`}
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
                        setSelectedProductId(null);
                        setProductSearch('');
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-background rounded-lg text-text-muted"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {showProductResults && productSearch && (
                  <div className="absolute z-[100] left-0 right-0 top-[100%] mt-1 bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {filteredProducts.length > 0 ? (
                      <div className="p-1">
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
                            className="w-full text-left px-4 py-3 hover:bg-primary/10 rounded-xl transition-all flex items-center justify-between group"
                          >
                            <div>
                              <div className="font-bold text-sm text-text-main group-hover:text-primary transition-colors">{p.name}</div>
                              {p.sku && <div className="text-[10px] font-mono font-black text-primary/60">SKU: {p.sku}</div>}
                            </div>
                            <Plus className="w-4 h-4 text-text-muted group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-text-muted text-sm italic">Нічого не знайдено</div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="sm:col-span-3">
                <label className="text-[10px] font-black text-text-muted uppercase mb-1.5 block tracking-widest text-center sm:text-left">Кількість</label>
                <input ref={draftQtyRef} type="number" step="any" className="input-field h-11 text-center sm:text-left text-base font-black text-rose-600" placeholder="0" />
              </div>
            </div>
            
            <button 
              type="button"
              onClick={() => {
                const pId = selectedProductId;
                const qty = Number(draftQtyRef.current?.value || 0);
                if (pId && qty > 0) {
                  setDraftItems([...draftItems, { productId: pId, qty }]);
                  if (draftQtyRef.current) draftQtyRef.current.value = '';
                  setSelectedProductId(null);
                  setProductSearch('');
                } else {
                  alert('Оберіть товар та вкажіть додатну кількість');
                }
              }}
              disabled={!selectedProductId}
              className="w-full h-11 bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50 disabled:grayscale transition-all rounded-2xl font-black text-xs lg:text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 uppercase tracking-widest border-2 border-white/20"
            >
              <Plus className="w-5 h-5" /> Додати товар до списання
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
