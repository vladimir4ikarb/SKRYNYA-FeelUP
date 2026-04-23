import { Order, OrderItem, Product, Purchase, PurchaseItem } from '../types';

export interface InventorySnapshot {
  actualStock: Record<string, number>;
  reservedStock: Record<string, number>;
  freeStock: Record<string, number>;
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

  const purchaseById = new Map(purchases.map(p => [p.id, p]));
  const orderById = new Map(orders.map(o => [o.id, o]));

  for (const product of products) {
    actualStock[product.id] = 0;
    reservedStock[product.id] = 0;
  }

  for (const item of purchaseItems) {
    const purchase = purchaseById.get(item.purchaseId);
    if (!purchase) continue;
    if (purchase.status === 'Оплачено' || purchase.status === 'Борг') {
      actualStock[item.productId] = (actualStock[item.productId] || 0) + item.qty;
    }
  }

  for (const item of orderItems) {
    const order = orderById.get(item.orderId);
    if (!order) continue;

    if (order.status === 'Виконано') {
      actualStock[item.productId] = (actualStock[item.productId] || 0) - (item.qty + (item.defect || 0));
    }

    if (order.status === 'В обробці') {
      reservedStock[item.productId] = (reservedStock[item.productId] || 0) + item.qty;
    }
  }

  const freeStock: Record<string, number> = {};
  for (const product of products) {
    freeStock[product.id] = (actualStock[product.id] || 0) - (reservedStock[product.id] || 0);
  }

  return { actualStock, reservedStock, freeStock };
}
