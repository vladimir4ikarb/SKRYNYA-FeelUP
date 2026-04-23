import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Purchase } from '../../types';

interface PurchasesTabProps {
  purchases: Purchase[];
  purchaseTotals: Record<string, number>;
  searchTerm: string;
  selectedPurchaseId: string | null;
  onSelectPurchase: (id: string | null) => void;
  onEdit: (p: Purchase) => void;
  onDelete: (id: string) => void;
}

export const PurchasesTab = React.memo(({ 
  purchases, 
  purchaseTotals, 
  searchTerm, 
  selectedPurchaseId, 
  onSelectPurchase, 
  onEdit, 
  onDelete 
}: PurchasesTabProps) => {
  const filteredPurchases = React.useMemo(
    () =>
      purchases.filter(p => (p.supplierName || p.supplier || '').toLowerCase().includes(searchTerm.toLowerCase())),
    [purchases, searchTerm]
  );

  return (
    <div className="saas-card overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-card border-b border-slate-100">
          <tr>
            <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-wider">Дата</th>
            <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-wider">Постачальник</th>
            <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-wider">Сума</th>
            <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-wider">Статус</th>
            <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-wider text-right">Дії</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filteredPurchases.map(p => (
            <tr key={p.id} className={`hover:bg-card/50 transition-colors cursor-pointer ${selectedPurchaseId === p.id ? 'bg-indigo-50/50' : ''}`} onClick={() => onSelectPurchase(selectedPurchaseId === p.id ? null : p.id)}>
              <td className="px-8 py-5 text-slate-500 font-medium">{new Date(p.date).toLocaleDateString()}</td>
              <td className="px-8 py-5 font-bold text-slate-900">{p.supplierName || p.supplier}</td>
              <td className="px-8 py-5 font-bold text-slate-900">{purchaseTotals[p.id] || 0} ₴</td>
              <td className="px-8 py-5">
                <span className={`badge ${p.status === 'Оплачено' ? 'badge-success' : 'badge-warning'}`}>
                  {p.status}
                </span>
              </td>
              <td className="px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end gap-2">
                  <button onClick={() => onEdit(p)} className="p-3 hover:bg-card rounded-xl transition-colors text-slate-400 hover:text-primary"><Edit2 className="w-5 h-5" /></button>
                  <button onClick={() => onDelete(p.id)} className="p-3 hover:bg-red-50 rounded-xl transition-colors text-slate-400 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
