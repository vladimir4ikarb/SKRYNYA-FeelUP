import { useMemo } from 'react';
import { Product, PurchaseItem, Purchase, OrderItem, Order } from '../types';
import { calculateInventorySnapshot, InventorySnapshot } from '../services/inventoryMath';

export function useInventory(
  products: Product[],
  purchaseItems: PurchaseItem[],
  purchases: Purchase[],
  orderItems: OrderItem[],
  orders: Order[]
): InventorySnapshot {
  return useMemo(
    () => calculateInventorySnapshot(products, purchaseItems, purchases, orderItems, orders),
    [products, purchaseItems, purchases, orderItems, orders]
  );
}
