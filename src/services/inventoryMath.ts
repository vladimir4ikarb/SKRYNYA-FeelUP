import { Order, OrderItem, Product, Purchase, PurchaseItem } from '../types';

export interface InventorySnapshot {
  actualStock: Record<string, number>;
  reservedStock: Record<string, number>;
  freeStock: Record<string, number>;
  expectedStock: Record<string, number>; // Purchases in progress
}

export function calculateInventorySnapshot(
  products: Product[],
  purchaseItems: PurchaseItem[],
  purchases: Purchase[],
  orderItems: OrderItem[],
  orders: Order[]
): InventorySnapshot {
  const actualStock: Record<string, number> = {};
  const reservedStock: Record<string, number> = {};
  const expectedStock: Record<string, number> = {};

  const purchaseById = new Map(purchases.map(p => [p.id, p]));
  const orderById = new Map(orders.map(o => [o.id, o]));

  for (const product of products) {
    actualStock[product.id] = 0;
    reservedStock[product.id] = 0;
    expectedStock[product.id] = 0;
  }

  // 1. Process Purchases
  for (const item of purchaseItems) {
    if (item.isDeleted) continue;
    const purchase = purchaseById.get(item.purchaseId);
    if (!purchase || purchase.isDeleted || purchase.status === 'Скасовано') continue;

    if (purchase.status === 'Оплачено' || purchase.status === 'Борг') {
      actualStock[item.productId] = (actualStock[item.productId] || 0) + item.qty;
    } else if (purchase.status === 'Обробляється') {
      expectedStock[item.productId] = (expectedStock[item.productId] || 0) + item.qty;
    }
  }

  // 2. Process Orders
  for (const item of orderItems) {
    if (item.isDeleted) continue;
    const order = orderById.get(item.orderId);
    if (!order || order.isDeleted || order.status === 'Скасовано') continue;

    if (order.status === 'Виконано') {
      // Actual removal includes defect
      actualStock[item.productId] = (actualStock[item.productId] || 0) - (item.qty + (item.defect || 0));
    } else if (order.status === 'В обробці') {
      // Reserved includes ONLY qty (defect is unknown until fulfilled)
      reservedStock[item.productId] = (reservedStock[item.productId] || 0) + item.qty;
    }
    // 'Чернетка' is ignored for stock logic
  }

  const freeStock: Record<string, number> = {};
  for (const product of products) {
    freeStock[product.id] = (actualStock[product.id] || 0) - (reservedStock[product.id] || 0);
  }

  return { actualStock, reservedStock, freeStock, expectedStock };
}
