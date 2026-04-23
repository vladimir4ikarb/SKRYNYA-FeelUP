import React from 'react';
import { Plus } from 'lucide-react';
import { Expense } from '../../types';

interface ExpenseFormProps {
  editingItem: Expense | null;
}

export const ExpenseForm = ({ editingItem }: ExpenseFormProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="text-sm font-bold text-text-muted block mb-3">Дата</label>
        <input 
          name="date" 
          type="date" 
          defaultValue={editingItem?.date || new Date().toISOString().split('T')[0]} 
          required 
          className="input-field" 
        />
      </div>
      <div>
        <label className="text-sm font-bold text-text-muted block mb-3">Категорія</label>
        <select name="category" defaultValue={editingItem?.category || 'Інше'} required className="input-field">
          <option value="Реклама">Реклама</option>
          <option value="Логістика">Логістика</option>
          <option value="Оренда">Оренда</option>
          <option value="Матеріали">Матеріали</option>
          <option value="Зарплата">Зарплата</option>
          <option value="Інше">Інше</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="text-sm font-bold text-text-muted block mb-3">Сума, ₴</label>
        <input 
          name="amount" 
          type="number" 
          step="any" 
          min="0.01" 
          defaultValue={editingItem?.amount} 
          required 
          className="input-field text-xl font-black text-rose-500" 
          placeholder="0.00"
        />
      </div>
      <div className="md:col-span-2">
        <label className="text-sm font-bold text-text-muted block mb-3">Коментар</label>
        <textarea 
          name="comment" 
          defaultValue={editingItem?.comment} 
          maxLength={1000} 
          className="input-field h-32" 
          placeholder="Наприклад: Реклама в Instagram за квітень"
        />
      </div>
      {/* relatedId is handled automatically or hidden for manual entry */}
      <input type="hidden" name="isDeleted" value="false" />
    </div>
  );
};
