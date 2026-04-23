import { Firestore, collection, doc, query, where } from 'firebase/firestore';

export interface StockSnapshot {
  actual: number;
  reserved: number;
  free: number;
}

export async function calculateFreeStockInTransaction(
  db: Firestore,
  transaction: any,
  productId: string,
  excludeOrderId?: string
): Promise<StockSnapshot> {
  const purchaseItemsQuery = query(
    collection(db, 'purchaseItems'),
    where('productId', '==', productId),
    where('isDeleted', '==', false)
  );
  const orderItemsQuery = query(
    collection(db, 'orderItems'),
    where('productId', '==', productId),
    where('isDeleted', '==', false)
  );

  const [purchaseItemsSnap, orderItemsSnap] = await Promise.all([
    transaction.get(purchaseItemsQuery),
    transaction.get(orderItemsQuery)
  ]);

  let actual = 0;
  let reserved = 0;

  for (const piDoc of purchaseItemsSnap.docs) {
    const piData = piDoc.data();
    const purchaseRef = doc(db, 'purchases', piData.purchaseId);
    const purchaseSnap = await transaction.get(purchaseRef);
    if (!purchaseSnap.exists()) continue;
    const purchase = purchaseSnap.data();
    if (purchase?.isDeleted) continue;
    if (purchase?.status === 'Оплачено' || purchase?.status === 'Борг') actual += Number(piData.qty || 0);
  }

  for (const oiDoc of orderItemsSnap.docs) {
    const oiData = oiDoc.data();
    const orderRef = doc(db, 'orders', oiData.orderId);
    const orderSnap = await transaction.get(orderRef);
    if (!orderSnap.exists()) continue;
    const order = orderSnap.data();
    if (order?.isDeleted) continue;
    const qty = Number(oiData.qty || 0);
    const defect = Number(oiData.defect || 0);
    if (order?.status === 'Виконано') {
      actual -= (qty + defect);
    } else if (order?.status === 'В обробці' && oiData.orderId !== excludeOrderId) {
      reserved += qty;
    }
  }

  return {
    actual,
    reserved,
    free: actual - reserved
  };
}
