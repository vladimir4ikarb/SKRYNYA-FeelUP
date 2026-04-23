import { Product, Order, OrderItem, Purchase, PurchaseItem } from '../types';
import { calculateInventorySnapshot } from './inventoryMath';

export interface InventoryStats {
  physical: number;   // Actual in warehouse
  reserved: number;   // In processing
  available: number;  // available = physical - reserved
  expected: number;   // In transit
}

/**
 * Calculates inventory status for products based on documents.
 * Uses the unified calculateInventorySnapshot for consistency.
 */
export const calculateInventory = (
  products: Product[],
  orders: Order[],
  orderItems: OrderItem[],
  purchases: Purchase[],
  purchaseItems: PurchaseItem[]
): Record<string, InventoryStats> => {
  const snapshot = calculateInventorySnapshot(products, purchaseItems, purchases, orderItems, orders);
  const inventory: Record<string, InventoryStats> = {};

  products.forEach(p => {
    inventory[p.id] = {
      physical: snapshot.actualStock[p.id] || 0,
      reserved: snapshot.reservedStock[p.id] || 0,
      available: snapshot.freeStock[p.id] || 0,
      expected: snapshot.expectedStock[p.id] || 0
    };
  });

  return inventory;
};

