import { Order, OrderItem, Product, Purchase, PurchaseItem, WriteOff, WriteOffItem } from '../types';

export interface InventorySnapshot {
  actualStock: Record<string, number>;
  freeStock: Record<string, number>;
}

export function calculateCostPrices(
  purchaseItems: PurchaseItem[],
  purchases: Purchase[]
): Record<string, number> {
  const costPrices: Record<string, number> = {};
  
  // Sort purchases by date DESC to find the most recent one easily
  const sortedPurchases = [...purchases]
    .filter(p => p.status === 'Проведено' && p.date)
    .sort((a, b) => {
      const db = b.date ? new Date(b.date).getTime() : 0;
      const da = a.date ? new Date(a.date).getTime() : 0;
      return db - da;
    });

  const purchaseById = new Map(sortedPurchases.map(p => [p.id, p]));

  // We want the price from the MOST RECENT purchase.
  // Since sortedPurchases is DESC, we can iterate purchaseItems and keep the first one we find for each product
  for (const purchase of sortedPurchases) {
    const items = purchaseItems.filter(pi => pi.purchaseId === purchase.id && !pi.isDeleted);
    for (const item of items) {
      if (!(item.productId in costPrices)) {
        costPrices[item.productId] = item.costPrice || item.price || 0;
      }
    }
  }

  return costPrices;
}
export function calculateInventorySnapshot(
  products: Product[],
  purchaseItems: PurchaseItem[],
  purchases: Purchase[],
  orderItems: OrderItem[],
  orders: Order[],
  writeOffItems: WriteOffItem[] = [],
  writeOffs: WriteOff[] = []
): InventorySnapshot {
  const actualStock: Record<string, number> = {};

  const purchaseById = new Map(purchases.map(p => [p.id, p]));
  const orderById = new Map(orders.map(o => [o.id, o]));
  const writeOffById = new Map(writeOffs.map(w => [w.id, w]));

  for (const product of products) {
    actualStock[product.id] = 0;
  }

  for (const item of purchaseItems) {
    const purchase = purchaseById.get(item.purchaseId);
    if (!purchase) continue;
    if (purchase.status === 'Проведено') {
      actualStock[item.productId] = (actualStock[item.productId] || 0) + item.qty;
    }
  }

  for (const item of writeOffItems) {
    const writeOff = writeOffById.get(item.writeOffId);
    if (!writeOff) continue;
    if (writeOff.status === 'Проведено') {
      actualStock[item.productId] = (actualStock[item.productId] || 0) - item.qty;
    }
  }

  for (const item of orderItems) {
    const order = orderById.get(item.orderId);
    if (!order) continue;

    if (order.status === 'Виконано') {
      actualStock[item.productId] = (actualStock[item.productId] || 0) - item.qty;
    }
  }

  const freeStock: Record<string, number> = {};
  for (const product of products) {
    freeStock[product.id] = (actualStock[product.id] || 0);
  }

  return { actualStock, freeStock };
}
