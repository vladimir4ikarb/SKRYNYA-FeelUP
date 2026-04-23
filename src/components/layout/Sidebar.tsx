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
  X
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
    <div className="w-64 lg:w-64 bg-sidebar/95 backdrop-blur-xl h-screen flex flex-col p-3 lg:p-4 shrink-0 shadow-2xl lg:shadow-none border-r border-white/10 lg:border-none overflow-y-auto">
      <div className="flex items-center justify-between mb-4 lg:mb-8 px-2 lg:block">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 lg:w-10 lg:h-10 flex-shrink-0">
            <img src="/feelup-icon.svg" className="w-full h-full object-contain" alt="FEEL UP" />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-lg lg:text-2xl font-head font-semibold tracking-tight leading-none" style={{ color: '#70489d' }}>
              FEEL UP
            </h1>
            <p className="text-[7px] lg:text-[9px] font-medium tracking-[0.1em] uppercase mt-0.5 lg:mt-1 leading-none whitespace-nowrap" style={{ color: '#7c8b98' }}>
              СТУДІЯ АЕРОДИЗАЙНУ
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-0.5">
        {[
          { id: 'dashboard', icon: LayoutDashboard, label: 'Дашборд' },
          { id: 'products', icon: Package, label: 'Склад' },
          { id: 'sales', icon: ShoppingCart, label: 'Продажі' },
          { id: 'clients', icon: Users, label: 'Клієнти' },
          { id: 'expenses', icon: TrendingUp, label: 'Витрати' },
          { id: 'purchases', icon: ClipboardCheck, label: 'Закупівлі' },
          { id: 'specs', icon: Settings, label: 'Норми' },
          currentUserData?.role === 'admin' && { id: 'admin', icon: Users, label: 'Адмін' },
        ].filter(Boolean).map((item: any) => (
          <button
            key={item.id}
            onClick={() => handleTabSelect(item.id)}
            className={`sidebar-item w-full py-1.5 lg:py-2.5 px-3 ${activeTab === item.id ? 'sidebar-item-active' : ''}`}
          >
            <item.icon className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="text-xs lg:text-base">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-3 border-t border-white/10 flex flex-col gap-0.5 lg:gap-1">
        <div className="flex items-center justify-between px-3 py-1.5 lg:py-2 mb-1 lg:mb-2 bg-white/5 backdrop-blur rounded-xl">
          <div className="flex items-center gap-2">
            {isDarkMode ? <Moon className="w-3 h-3 lg:w-4 lg:h-4 text-primary" /> : <Sun className="w-3 h-3 lg:w-4 lg:h-4 text-amber-500" />}
            <span className="text-[10px] lg:text-xs font-semibold text-slate-300">{isDarkMode ? 'Темна' : 'Світла'}</span>
          </div>
          <button 
            onClick={onToggleTheme}
            className={`relative inline-flex h-5 lg:h-6 w-9 lg:w-11 items-center rounded-full transition-colors ${isDarkMode ? 'bg-primary' : 'bg-slate-700'}`}
          >
            <span
              className={`${
                isDarkMode ? 'translate-x-5 lg:translate-x-6' : 'translate-x-1'
              } inline-block h-3 lg:h-4 w-3 lg:w-4 transform rounded-full bg-white transition-transform`}
            />
          </button>
        </div>

        <div className="flex items-center gap-2 p-1.5 lg:p-2 mb-0.5">
          <img src={user.photoURL || ''} className="w-6 h-6 lg:w-9 lg:h-9 rounded-lg lg:rounded-xl border border-white/10" alt="" />
          <div className="overflow-hidden">
            <p className="text-white font-semibold truncate text-[9px] lg:text-[12px]">{user.displayName}</p>
            <p className="text-slate-500 text-[7px] lg:text-[10px] truncate">{user.email}</p>
          </div>
        </div>

        <button
          onClick={() => handleTabSelect('info')}
          className={`sidebar-item w-full py-1.5 lg:py-2.5 px-3 mb-0.5 ${activeTab === 'info' ? 'sidebar-item-active' : ''}`}
        >
          <HelpCircle className="w-4 h-4 lg:w-5 lg:h-5" />
          <span className="text-xs lg:text-base text-slate-400">Про проект</span>
        </button>

        <button 
          onClick={onSignOut} 
          className="sidebar-item w-full text-slate-400 hover:text-white py-1.5 lg:py-2 px-3"
        >
          <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
          <span className="text-xs lg:text-base text-red-400">Вийти</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex w-64 sticky top-0 h-screen shrink-0">
        {sidebarContent}
      </aside>

      <div className={`lg:hidden fixed inset-0 z-50 transition-visibility duration-300 ${isOpen ? 'visible' : 'invisible'}`}>
        <div 
          className={`absolute inset-0 bg-sidebar/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={onClose}
        />
        <div className={`absolute inset-y-0 left-0 transition-transform duration-300 ease-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {sidebarContent}
        </div>
      </div>
    </>
  );
};