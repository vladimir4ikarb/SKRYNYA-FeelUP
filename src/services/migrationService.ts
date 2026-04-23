import { 
  collection, 
  getDocs, 
  writeBatch, 
  doc, 
  Firestore 
} from 'firebase/firestore';

export const migrationService = {
  /**
   * Migrates legacy fields:
   * delivery -> deliveryDate
   * manager -> managerId
   */
  migrateOrders: async (db: Firestore) => {
    const ordersRef = collection(db, 'orders');
    const snapshot = await getDocs(ordersRef);
    const batch = writeBatch(db);
    let count = 0;

    snapshot.docs.forEach((orderDoc) => {
      const data = orderDoc.data();
      const updates: any = {};

      if (data.delivery && !data.deliveryDate) {
        updates.deliveryDate = data.delivery;
      }
      if (data.manager && !data.managerId) {
        updates.managerId = data.manager;
      }

      if (Object.keys(updates).length > 0) {
        batch.update(doc(db, 'orders', orderDoc.id), updates);
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
    }
    return count;
  }
};
