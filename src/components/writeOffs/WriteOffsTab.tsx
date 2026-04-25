import React from 'react';
import { Edit2, Trash2, Info } from 'lucide-react';
import { WriteOff } from '../../types';

interface WriteOffsTabProps {
  writeOffs: WriteOff[];
  searchTerm: string;
  selectedWriteOffId: string | null;
  onSelectWriteOff: (id: string | null) => void;
  onEdit: (w: WriteOff) => void;
  onDelete: (id: string) => void;
}

export const WriteOffsTab = React.memo(({ 
  writeOffs, 
  searchTerm, 
  selectedWriteOffId, 
  onSelectWriteOff, 
  onEdit, 
  onDelete 
}: WriteOffsTabProps) => {
  const filtered = React.useMemo(
    () =>
      writeOffs.filter(w => 
        (w.reason || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (w.comment || '').toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [writeOffs, searchTerm]
  );

  return (
    <div className="card-base card-orders overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-card border-b border-border">
          <tr>
            <th className="px-8 py-5 text-sm font-bold text-text-muted uppercase tracking-wider">Дата</th>
            <th className="px-8 py-5 text-sm font-bold text-text-muted uppercase tracking-wider">Причина</th>
            <th className="px-8 py-5 text-sm font-bold text-text-muted uppercase tracking-wider">Гелій (м³)</th>
            <th className="px-8 py-5 text-sm font-bold text-text-muted uppercase tracking-wider">Статус</th>
            <th className="px-8 py-5 text-sm font-bold text-text-muted uppercase tracking-wider text-right">Дії</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {filtered.map(w => (
            <tr key={w.id} className={`hover:bg-card/50 transition-colors cursor-pointer ${selectedWriteOffId === w.id ? 'bg-indigo-50/50' : ''}`} onClick={() => onSelectWriteOff(selectedWriteOffId === w.id ? null : w.id)}>
              <td className="px-8 py-5 text-text-muted font-medium">{new Date(w.date).toLocaleDateString()}</td>
              <td className="px-8 py-5">
                <div className="flex flex-col">
                  <span className="font-bold text-text-main">{w.reason}</span>
                  {w.comment && <span className="text-xs text-text-muted italic">{w.comment}</span>}
                </div>
              </td>
              <td className="px-8 py-5 font-bold text-text-main">{w.heliumVolume || 0}</td>
              <td className="px-8 py-5">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  w.status === 'Проведено' ? 'bg-emerald-500/10 text-emerald-500' : 
                  w.status === 'Скасовано' ? 'bg-rose-500/10 text-rose-500' : 
                  'bg-amber-500/10 text-amber-500'
                }`}>
                  {w.status}
                </span>
              </td>
              <td className="px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end gap-2">
                  <button onClick={() => onEdit(w)} className="p-3 hover:bg-card rounded-xl transition-colors text-text-muted hover:text-primary"><Edit2 className="w-5 h-5" /></button>
                  <button onClick={() => onDelete(w.id)} className="p-3 hover:bg-red-50 rounded-xl transition-colors text-text-muted hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
