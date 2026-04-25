import { useMemo } from 'react';
import { Product, Client, Order, OrderItem, Purchase, PurchaseItem, Expense, HeliumTank, AppUser, TechnicalSpec } from '../types';

export function useAppAnalytics(
  products: Product[],
  clients: Client[],
  orders: Order[],
  orderItems: OrderItem[],
  purchases: Purchase[],
  purchaseItems: PurchaseItem[],
  expenses: Expense[],
  heliumTanks: HeliumTank[],
  techSpecs: TechnicalSpec[],
  freeStock: Record<string, number>
) {
  const orderTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    orderItems.forEach(oi => {
      totals[oi.orderId] = (totals[oi.orderId] || 0) + (oi.qty * oi.price);
    });
    return totals;
  }, [orderItems]);

  const purchaseTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    purchaseItems.forEach(pi => {
      const unitCost = pi.costPrice ?? pi.price ?? 0;
      totals[pi.purchaseId] = (totals[pi.purchaseId] || 0) + (pi.qty * unitCost);
    });
    purchases.forEach(p => {
      if (p.deliveryCost) totals[p.id] = (totals[p.id] || 0) + p.deliveryCost;
    });
    return totals;
  }, [purchaseItems, purchases]);

  const dashboardStats = useMemo(() => {
    const pMap = new Map(products.map(p => [p.id, p]));
    const ordMap = new Map(orders.map(o => [o.id, o]));

    const completedOrders = orders.filter(o => o.status === 'Виконано');
    const totalIncome = completedOrders.reduce((acc, o) => acc + (orderTotals[o.id] || 0), 0);
    
    const cogs = orderItems.reduce((acc, oi) => {
      const order = ordMap.get(oi.orderId);
      if (order?.status !== 'Виконано') return acc;
      const product = pMap.get(oi.productId);
      const cost = (product?.costPrice || 0) * oi.qty;
      return acc + cost;
    }, 0);

    const orderExtraCosts = completedOrders.reduce((acc, o) => acc + (o.extraCosts || 0), 0);
    const grossProfit = totalIncome - cogs - orderExtraCosts;

    const paidPurchases = purchases.filter(p => p.status === 'Проведено');
    const totalPurchaseCost = paidPurchases.reduce((acc, p) => acc + (purchaseTotals[p.id] || 0), 0);
    const totalOperationalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    
    const totalExpenses = totalPurchaseCost + totalOperationalExpenses + orderExtraCosts;
    const netProfit = totalIncome - totalExpenses;

    const totalOrdersCount = completedOrders.length;
    const avgCheck = totalOrdersCount > 0 ? Math.round(totalIncome / totalOrdersCount) : 0;
    const heliumBalance = heliumTanks.reduce((acc, t) => acc + t.currentVolumeM3, 0);

    return { 
      totalIncome, 
      totalExpenses, 
      grossProfit,
      netProfit,
      totalOrders: orders.length, 
      avgCheck, 
      heliumBalance 
    };
  }, [orders, orderTotals, purchases, purchaseTotals, expenses, orderItems, products, heliumTanks]);

  const chartData = useMemo(() => {
    const pMap = new Map(products.map(p => [p.id, p]));
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayOrders = orders.filter(o => 
        o.date && 
        typeof o.date === 'string' && 
        o.date.startsWith(date) && 
        o.status === 'Виконано'
      );
      
      const dayOrderIds = new Set(dayOrders.map(o => o.id));
      const dayRevenue = dayOrders.reduce((acc, o) => acc + (orderTotals[o.id] || 0), 0);
      
      const dayCOGS = orderItems.reduce((acc, oi) => {
        if (!dayOrderIds.has(oi.orderId)) return acc;
        const product = pMap.get(oi.productId);
        const cost = (product?.costPrice || 0) * oi.qty;
        return acc + cost;
      }, 0);

      const dayExtraCosts = dayOrders.reduce((acc, o) => acc + (o.extraCosts || 0), 0);

      return {
        name: new Date(date).toLocaleDateString('uk-UA', { weekday: 'short' }),
        value: dayRevenue - dayCOGS - dayExtraCosts
      };
    });
  }, [orders, orderTotals, products, orderItems]);

  const stockAlerts = useMemo(() => {
    return products.filter(p => !p.isArchived && (freeStock[p.id] || 0) <= (p.minStock || 5));
  }, [products, freeStock]);

  return { orderTotals, purchaseTotals, dashboardStats, chartData, stockAlerts };
}
