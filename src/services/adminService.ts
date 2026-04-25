import { doc, updateDoc, writeBatch, collection, getDocs, query, where, db } from '../firebase';
import { User } from 'firebase/auth';
import { AppUser } from '../types';
import { logAction } from './loggerService';

import { PRODUCT_CATEGORIES } from '../constants/productCategories';

export const normalizeProductCategories = async (user: User | null) => {
  if (!user) return;
  const q = query(collection(db, 'products'), where('isDeleted', '==', false));
  const snap = await getDocs(q);
  
  const batch = writeBatch(db);
  let count = 0;

  snap.docs.forEach(docSnap => {
    const data = docSnap.data();
    const currentCat = (data.category || '').trim().toUpperCase();
    const normalized = PRODUCT_CATEGORIES.find(c => c.toUpperCase() === currentCat) || "ІНШЕ";
    
    if (data.category !== normalized) {
      batch.update(docSnap.ref, { category: normalized });
      count++;
    }
  });

  if (count > 0) {
    await batch.commit();
    logAction(user, 'NORMALIZE_CATEGORIES', { count });
    alert(`Категорії нормалізовано для ${count} товарів.`);
  } else {
    alert("Усі товари вже мають коректні категорії.");
  }
};

export const restoreItem = async (
  id: string, 
  col: string, 
  trashItems: any[], 
  clients: any[], 
  isSubmitting: boolean, 
  setIsSubmitting: (v: boolean) => void,
  user: User | null
) => {
  if (isSubmitting) return;
  setIsSubmitting(true);
  try {
    if (col === 'orders') {
      const order = trashItems.find(i => i.id === id && i._collection === 'orders');
      if (order) {
        const client = clients.find(c => c.id === order.clientId);
        if (!client) {
          const deletedClient = trashItems.find(i => i.id === order.clientId && i._collection === 'clients');
          if (deletedClient) {
            await updateDoc(doc(db, 'clients', order.clientId), { isDeleted: false });
          } else {
            setIsSubmitting(false);
            return;
          }
        }
      }
    }
    const payload: any = { isDeleted: false };
    if (col === 'products' || col === 'clients') payload.isArchived = false;
    await updateDoc(doc(db, col, id), payload);
    logAction(user, 'RESTORE_ITEM', { collection: col, id, payload });
  } catch (err) { 
    console.error("Restore failed", err); 
  } finally { 
    setIsSubmitting(false); 
  }
};

export const clearWarehouse = async (
  user: User | null, 
  currentUserData: AppUser | null, 
  isSubmitting: boolean,
  setIsSubmitting: (v: boolean) => void,
  setShowConfirmWarehouse: (v: boolean) => void
) => {
  if (!user || (currentUserData?.role !== 'admin' && user.email !== "vladimir.chuguev@gmail.com")) return;
  if (isSubmitting) return;
  setIsSubmitting(true);
  try {
    const q = query(collection(db, 'products'), where('isDeleted', '==', false));
    const snap = await getDocs(q);
    
    if (snap.empty) {
      alert("Склад уже порожній.");
      setIsSubmitting(false);
      setShowConfirmWarehouse(false);
      return;
    }

    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.update(d.ref, { isDeleted: true, isArchived: true }));
    await batch.commit();
    logAction(user, 'SOFT_CLEAR_WAREHOUSE', { count: snap.size });
    alert(`Склад успішно очищено (soft-delete). Оновлено ${snap.size} карток товарів.`);
    setShowConfirmWarehouse(false);
  } catch (err) { 
    console.error("Clear warehouse failed", err);
    alert("Помилка при очищенні складу.");
  } finally { 
    setIsSubmitting(false); 
  }
};

export const clearOldLogs = async (
  user: User | null, 
  currentUserData: AppUser | null,
  isSubmitting: boolean,
  setIsSubmitting: (v: boolean) => void
) => {
  if (!user || (currentUserData?.role !== 'admin' && user.email !== "vladimir.chuguev@gmail.com")) return;
  if (!confirm('Видалити всі логи старіші за 30 днів?')) return;
  
  if (isSubmitting) return;
  setIsSubmitting(true);
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const q = query(collection(db, 'logs'), where('timestamp', '<', thirtyDaysAgo.toISOString()));
    const snap = await getDocs(q);
    
    if (snap.empty) {
      alert("Немає старих логів для видалення.");
      return;
    }

    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    logAction(user, 'CLEAR_OLD_LOGS', { count: snap.size });
    alert(`Логи успішно очищено. Видалено ${snap.size} записів.`);
  } catch (err) {
    console.error("Clear logs failed", err);
    alert("Помилка при очищенні логів.");
  } finally {
    setIsSubmitting(false);
  }
};
