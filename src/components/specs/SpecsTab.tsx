import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { TechnicalSpec } from '../../types';

interface SpecsTabProps {
  specs: TechnicalSpec[];
  onEdit: (s: TechnicalSpec) => void;
  onDelete: (id: string) => void;
}

export const SpecsTab = React.memo(({ specs, onEdit, onDelete }: SpecsTabProps) => (
  <div className="saas-card overflow-hidden">
    <table className="w-full text-left">
      <thead className="bg-card border-b border-border">
        <tr>
          <th className="px-8 py-5 text-sm font-bold text-text-muted uppercase tracking-wider">Розмір</th>
          <th className="px-8 py-5 text-sm font-bold text-text-muted uppercase tracking-wider">Гелій (л)</th>
          <th className="px-8 py-5 text-sm font-bold text-text-muted uppercase tracking-wider text-right">Дії</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {specs.map(s => (
          <tr key={s.id} className="hover:bg-card/50 transition-colors">
            <td className="px-8 py-5 font-bold text-text-main">{s.size}</td>
            <td className="px-8 py-5 font-bold text-indigo-600">{s.heliumVolume}</td>
            <td className="px-8 py-5 text-right">
              <div className="flex justify-end gap-2">
                <button onClick={() => onEdit(s)} className="p-3 hover:bg-card rounded-xl transition-colors text-text-muted hover:text-primary"><Edit2 className="w-5 h-5" /></button>
                <button onClick={() => onDelete(s.id)} className="p-3 hover:bg-red-50 rounded-xl transition-colors text-text-muted hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
));
