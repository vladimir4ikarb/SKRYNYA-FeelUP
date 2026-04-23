import React from 'react';
import { Package, Clock, Edit2, Trash2 } from 'lucide-react';
import { Product } from '../../types';

interface InventoryTabProps {
  products: Product[];
  inventory: Record<string, number>;
  searchTerm: string;
  onToggleArchive: (p: Product) => void;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
}

export const InventoryTab = React.memo(({ 
  products, 
  inventory, 
  searchTerm, 
  onToggleArchive, 
  onEdit, 
  onDelete 
}: InventoryTabProps) => {
  const filteredProducts = React.useMemo(() => products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase());
    if (searchTerm === 'archived') return p.isArchived;
    return !p.isArchived && matchesSearch;
  }), [products, searchTerm]);

  const grouped = React.useMemo(() => filteredProducts.reduce((acc, p) => {
    const cat = p.category || 'Інше';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {} as Record<string, Product[]>), [filteredProducts]);

  return (
    <div className="saas-card overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="px-8 py-5 text-sm font-bold text-text-muted uppercase tracking-wider">Назва</th>
              <th className="px-8 py-5 text-sm font-bold text-text-muted uppercase tracking-wider">Категорія</th>
              <th className="px-8 py-5 text-sm font-bold text-text-muted uppercase tracking-wider">Залишок</th>
              <th className="px-8 py-5 text-sm font-bold text-text-muted uppercase tracking-wider text-right">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Object.entries(grouped).map(([category, prods]) => (
              <React.Fragment key={category}>
                <tr className="bg-background/80">
                  <td colSpan={4} className="px-8 py-3 font-bold text-text-main text-xs uppercase tracking-wider border-y border-border">
                    {category}
                  </td>
                </tr>
                {prods.map(p => (
                  <tr key={p.id} className={`hover:bg-background/50 transition-colors ${p.isArchived ? 'opacity-50' : ''}`}>
                    <td className="px-8 py-5 font-bold text-text-main">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-background border border-border overflow-hidden flex-shrink-0 shadow-sm flex items-center justify-center">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <Package className="w-6 h-6 text-text-muted opacity-30" />
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <div className="truncate">{p.name}</div>
                          <div className="text-[10px] text-text-muted font-normal">{p.size} | {p.color} {p.heliumVolume ? `| ${p.heliumVolume} л` : ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-text-muted font-medium">{p.category}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-lg text-sm font-bold ${inventory[p.id] > 0 ? 'bg-emerald-500/10 text-emerald-500' : inventory[p.id] < 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-500/10 text-slate-500'}`}>
                        {inventory[p.id] || 0}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => onToggleArchive(p)} className="p-3 hover:bg-slate-500/10 rounded-xl transition-colors text-text-muted hover:text-amber-500" title={p.isArchived ? 'Розархівувати' : 'В архів'}>
                          <Clock className="w-5 h-5" />
                        </button>
                        <button onClick={() => onEdit(p)} className="p-3 hover:bg-slate-500/10 rounded-xl transition-colors text-text-muted hover:text-primary"><Edit2 className="w-5 h-5" /></button>
                        <button onClick={() => onDelete(p.id)} className="p-3 hover:bg-rose-500/10 rounded-xl transition-colors text-text-muted hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile List */}
      <div className="md:hidden divide-y divide-border">
        {Object.entries(grouped).map(([category, prods]) => (
          <div key={category} className="flex flex-col">
            <div className="bg-background/80 px-4 py-2 font-bold text-text-muted text-[10px] uppercase tracking-widest border-y border-border">
              {category}
            </div>
            {prods.map(p => (
              <div key={p.id} className={`p-4 flex flex-col gap-4 ${p.isArchived ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-background border border-border overflow-hidden flex-shrink-0 shadow-sm flex items-center justify-center">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Package className="w-8 h-8 text-text-muted opacity-30" />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-base font-bold text-text-main truncate">{p.name}</div>
                    <div className="text-[11px] text-text-muted font-medium mb-2">{p.size} | {p.color} {p.heliumVolume ? `| ${p.heliumVolume} л` : ''}</div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-black ${inventory[p.id] > 0 ? 'bg-emerald-500/10 text-emerald-500' : inventory[p.id] < 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-500/10 text-slate-500'}`}>
                      Залишок: {inventory[p.id] || 0}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
                  <button onClick={() => onToggleArchive(p)} className="flex-1 flex items-center justify-center gap-2 p-3 bg-slate-500/5 rounded-xl text-text-muted font-bold text-xs">
                    <Clock className="w-4 h-4 text-amber-500" /> {p.isArchived ? 'Розархів.' : 'В архів'}
                  </button>
                  <button onClick={() => onEdit(p)} className="flex-1 flex items-center justify-center gap-2 p-3 bg-primary/5 rounded-xl text-primary font-bold text-xs">
                    <Edit2 className="w-4 h-4" /> Редагувати
                  </button>
                  <button onClick={() => onDelete(p.id)} className="p-3 bg-rose-500/5 rounded-xl text-rose-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});
