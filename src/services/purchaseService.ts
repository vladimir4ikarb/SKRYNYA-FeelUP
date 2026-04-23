import { 
  Firestore, 
  collection, 
  doc, 
  runTransaction, 
  serverTimestamp
} from 'firebase/firestore';
import { Purchase } from '../types';

export const purchaseService = {
  /**
   * Creates a new purchase with multiple items in a single transaction.
   */
  async createPurchase(
    db: Firestore,
    purchaseData: Partial<Purchase>,
    items: { productId: string; qty: number; price: number }[],
    logAction: (action: string, details: any) => Promise<void>
  ) {
    const totalAmount = items.reduce((acc, item) => acc + (item.qty * item.price), 0) + (purchaseData.deliveryCost || 0);
    const finalPurchaseData = {
      ...purchaseData,
      totalAmount,
      isDeleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Keep legacy fields during transition
    if (finalPurchaseData.supplierName) (finalPurchaseData as any).supplier = finalPurchaseData.supplierName;

    return await runTransaction(db, async (transaction) => {
      const purchaseRef = doc(collection(db, 'purchases'));
      transaction.set(purchaseRef, finalPurchaseData);

      for (const item of items) {
        const itemRef = doc(collection(db, 'purchaseItems'));
        transaction.set(itemRef, {
          ...item,
          costPrice: item.price, // costPrice is the new standard
          total: item.qty * item.price,
          purchaseId: purchaseRef.id,
          isDeleted: false
        });
      }

      await logAction('CREATE_PURCHASE_WITH_ITEMS', { id: purchaseRef.id, itemsCount: items.length });
      return purchaseRef.id;
    });
  },

  /**
   * Adds an item to an existing purchase.
   */
  async addItem(
    db: Firestore,
    purchaseId: string,
    itemData: any,
    logAction: (action: string, details: any) => Promise<void>
  ) {
    return await runTransaction(db, async (transaction) => {
      const newItemRef = doc(collection(db, 'purchaseItems'));
      const finalItemData = { 
        ...itemData, 
        purchaseId, 
        costPrice: itemData.price, 
        total: itemData.qty * itemData.price,
        isDeleted: false 
      };
      transaction.set(newItemRef, finalItemData);
      
      await logAction('ADD_PURCHASE_ITEM', { purchaseId, productId: itemData.productId });
    });
  }
};
