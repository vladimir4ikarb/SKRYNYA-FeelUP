import { Firestore, collection, doc, query, where, getDocs } from 'firebase/firestore';

export interface StockSnapshot {
  actual: number;
}

export async function calculateFreeStockForItems(
  db: Firestore,
  transaction: any,
  productId: string,
  purchaseItems: any[],
  orderItems: any[],
  writeOffItems: any[],
  excludeOrderId?: string,
  docCache?: Map<string, any>
): Promise<StockSnapshot> {
  let actual = 0;

  const getCachedDoc = async (ref: any) => {
    const path = ref.path;
    if (docCache?.has(path)) return docCache.get(path);
    const snap = await transaction.get(ref);
    if (docCache) docCache.set(path, snap);
    return snap;
  };

  for (const piData of purchaseItems) {
    if (piData.productId !== productId || piData.isDeleted) continue;
    const snap = await getCachedDoc(doc(db, 'purchases', piData.purchaseId));
    if (snap.exists() && snap.data()?.status === 'Проведено') {
      actual += Number(piData.qty || 0);
    }
  }

  for (const wiData of writeOffItems) {
    if (wiData.productId !== productId || wiData.isDeleted) continue;
    const snap = await getCachedDoc(doc(db, 'writeOffs', wiData.writeOffId));
    if (snap.exists() && snap.data()?.status === 'Проведено') {
      actual -= Number(wiData.qty || 0);
    }
  }

  for (const oiData of orderItems) {
    if (oiData.productId !== productId || oiData.isDeleted) continue;
    if (oiData.orderId === excludeOrderId) continue;
    
    const snap = await getCachedDoc(doc(db, 'orders', oiData.orderId));
    if (snap.exists()) {
      const order = snap.data();
      if (order?.isDeleted) continue;
      if (order?.status === 'Виконано') {
        actual -= Number(oiData.qty || 0);
      }
    }
  }

  return { actual };
}

export async function calculateFreeStockInTransaction(
  db: Firestore,
  transaction: any,
  productId: string,
  excludeOrderId?: string
): Promise<StockSnapshot> {
  // Note: Web SDK transactions DO NOT support queries. 
  // We must fetch items using getDocs before or alongside the transaction.
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
  const writeOffItemsQuery = query(
    collection(db, 'writeOffItems'),
    where('productId', '==', productId),
    where('isDeleted', '==', false)
  );

  const [purchaseItemsSnap, orderItemsSnap, writeOffItemsSnap] = await Promise.all([
    getDocs(purchaseItemsQuery),
    getDocs(orderItemsQuery),
    getDocs(writeOffItemsQuery)
  ]);

  let actual = 0;

  // We can still use the transaction to get the latest status of parent documents 
  // to ensure consistency if those were modified in the same transaction
  for (const piDoc of purchaseItemsSnap.docs) {
    const piData = piDoc.data();
    const purchaseRef = doc(db, 'purchases', piData.purchaseId);
    const purchaseSnap = await transaction.get(purchaseRef);
    if (!purchaseSnap.exists()) continue;
    const purchase = purchaseSnap.data();
    if (purchase?.isDeleted) continue;
    if (purchase?.status === 'Проведено') actual += Number(piData.qty || 0);
  }

  for (const wiDoc of writeOffItemsSnap.docs) {
    const wiData = wiDoc.data();
    const writeOffRef = doc(db, 'writeOffs', wiData.writeOffId);
    const writeOffSnap = await transaction.get(writeOffRef);
    if (!writeOffSnap.exists()) continue;
    const writeOff = writeOffSnap.data();
    if (writeOff?.isDeleted) continue;
    if (writeOff?.status === 'Проведено') actual -= Number(wiData.qty || 0);
  }

  for (const oiDoc of orderItemsSnap.docs) {
    const oiData = oiDoc.data();
    if (!oiData.orderId || oiData.isDeleted) continue;
    if (oiData.orderId === excludeOrderId) continue;

    const orderRef = doc(db, 'orders', oiData.orderId);
    const orderSnap = await transaction.get(orderRef);
    if (!orderSnap.exists()) continue;
    const order = orderSnap.data();
    if (order?.isDeleted) continue;
    const qty = Number(oiData.qty || 0);
    if (order?.status === 'Виконано') {
      actual -= qty;
    }
  }

  return {
    actual
  };
}
