import React from 'react';
import { AppUser } from '../../types';

interface UserFormProps {
  editingItem: AppUser | null;
}

export const UserForm = ({ editingItem }: UserFormProps) => {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="col-span-2">
        <label className="text-sm font-bold text-slate-500 block mb-3">Роль користувача</label>
        <select name="role" defaultValue={editingItem?.role || 'manager'} className="input-field">
          <option value="admin">Адміністратор</option>
          <option value="manager">Менеджер</option>
          <option value="viewer">Перегляд</option>
        </select>
      </div>
    </div>
  );
};
