import { 
  Firestore, 
  collection, 
  doc, 
  addDoc, 
  runTransaction, 
  serverTimestamp,
  query,
  limit,
  getDocs
} from 'firebase/firestore';
import { Order, OrderItem, Product, TechnicalSpec } from '../types';
import { calculateFreeStockInTransaction } from './inventoryTransactionService';

export const orderService = {
  /**
   * Creates a new order with multiple items in a single transaction.
   * Handles stock reservation and helium deduction.
   */
  async createOrder(
    db: Firestore,
    orderData: Partial<Order>,
    items: { productId: string; qty: number; price: number; defect: number }[],
    techSpecs: TechnicalSpec[],
    logAction: (action: string, details: any) => Promise<void>
  ) {
    const totalAmount = items.reduce((acc, item) => acc + (item.qty * item.price), 0);
    const finalOrderData = {
      ...orderData,
      totalAmount,
      isDeleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Keep legacy fields during transition
    if (finalOrderData.deliveryDate) (finalOrderData as any).delivery = finalOrderData.deliveryDate;
    if (finalOrderData.managerId) (finalOrderData as any).manager = finalOrderData.managerId;

    return await runTransaction(db, async (transaction) => {
      const orderRef = doc(collection(db, 'orders'));
      transaction.set(orderRef, finalOrderData);

      const heliumQuery = query(collection(db, 'helium'), limit(1));
      const heliumSnap = await getDocs(heliumQuery);

      for (const item of items) {
        // 1. Check stock if needed
        if (finalOrderData.status === 'Виконано' || finalOrderData.status === 'В обробці') {
          const stock = await calculateFreeStockInTransaction(db, transaction, item.productId);
          const requested = finalOrderData.status === 'Виконано' ? (item.qty + (item.defect || 0)) : item.qty;
          
          if (requested > stock.free) {
            throw new Error(`Недостатньо вільного залишку для товару ${item.productId}. Вільно: ${stock.free}, потрібно: ${requested}`);
          }
        }

        // 2. Create Order Item
        const itemRef = doc(collection(db, 'orderItems'));
        transaction.set(itemRef, {
          ...item,
          total: item.qty * item.price,
          orderId: orderRef.id,
          isDeleted: false
        });

        // 3. Subtract Helium if fulfilled
        if (finalOrderData.status === 'Виконано') {
          const productRef = doc(db, 'products', item.productId);
          const productSnap = await transaction.get(productRef);
          if (productSnap.exists()) {
            const pData = productSnap.data() as Product;
            const heliumVolume = pData.heliumVolume || techSpecs.find(s => s.size === pData.size)?.heliumVolume || 0;
            if (heliumVolume > 0 && !heliumSnap.empty) {
              const hRef = doc(db, 'helium', heliumSnap.docs[0].id);
              const hSnap = await transaction.get(hRef);
              if (hSnap.exists()) {
                const consumedM3 = (heliumVolume * (item.qty + (item.defect || 0))) / 1000;
                transaction.update(hRef, { currentVolumeM3: Math.max(0, hSnap.data().currentVolumeM3 - consumedM3) });
              }
            }
          }
        }
      }

      await logAction('CREATE_ORDER_WITH_ITEMS', { id: orderRef.id, itemsCount: items.length });
      return orderRef.id;
    });
  },

  /**
   * Updates order status and handles stock/helium consequences.
   */
  async updateStatus(
    db: Firestore,
    orderId: string,
    newStatus: Order['status'],
    oldOrder: Order,
    items: OrderItem[],
    products: Product[],
    techSpecs: TechnicalSpec[],
    logAction: (action: string, details: any, oldVal: any, newVal: any) => Promise<void>
  ) {
    if (newStatus === oldOrder.status) return;

    return await runTransaction(db, async (transaction) => {
      const heliumQuery = query(collection(db, 'helium'), limit(1));
      const heliumSnap = await getDocs(heliumQuery);

      // Only proceed with stock logic if moving to/from 'Виконано'
      if (newStatus === 'Виконано' || oldOrder.status === 'Виконано') {
        const modifier = newStatus === 'Виконано' ? -1 : 1;

        for (const item of items) {
          if (newStatus === 'Виконано') {
            const stock = await calculateFreeStockInTransaction(db, transaction, item.productId, orderId);
            const requested = item.qty + (item.defect || 0);
            if (requested > stock.free) {
              throw new Error(`Недостатньо вільного залишку для товару ${item.productId}. Вільно: ${stock.free}, потрібно: ${requested}`);
            }
          }

          const product = products.find(p => p.id === item.productId);
          if (product) {
            const heliumVolume = product.heliumVolume || techSpecs.find(s => s.size === product.size)?.heliumVolume || 0;
            if (heliumVolume > 0 && !heliumSnap.empty) {
              const hRef = doc(db, 'helium', heliumSnap.docs[0].id);
              const hSnap = await transaction.get(hRef);
              if (hSnap.exists()) {
                const consumedM3 = (heliumVolume * (item.qty + (item.defect || 0))) / 1000;
                transaction.update(hRef, { 
                  currentVolumeM3: Math.max(0, hSnap.data().currentVolumeM3 + (consumedM3 * modifier)) 
                });
              }
            }
          }
        }
      }

      const orderRef = doc(db, 'orders', orderId);
      const updateData = { status: newStatus, updatedAt: serverTimestamp() };
      transaction.update(orderRef, updateData);
      
      await logAction('UPDATE_STATUS', { id: orderId, from: oldOrder.status, to: newStatus }, oldOrder, { ...oldOrder, ...updateData });
    });
  },

  /**
   * Adds an item to an existing order with stock check.
   */
  async addItem(
    db: Firestore,
    orderId: string,
    order: Order,
    itemData: any,
    product: Product,
    logAction: (action: string, details: any) => Promise<void>
  ) {
    return await runTransaction(db, async (transaction) => {
      if (order.status === 'Виконано' || order.status === 'В обробці') {
        const stock = await calculateFreeStockInTransaction(db, transaction, itemData.productId, orderId);
        const requested = order.status === 'Виконано' ? (itemData.qty + (itemData.defect || 0)) : itemData.qty;
        if (requested > stock.free) {
          throw new Error(`Недостатньо вільного залишку! Вільно: ${stock.free}, потрібно: ${requested}`);
        }

        if (order.status === 'Виконано' && product.heliumVolume) {
          const heliumQuery = query(collection(db, 'helium'), limit(1));
          const heliumSnap = await getDocs(heliumQuery);
          if (!heliumSnap.empty) {
            const hRef = doc(db, 'helium', heliumSnap.docs[0].id);
            const hSnap = await transaction.get(hRef);
            if (hSnap.exists()) {
              const consumedM3 = (product.heliumVolume * (itemData.qty + (itemData.defect || 0))) / 1000;
              transaction.update(hRef, { currentVolumeM3: Math.max(0, hSnap.data().currentVolumeM3 - consumedM3) });
            }
          }
        }
      }

      const newItemRef = doc(collection(db, 'orderItems'));
      const finalItemData = { ...itemData, orderId, isDeleted: false, total: itemData.qty * itemData.price };
      transaction.set(newItemRef, finalItemData);
      
      await logAction('ADD_ORDER_ITEM', { orderId, productId: itemData.productId });
    });
  }
};
