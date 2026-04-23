import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  ClipboardCheck, 
  Settings, 
  TrendingUp, 
  HelpCircle, 
  LogOut,
  Moon,
  Sun,
  X,
  Activity,
  Info
} from 'lucide-react';
import { FirebaseUser, AppUser } from '../../types';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  user: FirebaseUser;
  currentUserData: AppUser | null;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onSignOut: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ 
  activeTab, 
  onTabChange, 
  user, 
  currentUserData, 
  isDarkMode,
  onToggleTheme,
  onSignOut,
  isOpen,
  onClose
}: SidebarProps) => {
  const handleTabSelect = (tab: string) => {
    onTabChange(tab);
    if (onClose) onClose();
  };

  const sidebarContent = (
    <div className="w-64 lg:w-72 bg-sidebar h-screen flex flex-col p-4 lg:p-6 shrink-0 shadow-2xl lg:shadow-none border-r border-slate-800 lg:border-none overflow-y-auto no-scrollbar">
      <div className="flex items-center justify-between mb-10 px-2 lg:block">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/5 rounded-2xl flex items-center justify-center p-2.5 border border-white/10">
            <img src="/feelup-icon.svg" className="w-full h-full object-contain" alt="FEEL UP" />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-xl lg:text-2xl font-black tracking-tighter leading-none sidebar-logo">
              FEEL UP
            </h1>
            <p className="text-[8px] lg:text-[10px] font-bold tracking-[0.15em] mt-1.5 leading-none uppercase text-slate-500">
              студія аеродизайну
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="mb-4 px-3">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.1em] mb-4">Головне меню</p>
        <nav className="space-y-1">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Дашборд' },
            { id: 'products', icon: Package, label: 'Склад' },
            { id: 'sales', icon: ShoppingCart, label: 'Продажі' },
            { id: 'clients', icon: Users, label: 'Клієнти' },
            { id: 'expenses', icon: TrendingUp, label: 'Витрати' },
            { id: 'purchases', icon: ClipboardCheck, label: 'Закупівлі' },
            { id: 'specs', icon: Settings, label: 'Норми' },
            { id: 'audit', icon: Activity, label: 'Аудит' },
            currentUserData?.role === 'admin' && { id: 'admin', icon: Users, label: 'Адмін' },
          ].filter(Boolean).map((item: any) => (
            <button
              key={item.id}
              onClick={() => handleTabSelect(item.id)}
              className={`nav-link w-full ${activeTab === item.id ? 'active' : ''}`}
            >
              <item.icon />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
        <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
            {isDarkMode ? <Moon className="w-4 h-4 text-violet-electric" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span className="text-xs font-bold text-slate-300">Тема</span>
          </div>
          <button 
            onClick={onToggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isDarkMode ? 'bg-violet-electric' : 'bg-slate-700'}`}
          >
            <span className={`${isDarkMode ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
          </button>
        </div>

        <div className="flex items-center gap-3 p-2 bg-white/5 rounded-2xl border border-white/5">
          <img src={user.photoURL || ''} className="w-10 h-10 rounded-xl border border-white/10" alt="" />
          <div className="overflow-hidden">
            <p className="text-white font-bold truncate text-xs">{user.displayName}</p>
            <p className="text-slate-500 text-[10px] truncate">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleTabSelect('info')}
            className={`nav-link justify-center px-0 py-2.5 ${activeTab === 'info' ? 'active' : 'bg-white/5'}`}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button onClick={onSignOut} className="nav-link justify-center px-0 py-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 sticky top-0 h-screen shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <div className={`lg:hidden fixed inset-0 z-50 transition-visibility duration-300 ${isOpen ? 'visible' : 'invisible'}`}>
        <div 
          className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={onClose}
        />
        <div className={`absolute inset-y-0 left-0 transition-transform duration-300 ease-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {sidebarContent}
        </div>
      </div>
    </>
  );
};
