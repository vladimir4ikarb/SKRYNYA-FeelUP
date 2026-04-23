import React from 'react';
import { TechnicalSpec } from '../../types';

interface SpecFormProps {
  editingItem: TechnicalSpec | null;
}

export const SpecForm = ({ editingItem }: SpecFormProps) => {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div>
        <label className="text-sm font-bold text-slate-500 block mb-3">Розмір (напр. 12")</label>
        <input name="size" defaultValue={editingItem?.size} required className="input-field" />
      </div>
      <div>
        <label className="text-sm font-bold text-slate-500 block mb-3">Об'єм гелію (л)</label>
        <input name="heliumVolume" type="number" step="0.01" defaultValue={editingItem?.heliumVolume} required className="input-field" />
      </div>
    </div>
  );
};
