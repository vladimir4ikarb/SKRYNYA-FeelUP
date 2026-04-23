import React from 'react';
import { Trash2, RefreshCw, Download, Package, Edit2 } from 'lucide-react';
import { AppUser } from '../../types';

interface AdminTabProps {
  users: AppUser[];
  onEditUser: (u: AppUser) => void;
  onClearOldLogs: () => void;
  onClearWarehouse: () => void;
  onTriggerBackup: () => void;
  backups: any[];
  trashItems: any[];
  onRestoreItem: (id: string, col: string) => void;
  isSubmitting: boolean;
  showConfirmWarehouse: boolean;
  setShowConfirmWarehouse: (show: boolean) => void;
}

export const AdminTab = ({
  users,
  onEditUser,
  onClearOldLogs,
  onClearWarehouse,
  onTriggerBackup,
  backups,
  trashItems,
  onRestoreItem,
  isSubmitting,
  showConfirmWarehouse,
  setShowConfirmWarehouse
}: AdminTabProps) => {
  return (
    <div className="space-y-8">
      <div className="saas-card overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-card border-b border-slate-100">
            <tr>
              <th className="px-4 lg:px-8 py-3 lg:py-5 text-[10px] lg:text-sm font-bold text-slate-400 uppercase tracking-wider">Ім'я</th>
              <th className="px-4 lg:px-8 py-3 lg:py-5 text-[10px] lg:text-sm font-bold text-slate-400 uppercase tracking-wider">Email</th>
              <th className="px-4 lg:px-8 py-3 lg:py-5 text-[10px] lg:text-sm font-bold text-slate-400 uppercase tracking-wider">Роль</th>
              <th className="px-4 lg:px-8 py-3 lg:py-5 text-[10px] lg:text-sm font-bold text-slate-400 uppercase tracking-wider text-right">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-card/50 transition-colors">
                <td className="px-4 lg:px-8 py-3 lg:py-5 font-bold text-slate-900 text-xs lg:text-sm">{u.displayName}</td>
                <td className="px-4 lg:px-8 py-3 lg:py-5 text-slate-500 font-medium text-xs lg:text-sm">{u.email}</td>
                <td className="px-4 lg:px-8 py-3 lg:py-5">
                  <span className={`badge py-0.5 px-2 text-[10px] lg:text-xs ${u.role === 'admin' ? 'badge-success' : u.role === 'manager' ? 'badge-warning' : 'badge-danger'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 lg:px-8 py-3 lg:py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => onEditUser(u)} className="p-2 lg:p-3 hover:bg-card rounded-xl transition-colors text-slate-400 hover:text-primary"><Edit2 className="w-4 h-4 lg:w-5 lg:h-5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-12 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 border-y border-slate-100">
          <h3 className="text-lg lg:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Trash2 className="w-5 h-5 lg:w-6 lg:h-6 text-slate-400" /> Небезпечна зона
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={onClearOldLogs} 
              disabled={isSubmitting}
              className="text-[10px] lg:text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-2 transition-colors disabled:opacity-50 border border-red-100 p-2 rounded-xl bg-red-50/30 sm:border-none sm:p-0 sm:bg-transparent"
            >
              <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" /> Очистити логи ({'>'}30 днів)
            </button>
            {!showConfirmWarehouse ? (
              <button 
                onClick={() => setShowConfirmWarehouse(true)} 
                disabled={isSubmitting}
                className="text-[10px] lg:text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-2 lg:py-1.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-rose-100 disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" /> ОЧИСТИТИ СКЛАД
              </button>
            ) : (
              <div className="flex items-center justify-between gap-2 bg-rose-50 p-2 rounded-xl border border-rose-100">
                <span className="text-[9px] font-bold text-rose-600 px-2 uppercase">Ви впевнені?</span>
                <div className="flex gap-2">
                  <button onClick={onClearWarehouse} disabled={isSubmitting} className="px-3 py-1 bg-rose-600 text-white text-[9px] font-bold rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50">ТАК</button>
                  <button onClick={() => setShowConfirmWarehouse(false)} disabled={isSubmitting} className="px-3 py-1 bg-slate-200 text-slate-700 text-[9px] font-bold rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50">НІ</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 
        <div className="bg-white p-4 lg:p-8 rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 gap-4">
            <div>
              <h3 className="text-lg lg:text-xl font-bold text-slate-900 flex items-center gap-3">
                <RefreshCw className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-500" /> Автоматичні бекапи
              </h3>
              <p className="text-xs lg:text-sm text-slate-500 mt-1">Резервні копії створюються щоночі та зберігаються 7 днів</p>
            </div>
            <button onClick={onTriggerBackup} disabled={isSubmitting} className="bg-indigo-600 text-white px-4 lg:px-6 py-2 rounded-xl font-bold text-xs lg:text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50">
              <Download className="w-3 h-3 lg:w-4 lg:h-4" /> Бекап зараз
            </button>
          </div>
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left min-w-[500px]">
              <thead className="bg-card border-b border-slate-100">
                <tr>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-wider">Файл</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-wider">Дата</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-wider">Розмір</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-right text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-wider">Дія</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {backups.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400 font-medium italic text-xs">Копій ще не створено</td></tr>
                ) : backups.map(backup => (
                  <tr key={backup.name} className="hover:bg-card/50 transition-colors">
                    <td className="px-4 lg:px-6 py-3 lg:py-4 font-bold text-slate-900 flex items-center gap-2 text-xs lg:text-sm"><Package className="w-3 h-3 text-slate-400" /> {backup.name}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-slate-500 text-[10px] lg:text-sm">{new Date(backup.date).toLocaleDateString('uk-UA')}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-slate-500 text-[10px] lg:text-sm">{(backup.size / 1024).toFixed(1)} KB</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                      <a href={`/api/backups/download/${backup.name}`} download className="text-[10px] lg:text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-1">Скачати <Download className="w-2.5 h-2.5" /></a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        */}

        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Trash2 className="w-6 h-6 text-slate-400" /> Кошик (видалені записи)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trashItems.length === 0 && <p className="text-slate-400 italic col-span-full">Кошик порожній</p>}
            {trashItems.map(item => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item._collection}</span>
                    <span className="text-[10px] font-bold text-slate-300">ID: {item.id.slice(0, 8)}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-1 truncate">{item.name || item.supplierName || item.supplier || `Замовлення від ${item.date}`}</h4>
                  <p className="text-xs text-slate-500 truncate">{item.phone || item.category || item.status}</p>
                </div>
                <button onClick={() => onRestoreItem(item.id, item._collection)} className="mt-4 w-full py-2 bg-card hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                  <RefreshCw className="w-3 h-3" /> Відновити
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
