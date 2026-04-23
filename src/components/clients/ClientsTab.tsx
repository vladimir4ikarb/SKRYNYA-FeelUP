import React from 'react';
import { Clock, Edit2, Trash2 } from 'lucide-react';
import { Client } from '../../types';

interface ClientsTabProps {
  clients: Client[];
  searchTerm: string;
  onToggleArchive: (c: Client) => void;
  onEdit: (c: Client) => void;
  onDelete: (id: string) => void;
}

export const ClientsTab = React.memo(({ clients, searchTerm, onToggleArchive, onEdit, onDelete }: ClientsTabProps) => {
  const filteredClients = React.useMemo(() => clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (searchTerm === 'archived') return c.isArchived;
    return !c.isArchived && matchesSearch;
  }), [clients, searchTerm]);

  return (
    <div className="saas-card overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="px-8 py-5 text-sm font-bold text-text-muted uppercase tracking-wider">Клієнт</th>
              <th className="px-8 py-5 text-sm font-bold text-text-muted uppercase tracking-wider">Контакти</th>
              <th className="px-8 py-5 text-sm font-bold text-text-muted uppercase tracking-wider">Адреса</th>
              <th className="px-8 py-5 text-sm font-bold text-text-muted uppercase tracking-wider text-right">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredClients.map(c => (
              <tr key={c.id} className={`hover:bg-background/50 transition-colors ${c.isArchived ? 'opacity-50' : ''}`}>
                <td className="px-8 py-5 font-bold text-text-main">{c.name}</td>
                <td className="px-8 py-5">
                  <p className="font-medium text-text-main">{c.phone}</p>
                  <p className="text-sm text-primary font-bold">@{c.instagram}</p>
                </td>
                <td className="px-8 py-5 text-text-muted font-medium truncate max-w-[250px]">{c.address}</td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => onToggleArchive(c)} className="p-3 hover:bg-background/80 rounded-xl transition-colors text-text-muted hover:text-amber-500" title={c.isArchived ? 'Розархівувати' : 'В архів'}>
                      <Clock className="w-5 h-5" />
                    </button>
                    <button onClick={() => onEdit(c)} className="p-3 hover:bg-background/80 rounded-xl transition-colors text-text-muted hover:text-primary"><Edit2 className="w-5 h-5" /></button>
                    <button onClick={() => onDelete(c.id)} className="p-3 hover:bg-rose-50/10 rounded-xl transition-colors text-text-muted hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile List */}
      <div className="md:hidden divide-y divide-border">
        {filteredClients.map(c => (
          <div key={c.id} className={`p-4 flex flex-col gap-3 ${c.isArchived ? 'opacity-50' : ''}`}>
             <div className="flex flex-col">
                <div className="text-base font-black text-text-main">{c.name}</div>
                <div className="flex flex-col gap-1 mt-1">
                  <div className="text-sm font-bold text-primary">@{c.instagram}</div>
                  <div className="text-sm text-text-main">{c.phone}</div>
                  {c.address && <div className="text-[11px] text-text-muted mt-1">{c.address}</div>}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-border pt-3 mt-1">
                <button onClick={() => onToggleArchive(c)} className="flex-1 flex items-center justify-center gap-2 p-3 bg-slate-500/5 rounded-xl text-text-muted font-bold text-xs">
                  <Clock className="w-4 h-4 text-amber-500" /> {c.isArchived ? 'Розархів.' : 'В архів'}
                </button>
                <button onClick={() => onEdit(c)} className="flex-1 flex items-center justify-center gap-2 p-3 bg-primary/5 rounded-xl text-primary font-bold text-xs">
                  <Edit2 className="w-4 h-4" /> Редагувати
                </button>
                <button onClick={() => onDelete(c.id)} className="p-3 bg-rose-500/5 rounded-xl text-rose-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
          </div>
        ))}
      </div>
    </div>
  );
});
