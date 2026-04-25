import { db, doc, runTransaction, collection } from '../firebase';

export async function getNextSku(prefix: string): Promise<{ sku: string; id: number }> {
  const sequenceRef = doc(db, 'sequences', `product_${prefix}`);
  
  return await runTransaction(db, async (transaction) => {
    const sequenceDoc = await transaction.get(sequenceRef);
    let nextValue = 1;
    
    if (sequenceDoc.exists()) {
      nextValue = (sequenceDoc.data().value || 0) + 1;
    }
    
    transaction.set(sequenceRef, { value: nextValue }, { merge: true });
    
    const sku = `${prefix}${String(nextValue).padStart(3, '0')}`;
    return { sku, id: nextValue };
  });
}
