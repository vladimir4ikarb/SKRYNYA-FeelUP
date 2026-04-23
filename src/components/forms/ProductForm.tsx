import React from 'react';
import { Product } from '../../types';

interface ProductFormProps {
  editingItem: Product | null;
}

export const ProductForm = ({ editingItem }: ProductFormProps) => {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="col-span-2">
        <label className="text-sm font-bold text-text-muted block mb-3">Назва товару</label>
        <input name="name" defaultValue={editingItem?.name} required maxLength={200} className="input-field" />
      </div>
      <div className="col-span-2">
        <label className="text-sm font-bold text-text-muted block mb-3">Посилання на фото (URL)</label>
        <input name="imageUrl" defaultValue={editingItem?.imageUrl} placeholder="https://..." className="input-field" />
      </div>
      <div>
        <label className="text-sm font-bold text-text-muted block mb-3">Категорія</label>
        <input name="category" defaultValue={editingItem?.category} required maxLength={100} className="input-field" />
      </div>
      <div>
        <label className="text-sm font-bold text-slate-500 block mb-3">Розмір</label>
        <input name="size" defaultValue={editingItem?.size} maxLength={50} className="input-field" />
      </div>
      <div>
        <label className="text-sm font-bold text-slate-500 block mb-3">Колір</label>
        <input name="color" defaultValue={editingItem?.color} maxLength={50} className="input-field" />
      </div>
      <div>
        <label className="text-sm font-bold text-slate-500 block mb-3">Ціна закупівлі (собівартість) ₴</label>
        <input name="costPrice" type="number" step="any" defaultValue={editingItem?.costPrice} className="input-field" />
      </div>
      <div>
        <label className="text-sm font-bold text-slate-500 block mb-3">Об'єм гелію (л)</label>
        <input name="heliumVolume" type="number" step="any" defaultValue={editingItem?.heliumVolume} className="input-field" />
      </div>
      <div>
        <label className="text-sm font-bold text-slate-500 block mb-3">Мін. залишок (ліміт)</label>
        <input name="minStock" type="number" defaultValue={editingItem?.minStock || 5} className="input-field" />
      </div>
      {!editingItem && (
        <div>
          <label className="text-sm font-bold text-slate-500 block mb-3">Початковий залишок</label>
          <input name="currentStock" type="number" defaultValue={0} className="input-field" />
        </div>
      )}
    </div>
  );
};
