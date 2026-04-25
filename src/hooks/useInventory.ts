import { useMemo } from 'react';
import { Product, PurchaseItem, Purchase, OrderItem, Order, WriteOff, WriteOffItem } from '../types';
import { calculateInventorySnapshot, InventorySnapshot } from '../services/inventoryMath';

export function useInventory(
  products: Product[],
  purchaseItems: PurchaseItem[],
  purchases: Purchase[],
  orderItems: OrderItem[],
  orders: Order[],
  writeOffItems: WriteOffItem[] = [],
  writeOffs: WriteOff[] = []
): InventorySnapshot {
  return useMemo(
    () => calculateInventorySnapshot(products, purchaseItems, purchases, orderItems, orders, writeOffItems, writeOffs),
    [products, purchaseItems, purchases, orderItems, orders, writeOffItems, writeOffs]
  );
}
