import React from 'react';
import { Client } from '../../types';

interface ClientFormProps {
  editingItem: Client | null;
}

export const ClientForm = ({ editingItem }: ClientFormProps) => {
  return (
    <div className="space-y-8">
      <div>
        <label className="text-sm font-bold text-slate-500 block mb-3">Ім’я</label>
        <input name="name" defaultValue={editingItem?.name} required maxLength={200} className="input-field" />
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <label className="text-sm font-bold text-slate-500 block mb-3">Телефон</label>
          <input name="phone" defaultValue={editingItem?.phone} maxLength={50} className="input-field" />
        </div>
        <div>
          <label className="text-sm font-bold text-slate-500 block mb-3">Instagram</label>
          <input name="instagram" defaultValue={editingItem?.instagram} maxLength={100} className="input-field" />
        </div>
      </div>
      <div>
        <label className="text-sm font-bold text-slate-500 block mb-3">Адреса</label>
        <textarea name="address" defaultValue={editingItem?.address} maxLength={500} className="input-field h-32" />
      </div>
      <div>
        <label className="text-sm font-bold text-slate-500 block mb-3">Коментар</label>
        <textarea name="comment" defaultValue={editingItem?.comment} maxLength={1000} className="input-field h-24" />
      </div>
    </div>
  );
};
