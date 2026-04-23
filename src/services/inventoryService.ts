import { Product, Order, OrderItem, Purchase, PurchaseItem } from '../types';

export interface InventoryStats {
  physical: number;   // Actual in warehouse: Initial + Received Purchases - Fulfilled Orders
  reserved: number;   // In processing: Orders ('В обробці', 'Чернетка'?)
  available: number;  // available = physical - reserved
  expected: number;   // In transit: Purchases ('Обробляється')
}

/**
 * Calculates inventory status for products based on documents.
 */
export const calculateInventory = (
  products: Product[],
  orders: Order[],
  orderItems: OrderItem[],
  purchases: Purchase[],
  purchaseItems: PurchaseItem[]
): Record<string, InventoryStats> => {
  const inventory: Record<string, InventoryStats> = {};

  // Initialize with 0s
  products.forEach(p => {
    inventory[p.id] = {
      physical: 0,
      reserved: 0,
      available: 0,
      expected: 0
    };
  });

  // 1. Process Purchases
  const purchaseMap = new Map(purchases.map(p => [p.id, p]));
  purchaseItems.forEach(pi => {
    const purchase = purchaseMap.get(pi.purchaseId);
    const stats = inventory[pi.productId];
    if (!purchase || purchase.status === 'Скасовано' || purchase.status === 'Чернетка' || !stats) return;

    if (purchase.status === 'Оплачено' || purchase.status === 'Борг') {
      stats.physical += pi.qty;
    } else if (purchase.status === 'Обробляється') {
      stats.expected += pi.qty;
    }
  });

  // 2. Process Orders
  const orderMap = new Map(orders.map(o => [o.id, o]));
  orderItems.forEach(oi => {
    const order = orderMap.get(oi.orderId);
    const stats = inventory[oi.productId];
    if (!order || order.status === 'Скасовано' || !stats) return;

    const totalQty = oi.qty + (oi.defect || 0);

    if (order.status === 'Виконано') {
      stats.physical -= totalQty;
    } else if (order.status === 'В обробці' || order.status === 'Чернетка') {
      stats.reserved += totalQty;
    }
  });

  // 3. Finalize Available
  Object.keys(inventory).forEach(id => {
    inventory[id].available = inventory[id].physical - inventory[id].reserved;
  });

  return inventory;
};
