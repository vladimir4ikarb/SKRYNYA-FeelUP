import React from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { StatCard } from './StatCard';
import { HeliumTankCard } from './HeliumTankCard';
import { ProfitChart } from './ProfitChart';
import { StockAlerts } from './StockAlerts';
import { RecentOrders } from './RecentOrders';

interface DashboardViewProps {
  dashboardStats: any;
  chartData: any[];
  stockAlerts: any[];
  inventory: any;
  orders: any[];
  clients: any[];
  orderTotals: Record<string, number>;
  setActiveTab: (tab: any) => void;
  setIsHeliumModalOpen: (v: boolean) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  dashboardStats,
  chartData,
  stockAlerts,
  inventory,
  orders,
  clients,
  orderTotals,
  setActiveTab,
  setIsHeliumModalOpen
}) => {
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Left/Main Column */}
        <div className="lg:col-span-8 flex flex-col gap-4 lg:gap-6">
          {/* Mobile Stats Section */}
          <div className="lg:hidden flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-text-main leading-tight">FEEL UP Studio</h2>
                <p className="text-text-muted text-[9px] font-bold uppercase tracking-wider">Business System</p>
              </div>
            </div>
            
            <HeliumTankCard balance={dashboardStats.heliumBalance} onCalibrate={() => setIsHeliumModalOpen(true)} />
            
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Чистий прибуток" value={`${dashboardStats.netProfit} ₴`} icon={Wallet} color="bg-indigo-600" trend="Прибуток" up={dashboardStats.netProfit >= 0} />
              <StatCard label="Дохід" value={`${dashboardStats.totalIncome} ₴`} icon={ArrowUpRight} color="bg-emerald-500" trend="Виручка" up={true} />
              <StatCard label="Витрати" value={`${dashboardStats.totalExpenses} ₴`} icon={ArrowDownRight} color="bg-rose-500" trend="Усього" up={false} />
              <StatCard label="Сер. чек" value={`${dashboardStats.avgCheck} ₴`} icon={TrendingUp} color="bg-amber-500" trend="Замовлення" up={true} />
            </div>
          </div>

          {/* Desktop Stats */}
          <div className="hidden lg:grid grid-cols-4 gap-4">
            <StatCard label="Чистий прибуток" value={`${dashboardStats.netProfit} ₴`} icon={Wallet} color="bg-indigo-600" trend="Після витрат" up={dashboardStats.netProfit >= 0} isLarge />
            <StatCard label="Дохід" value={`${dashboardStats.totalIncome} ₴`} icon={ArrowUpRight} color="bg-emerald-500" trend="Виручка" up={true} isLarge />
            <StatCard label="Витрати" value={`${dashboardStats.totalExpenses} ₴`} icon={ArrowDownRight} color="bg-rose-500" trend="Усього" up={false} isLarge />
            <StatCard label="Сер. чек" value={`${dashboardStats.avgCheck} ₴`} icon={TrendingUp} color="bg-amber-500" trend="Ефективність" up={true} isLarge />
          </div>

          <div className="h-[380px] lg:h-[450px]">
            <ProfitChart data={chartData} />
          </div>
        </div>

        {/* Right/Side Column */}
        <div className="lg:col-span-4 flex flex-col gap-4 lg:gap-6">
          <div className="hidden lg:block">
            <HeliumTankCard balance={dashboardStats.heliumBalance} onCalibrate={() => setIsHeliumModalOpen(true)} />
          </div>
          
          <StockAlerts alerts={stockAlerts} inventory={inventory} />

          <div className="hidden lg:block h-full">
            <RecentOrders 
              orders={orders} 
              clients={clients} 
              orderTotals={orderTotals} 
              onViewAll={() => setActiveTab('sales')} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};
