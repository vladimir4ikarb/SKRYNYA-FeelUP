import React from 'react';
import { Search, Bell, Menu, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (v: boolean) => void;
  stockAlerts: any[];
  freeStock: Record<string, number>;
  setActiveTab: (tab: any) => void;
  setIsSidebarOpen: (v: ((prev: boolean) => boolean) | boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  searchTerm,
  setSearchTerm,
  isNotificationsOpen,
  setIsNotificationsOpen,
  stockAlerts,
  freeStock,
  setActiveTab,
  setIsSidebarOpen
}) => {
  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'FEEL UP - студія аеродизайну';
      case 'products': return 'Управління складом';
      case 'sales': return 'Журнал продажів';
      case 'clients': return 'База клієнтів';
      case 'purchases': return 'Закупівлі';
      case 'expenses': return 'Фінансові витрати';
      case 'info': return 'Про програму';
      default: return 'Технічні норми';
    }
  };

  const getSubtitle = () => {
    if (activeTab === 'dashboard') return '';
    if (activeTab === 'info') return 'Як працює ваш FEEL UP';
    return 'Ось що відбувається сьогодні';
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className="lg:hidden p-2 bg-card border border-border rounded-xl text-text-muted hover:text-primary transition-all"
          >
            <Menu className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
        </div>
        
        <div className="flex lg:hidden items-center gap-2 flex-1 justify-end">
          <div className="relative flex-1 max-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Пошук..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 bg-card border border-border rounded-xl w-full focus:ring-2 focus:ring-primary/10 outline-none transition-all text-xs text-text-main"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`p-2 bg-card border rounded-xl transition-all relative shrink-0 ${isNotificationsOpen ? 'border-primary text-primary ring-2 ring-primary/10' : 'border-border text-text-muted hover:text-primary hover:border-primary'}`}
            >
              <Bell className="w-5 h-5" />
              {stockAlerts.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border border-white rounded-full"></span>
              )}
            </button>

            {isNotificationsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                <div className="absolute right-0 mt-3 w-[calc(100vw-32px)] sm:w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-border bg-card/50 flex items-center justify-between">
                    <h3 className="font-bold text-sm text-text-main">Сповіщення</h3>
                    <span className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full text-[10px] font-black">{stockAlerts.length}</span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto p-2">
                    {stockAlerts.length === 0 ? (
                      <div className="py-8 text-center text-text-muted">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-xs">Немає нових сповіщень</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="px-2 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">Критичні залишки</p>
                        {stockAlerts.map(product => (
                          <button 
                            key={product.id}
                            onClick={() => {
                              setSearchTerm(product.name);
                              setActiveTab('products');
                              setIsNotificationsOpen(false);
                            }}
                            className="w-full p-3 hover:bg-background border border-transparent hover:border-border rounded-xl transition-all flex items-center justify-between group text-left"
                          >
                            <div>
                              <p className="text-xs font-bold text-text-main group-hover:text-primary transition-colors">{product.name}</p>
                              <p className="text-[10px] text-text-muted">{product.size} {product.color}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-black text-rose-500">{freeStock[product.id] || 0}</p>
                              <p className="text-[8px] text-text-muted uppercase">шт</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-card/50 border-t border-border">
                    <button 
                      onClick={() => { setActiveTab('products'); setIsNotificationsOpen(false); }}
                      className="w-full py-2 text-[10px] font-bold text-primary hover:underline"
                    >
                      Перейти до складу
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="hidden lg:block">
          <h2 className="text-xl lg:text-2xl font-bold text-text-main mb-0.5">
            {getTitle()}
          </h2>
          <p className="text-text-muted text-sm lg:text-base">
            {getSubtitle()}
          </p>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-3">
        <div className="relative flex-1 md:flex-none">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Швидкий пошук..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl w-full md:w-64 focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm text-text-main"
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`p-3 bg-card border rounded-xl transition-all relative shrink-0 ${isNotificationsOpen ? 'border-primary text-primary ring-2 ring-primary/10' : 'border-border text-text-muted hover:text-primary hover:border-primary'}`}
          >
            <Bell className="w-5 h-5" />
            {stockAlerts.length > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
              <div className="absolute right-0 mt-3 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-4 border-b border-border bg-card/50 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-text-main">Сповіщення</h3>
                  <span className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full text-[10px] font-black">{stockAlerts.length}</span>
                </div>
                <div className="max-h-[400px] overflow-y-auto p-2">
                  {stockAlerts.length === 0 ? (
                    <div className="py-8 text-center text-text-muted">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="text-xs">Немає нових сповіщень</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="px-2 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">Критичні залишки</p>
                      {stockAlerts.map(product => (
                        <button 
                          key={product.id}
                          onClick={() => {
                            setSearchTerm(product.name);
                            setActiveTab('products');
                            setIsNotificationsOpen(false);
                          }}
                          className="w-full p-3 hover:bg-background border border-transparent hover:border-border rounded-xl transition-all flex items-center justify-between group text-left"
                        >
                          <div>
                            <p className="text-xs font-bold text-text-main group-hover:text-primary transition-colors">{product.name}</p>
                            <p className="text-[10px] text-text-muted">{product.size} {product.color}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-rose-500">{freeStock[product.id] || 0}</p>
                            <p className="text-[8px] text-text-muted uppercase">шт</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-3 bg-card/50 border-t border-border">
                  <button 
                    onClick={() => { setActiveTab('products'); setIsNotificationsOpen(false); }}
                    className="w-full py-2 text-[10px] font-bold text-primary hover:underline"
                  >
                    Перейти до складу
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
