import React from 'react';
import { Package, Clock, Edit2, Trash2, ChevronRight, Filter } from 'lucide-react';
import { Product, Purchase, PurchaseItem } from '../../types';
import { PRODUCT_CATEGORIES, LATEX_SERIES } from '../../constants/productCategories';

interface InventoryTabProps {
  products: Product[];
  inventory: Record<string, number>;
  purchases: Purchase[];
  purchaseItems: PurchaseItem[];
  searchTerm: string;
  onToggleArchive: (p: Product) => void;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  dashboardStats?: any;
}

export const InventoryTab = React.memo(({ 
  products, 
  inventory, 
  purchases,
  purchaseItems,
  searchTerm, 
  onToggleArchive, 
  onEdit, 
  onDelete,
  dashboardStats
}: InventoryTabProps) => {
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState<Record<string, string>>({});

  // Reset filters when category changes
  React.useEffect(() => {
    setFilters({});
  }, [selectedCategory]);

  const lastCostMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    const purchaseMap = new Map(purchases.map(p => [p.id, p]));
    
    // Group purchase items by product
    const itemByProductId: Record<string, PurchaseItem[]> = {};
    purchaseItems.forEach(item => {
      if (item.isDeleted) return;
      if (!itemByProductId[item.productId]) itemByProductId[item.productId] = [];
      itemByProductId[item.productId].push(item);
    });

    products.forEach(p => {
      const pItems = itemByProductId[p.id] || [];
      if (pItems.length === 0) return;

      let latestPrice = 0;
      let latestDate = 0;

      pItems.forEach(item => {
        const purchase = purchaseMap.get(item.purchaseId);
        if (!purchase || purchase.status !== 'Проведено' || !purchase.date) return;
        
        const price = item.costPrice || item.price || 0;
        if (price > 0) {
          const pDate = new Date(purchase.date).getTime();
          if (pDate > latestDate) {
            latestDate = pDate;
            latestPrice = price;
          }
        }
      });

      if (latestPrice > 0) {
        map[p.id] = latestPrice;
      }
    });

    return map;
  }, [products, purchases, purchaseItems]);

  const categories = React.useMemo(() => {
    // Only show categories that actually have products (even after normalization)
    const existingCats = Array.from(new Set(products.filter(p => !p.isArchived).map(p => (p.category || 'Інше').trim())));
    
    // We want to show the nice sentence case from PRODUCT_CATEGORIES if a match exists (case-insensitive)
    const normalizedCats = existingCats.map(cat => {
      const match = PRODUCT_CATEGORIES.find(c => c.toLowerCase() === cat.toLowerCase());
      return match || cat;
    });

    const uniqueNormalized = Array.from(new Set(normalizedCats));
    
    return [...PRODUCT_CATEGORIES.filter(cat => uniqueNormalized.includes(cat)), ...uniqueNormalized.filter(cat => !PRODUCT_CATEGORIES.includes(cat as any))];
  }, [products]);

  const filteredProducts = React.useMemo(() => products.filter(p => {
    const name = p.name || '';
    const cate = p.category || 'Інше';
    const sku = p.sku || '';

    const matchesCategory = !selectedCategory || 
                           cate.toLowerCase() === selectedCategory.toLowerCase();
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         cate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Sub-filters logic
    let matchesSubFilters = true;
    if (selectedCategory) {
      Object.entries(filters).forEach(([key, value]) => {
        if (!value) return;
        if (selectedCategory === "Bubbles" && key === "color") {
          // Bubbles color is always "Прозорий"
          if (value !== "Прозорий") matchesSubFilters = false;
          return;
        }
        const pValue = (p as any)[key];
        if (pValue !== value) matchesSubFilters = false;
      });
    }

    if (searchTerm === 'archived') return p.isArchived;
    return !p.isArchived && matchesCategory && matchesSearch && matchesSubFilters;
  }), [products, searchTerm, selectedCategory, filters]);

  const grouped = React.useMemo(() => filteredProducts.reduce((acc, p) => {
    const rawCat = p.category || 'Інше';
    const match = PRODUCT_CATEGORIES.find(c => c.toLowerCase() === rawCat.toLowerCase());
    const cat = match || rawCat;
    
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {} as Record<string, Product[]>), [filteredProducts]);

  // Options for sub-filters based on current category products
  const filterOptions = React.useMemo(() => {
    if (!selectedCategory) return null;
    
    const categoryProducts = products.filter(p => (p.category || 'Інше').toLowerCase() === selectedCategory.toLowerCase() && !p.isArchived);
    
    const options: Record<string, string[]> = {};
    const keys: string[] = [];

    if (selectedCategory === "Латексні кулі") {
      keys.push('size', 'latexSeries', 'color', 'producer');
    } else if (selectedCategory === "Фольговані кулі") {
      keys.push('foilType');
      if (filters.foilType === 'Цифра') {
        keys.push('foilLabel');
      }
      keys.push('size', 'color', 'producer');
    } else if (selectedCategory === "Bubbles") {
      keys.push('size', 'producer');
    } else if (selectedCategory === "Стрічки") {
      keys.push('subCategory', 'color');
    } else if (selectedCategory === "Декор / Наповнювачі") {
      keys.push('subCategory', 'color');
    } else if (selectedCategory === "Розхідники") {
      keys.push('name');
    } else if (selectedCategory === "Обладнання") {
      keys.push('name');
    } else if (selectedCategory === "Гелій") {
      keys.push('subCategory');
    }

    keys.forEach(key => {
      const values = new Set(categoryProducts.filter(p => {
        if (key === 'foilLabel' && filters.foilType === 'Цифра') {
          return p.foilType === 'Цифра';
        }
        return true;
      }).map(p => (p as any)[key]).filter(Boolean));
      options[key] = Array.from(values).sort() as string[];
    });

    return options;
  }, [products, selectedCategory, filters.foilType]);

  return (
    <div className="space-y-4">
      {/* Category Chips */}
      {searchTerm !== 'archived' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
          <button 
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${!selectedCategory ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-card border border-border text-text-muted hover:border-primary/30'}`}
          >
            Всі категорії
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(prev => prev === cat ? null : cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-card border border-border text-text-muted hover:border-primary/30'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Sub Filters */}
      {selectedCategory && filterOptions && selectedCategory !== "Розхідники" && selectedCategory !== "Обладнання" && (
        <div className="flex flex-wrap gap-3 p-4 bg-card border border-border rounded-[24px]">
          <div className="flex items-center gap-2 mr-2">
            <Filter className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">Фільтри:</span>
          </div>
          {Object.entries(filterOptions).map(([key, opts]) => {
            const labelMap: Record<string, string> = {
              'size': 'Розмір',
              'latexSeries': 'Серія',
              'color': 'Колір',
              'producer': 'Виробник',
              'foilType': 'Тип',
              'foilLabel': 'Номер',
              'name': 'Назва',
              'subCategory': selectedCategory === "Стрічки" ? 'Тип стрічки' : 
                             (selectedCategory === "Декор / Наповнювачі" ? 'Тип' : 
                             (selectedCategory === "Гелій" ? 'Тип балона' : 'Підкатегорія'))
            };
            return (
              <div key={key} className="flex flex-col gap-1 min-w-[100px]">
                <select 
                  className="bg-background border border-border rounded-lg px-2 py-1.5 text-[11px] font-bold text-text-main focus:ring-1 focus:ring-primary outline-none"
                  value={filters[key] || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, [key]: e.target.value }))}
                >
                  <option value="">{labelMap[key] || key}</option>
                  {opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            );
          })}
          {Object.keys(filters).some(k => filters[k]) && (
            <button 
              onClick={() => setFilters({})}
              className="text-[10px] font-bold text-rose-500 hover:underline"
            >
              Скинути
            </button>
          )}
        </div>
      )}

      <div className="card-base card-orders overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="px-8 py-3 text-sm font-bold text-text-muted uppercase tracking-wider">Назва</th>
              <th className="px-8 py-3 text-sm font-bold text-text-muted uppercase tracking-wider">Характеристики</th>
              <th className="px-8 py-3 text-sm font-bold text-text-muted uppercase tracking-wider">Виробник</th>
              <th className="px-8 py-3 text-sm font-bold text-text-muted uppercase tracking-wider">Залишок</th>
              <th className="px-8 py-3 text-sm font-bold text-text-muted uppercase tracking-wider">Собівартість</th>
              <th className="px-8 py-3 text-sm font-bold text-text-muted uppercase tracking-wider text-right">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Object.entries(grouped).map(([category, prods]) => (
              <React.Fragment key={category}>
                <tr className="bg-background/80">
                  <td colSpan={6} className="px-8 py-3 font-bold text-text-main text-xs uppercase tracking-wider border-y border-border">
                    {category}
                  </td>
                </tr>
                {prods.map(p => {
                  const lastCost = Number(lastCostMap[p.id] || p.costPrice || 0);
                  const color = category === "Bubbles" ? "Прозорий" : p.color;
                  const isHelium = category === "Гелій";
                  const isEquipment = category === "Обладнання";
                  const isConsumable = category === "Розхідники";
                  
                  const stock = Number(isHelium && dashboardStats ? dashboardStats.heliumBalance : (inventory[p.id] || 0));
                  
                  let characteristics = '—';
                  if (isHelium) {
                    characteristics = `Балон ${p.subCategory || '40 л'}`;
                  } else if (isEquipment || isConsumable) {
                    characteristics = p.note || '—';
                  } else {
                    const parts = [color, p.size].filter(Boolean);
                    characteristics = parts.length > 0 ? parts.join(', ') : '—';
                  }

                  return (
                    <tr key={p.id} className={`hover:bg-background/50 transition-colors ${p.isArchived ? 'opacity-50' : ''}`}>
                      <td className="px-8 py-3 font-bold text-text-main">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-background border border-border overflow-hidden flex-shrink-0 shadow-sm flex items-center justify-center">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <Package className="w-5 h-5 text-text-muted opacity-30" />
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <div className="truncate mb-0.5">{p.name}</div>
                            <div className="text-[10px] text-primary font-mono font-bold opacity-80" style={{ color: '#70489d' }}>
                              {p.sku || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-3 text-text-muted font-medium text-sm">
                        {characteristics}
                      </td>
                      <td className="px-8 py-3 text-text-muted font-medium text-sm">
                        {p.producer || '—'}
                      </td>
                      <td className="px-8 py-3">
                        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${stock > 0 ? 'bg-emerald-500/10 text-emerald-500' : stock < 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-card/10 text-text-muted'}`}>
                          {isHelium ? `${stock.toFixed(1)} м³` : stock}
                        </span>
                      </td>
                      <td className="px-8 py-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-text-main">
                            {lastCost > 0 ? `${lastCost.toFixed(2)} ₴` : '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => onToggleArchive(p)} className="p-2 hover:bg-card/10 rounded-xl transition-colors text-text-muted hover:text-amber-500" title={p.isArchived ? 'Розархівувати' : 'В архів'}>
                            <Clock className="w-4 h-4" />
                          </button>
                          <button onClick={() => onEdit(p)} className="p-2 hover:bg-card/10 rounded-xl transition-colors text-text-muted hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => onDelete(p.id)} className="p-2 hover:bg-rose-500/10 rounded-xl transition-colors text-text-muted hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Compact List */}
      <div className="md:hidden space-y-px bg-border rounded-b-[24px] overflow-hidden">
        {Object.entries(grouped).map(([category, prods]) => (
          <div key={category} className="bg-card">
            <div className="bg-background/80 px-4 py-1.5 font-bold text-text-muted text-[10px] uppercase tracking-widest border-y border-border">
              {category}
            </div>
            <div className="divide-y divide-border/50">
              {prods.map(p => {
                const lastCost = Number(lastCostMap[p.id] || p.costPrice || 0);
                const color = category === "Bubbles" ? "Прозорий" : p.color;
                const isHelium = category === "Гелій";
                const isEquipment = category === "Обладнання";
                const isConsumable = category === "Розхідники";
                const stock = Number(isHelium && dashboardStats ? dashboardStats.heliumBalance : (inventory[p.id] || 0));

                let characteristics = '—';
                if (isHelium) {
                  characteristics = `Балон ${p.subCategory || '40 л'}`;
                } else if (isEquipment || isConsumable) {
                  characteristics = p.note || '—';
                } else {
                  const parts = [color, p.size].filter(Boolean);
                  characteristics = parts.length > 0 ? parts.join(', ') : '—';
                }
                
                return (
                  <div key={p.id} className={`p-3 flex items-center gap-3 active:bg-background/80 transition-colors ${p.isArchived ? 'opacity-50' : ''}`}>
                    <div className="w-10 h-10 rounded-lg bg-background border border-border overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <Package className="w-5 h-5 text-text-muted opacity-30" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-text-main truncate leading-tight mb-0.5">
                        {p.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-[10px] text-primary font-mono font-bold opacity-80 leading-none">
                          {p.sku || ''}
                        </div>
                        {lastCost > 0 && (
                          <div className="text-[10px] text-text-muted font-bold">
                             • {lastCost.toFixed(2)} ₴
                          </div>
                        )}
                      </div>
                      <div className="mt-0.5 text-[10px] font-bold text-text-muted italic truncate">
                         {characteristics}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`px-2 py-0.5 rounded-lg text-[11px] font-black ${stock > 0 ? 'bg-emerald-500/10 text-emerald-500' : stock < 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-card/10 text-text-muted'}`}>
                        {isHelium ? `${stock.toFixed(1)} м³` : stock}
                      </span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => onEdit(p)} className="p-1.5 hover:bg-primary/10 rounded-md text-text-muted hover:text-primary transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => onToggleArchive(p)} className="p-1.5 hover:bg-amber-500/10 rounded-md text-text-muted hover:text-amber-500 transition-colors">
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
});
