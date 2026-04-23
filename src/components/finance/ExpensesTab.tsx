import React from 'react';
import { TrendingDown, Calendar, Tag, MessageSquare, Edit2, Trash2 } from 'lucide-react';
import { Expense } from '../../types';

interface ExpensesTabProps {
  expenses: Expense[];
  searchTerm: string;
  onEdit: (e: Expense) => void;
  onDelete: (id: string, col: string) => void;
}

export const ExpensesTab = ({ expenses, searchTerm, onEdit, onDelete }: ExpensesTabProps) => {
  const filtered = expenses.filter(e => 
    e.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.comment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statsByCategory = filtered.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(statsByCategory).map(([cat, amount]) => (
          <div key={cat} className="saas-card p-4 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{cat}</span>
            <span className="text-lg font-black text-rose-500">{amount.toLocaleString()} ₴</span>
          </div>
        ))}
      </div>

      <div className="saas-card overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Дата</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Категорія</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Коментар</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Сума</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(e => (
                <tr key={e.id} className="hover:bg-background/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main font-medium">
                    {new Date(e.date).toLocaleDateString('uk-UA')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="badge badge-danger bg-rose-500/10 text-rose-500 border-rose-500/20">
                      {e.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-muted max-w-xs truncate">
                    {e.comment}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-rose-500">
                    -{e.amount.toLocaleString()} ₴
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => onEdit(e)} className="p-2 hover:bg-primary/10 rounded-lg text-text-muted hover:text-primary transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(e.id, 'expenses')} className="p-2 hover:bg-rose-500/10 rounded-lg text-text-muted hover:text-rose-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                    Витрат не знайдено
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-border">
          {filtered.map(e => (
            <div key={e.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-muted">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">{new Date(e.date).toLocaleDateString('uk-UA')}</span>
                </div>
                <span className="text-sm font-black text-rose-500">-{e.amount.toLocaleString()} ₴</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold text-text-main">{e.category}</span>
              </div>
              {e.comment && (
                <div className="flex items-start gap-2 bg-background/50 p-2 rounded-lg">
                  <MessageSquare className="w-3.5 h-3.5 text-text-muted mt-0.5 shrink-0" />
                  <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">{e.comment}</p>
                </div>
              )}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button onClick={() => onEdit(e)} className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-[11px] font-bold">
                  <Edit2 className="w-3.5 h-3.5" /> Редагувати
                </button>
                <button onClick={() => onDelete(e.id, 'expenses')} className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 rounded-xl text-[11px] font-bold">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-12 text-center text-text-muted text-sm">
              Витрат не знайдено
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
