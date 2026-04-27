import { useState } from 'react';
import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  limit, 
  runTransaction, 
  writeBatch, 
  serverTimestamp, 
  handleFirestoreError, 
  OperationType 
} from '../firebase';
import { Product, OrderItem, TechnicalSpec, Supplier, Purchase, Expense, WriteOff, WriteOffItem } from '../types';
import { calculateFreeStockInTransaction, calculateFreeStockForItems } from '../services/inventoryTransactionService';
import { logAction } from '../services/loggerService';
import { User } from 'firebase/auth';
import { getNextSku } from '../services/skuService';

export function useAppDataActions(
  user: User | null,
  activeTab: string,
  editingItem: any,
  setEditingItem: (v: any) => void,
  setIsModalOpen: (v: boolean) => void,
  draftOrderItems: any[],
  setDraftOrderItems: (v: any[]) => void,
  draftPurchaseItems: any[],
  setDraftPurchaseItems: (v: any[]) => void,
  techSpecs: TechnicalSpec[],
  suppliers: Supplier[],
  purchases: Purchase[],
  expenses: Expense[],
  writeOffs: WriteOff[],
  writeOffItems: WriteOffItem[],
  selectedOrderId: string | null,
  selectedPurchaseId: string | null,
  setProductSearch: (v: string) => void
) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = Object.fromEntries(formData.entries());
    ['price', 'qty', 'deliveryCost', 'extraCosts', 'amount'].forEach(key => { if (data[key]) data[key] = Number(data[key]); });
    
    if (activeTab === 'sales') {
      data.deliveryDate = data.deliveryDate || data.delivery || '';
      data.managerId = data.managerId || data.manager || '';
      data.delivery = data.deliveryDate;
      data.manager = data.managerId;
    }
    if (activeTab === 'purchases') {
      const sName = (data.supplierName || '').trim();
      data.supplierName = sName;
      data.supplier = sName;
      
      // Auto-create supplier if it's new
      if (sName) {
        const existingSupplier = suppliers.find(s => s.name.toLowerCase() === sName.toLowerCase());
        if (!existingSupplier) {
          try {
            await addDoc(collection(db, 'suppliers'), {
              name: sName,
              createdAt: serverTimestamp(),
              isDeleted: false
            });
          } catch (e) {
            console.error("Failed to auto-create supplier", e);
          }
        }
      }
    }

    if (activeTab === 'clients') {
      data.updatedAt = serverTimestamp();
    }
    if (activeTab === 'admin' && !('isActive' in data)) {
      data.isActive = true;
    }
    
    if (activeTab === 'products') {
      delete data.baseName;
    }
    
    const col = activeTab === 'products' ? 'products' : 
                activeTab === 'sales' ? 'orders' : 
                activeTab === 'clients' ? 'clients' : 
                activeTab === 'purchases' ? 'purchases' : 
                activeTab === 'expenses' ? 'expenses' :
                activeTab === 'write-offs' ? 'writeOffs' :
                activeTab === 'admin' ? 'users' : 'technicalSpecs';

    if (activeTab === 'write-offs' && !editingItem) {
      if (draftPurchaseItems.length === 0) {
        alert('Додайте хоча б один товар до списання');
        setIsSubmitting(false);
        return;
      }
      try {
        const batch = writeBatch(db);
        const writeOffRef = doc(collection(db, 'writeOffs'));
        const writeOffId = writeOffRef.id;
        
        const writeOffData = {
          ...data,
          heliumVolume: data.heliumVolume ? Number(data.heliumVolume) : 0,
          isDeleted: false
        };
        
        batch.set(writeOffRef, writeOffData);
        
        draftPurchaseItems.forEach(item => {
          const itemRef = doc(collection(db, 'writeOffItems'));
          batch.set(itemRef, { 
            productId: item.productId,
            qty: item.qty,
            writeOffId: writeOffId, 
            isDeleted: false 
          });
        });

        // Subtract helium if Conducted
        if (data.status === 'Проведено' && writeOffData.heliumVolume > 0) {
          const heliumQuery = query(collection(db, 'helium'), limit(1));
          const heliumSnap = await getDocs(heliumQuery);
          if (!heliumSnap.empty) {
            const hRef = doc(db, 'helium', heliumSnap.docs[0].id);
            // We use runTransaction for helium elsewhere, but here we are in a simple MVP flow.
            // However, to be safe with helium volume, we should really use a transaction or at least be careful.
            // For MVP, I'll use a transaction for the whole thing if status is 'Проведено'.
          }
        }
        
        await batch.commit();
        logAction(user, 'CREATE_WRITE_OFF', { id: writeOffId, itemsCount: draftPurchaseItems.length });
        setIsModalOpen(false); setDraftPurchaseItems([]); setProductSearch('');
      } catch (err) { handleFirestoreError(err, OperationType.CREATE, 'writeOffs'); }
      finally { setIsSubmitting(false); }
      return;
    }

    if (activeTab === 'purchases' && !editingItem) {
      if (draftPurchaseItems.length === 0) {
        alert('Додайте хоча б один товар до закупівлі');
        setIsSubmitting(false);
        return;
      }
      try {
        const totalAmount = draftPurchaseItems.reduce((acc, item) => acc + (item.qty * item.price), 0) + (data.deliveryCost || 0);
        const batch = writeBatch(db);
        const purchaseRef = doc(collection(db, 'purchases'));
        const purchaseId = purchaseRef.id;
        batch.set(purchaseRef, { ...data, totalAmount, isDeleted: false, isArchived: false });

        // Auto-add supplier to directory if new
        const supplierExists = suppliers.some(s => s.name.toLowerCase().trim() === data.supplierName.toLowerCase().trim());
        if (data.supplierName && !supplierExists) {
          const supplierRef = doc(collection(db, 'suppliers'));
          batch.set(supplierRef, {
            name: data.supplierName.trim(),
            createdAt: serverTimestamp(),
            isDeleted: false
          });
        }
        
        draftPurchaseItems.forEach(item => {
          const itemRef = doc(collection(db, 'purchaseItems'));
          batch.set(itemRef, { 
            ...item, 
            costPrice: item.price, 
            total: item.qty * item.price, 
            purchaseId: purchaseId, 
            isDeleted: false 
          });
        });

        // Sync with Expenses if Conducted
        if (data.status === 'Проведено') {
          const expenseRef = doc(collection(db, 'expenses'));
          batch.set(expenseRef, {
            date: data.date,
            category: 'Закупівля товару',
            amount: totalAmount,
            comment: `Закупівля №${purchaseId.slice(-4)} / ${data.supplierName}`,
            relatedId: purchaseId,
            isDeleted: false
          });
        }
        
        await batch.commit();
        logAction(user, 'CREATE_PURCHASE_WITH_ITEMS', { id: purchaseId, itemsCount: draftPurchaseItems.length });
        setIsModalOpen(false); setDraftPurchaseItems([]); setProductSearch('');
      } catch (err) { handleFirestoreError(err, OperationType.CREATE, 'purchases'); }
      finally { setIsSubmitting(false); }
      return;
    }

    const fetchAllItems = async (productIds: string[]) => {
      const chunks = [];
      for (let i = 0; i < productIds.length; i += 30) {
        chunks.push(productIds.slice(i, i + 30));
      }
      let pItems: any[] = [];
      let oItems: any[] = [];
      let wItems: any[] = [];
      for (const chunk of chunks) {
        const [pSnap, oSnap, wSnap] = await Promise.all([
          getDocs(query(collection(db, 'purchaseItems'), where('productId', 'in', chunk), where('isDeleted', '==', false))),
          getDocs(query(collection(db, 'orderItems'), where('productId', 'in', chunk), where('isDeleted', '==', false))),
          getDocs(query(collection(db, 'writeOffItems'), where('productId', 'in', chunk), where('isDeleted', '==', false)))
        ]);
        pItems = [...pItems, ...pSnap.docs.map(d => d.data())];
        oItems = [...oItems, ...oSnap.docs.map(d => d.data())];
        wItems = [...wItems, ...wSnap.docs.map(d => d.data())];
      }
      return { pItems, oItems, wItems };
    };

    if (activeTab === 'sales' && !editingItem) {
      if (draftOrderItems.length === 0) {
        alert('Додайте хоча б один товар до замовлення');
        setIsSubmitting(false);
        return;
      }
      try {
        const totalAmount = draftOrderItems.reduce((acc, item) => acc + (item.qty * item.price), 0);
        const productIds = Array.from(new Set(draftOrderItems.map(i => i.productId)));
        const { pItems, oItems, wItems } = await fetchAllItems(productIds);
        const heliumQuery = query(collection(db, 'helium'), limit(1));
        const heliumSnap = await getDocs(heliumQuery);

        await runTransaction(db, async (transaction) => {
          const docCache = new Map<string, any>();
          const itemStocks = [];
          const productSnaps = [];
          
          if (data.status === 'Виконано') {
            for (const item of draftOrderItems) {
              const stock = await calculateFreeStockForItems(
                db, transaction, item.productId, pItems, oItems, wItems, undefined, docCache
              );
              itemStocks.push({ item, stock });
              productSnaps.push(await transaction.get(doc(db, 'products', item.productId)));
            }

            for (const { item, stock } of itemStocks) {
              if (item.qty > stock.actual) {
                throw new Error(`Недостатньо фактичного залишку для товару ${item.productId}. На складі: ${stock.actual}, потрібно: ${item.qty}`);
              }
            }
          }

          const hRef = !heliumSnap.empty ? doc(db, 'helium', heliumSnap.docs[0].id) : null;
          const hSnap = hRef ? await transaction.get(hRef) : null;

          const orderRef = doc(collection(db, 'orders'));
          transaction.set(orderRef, { ...data, totalAmount, isDeleted: false });

          for (let i = 0; i < draftOrderItems.length; i++) {
            const item = draftOrderItems[i];
            const itemRef = doc(collection(db, 'orderItems'));
            transaction.set(itemRef, { ...item, total: item.qty * item.price, orderId: orderRef.id, isDeleted: false });

            if (data.status === 'Виконано') {
              const productSnap = productSnaps[i];
              if (productSnap?.exists()) {
                const pData = productSnap.data();
                const vol = pData?.heliumVolume || techSpecs.find(s => s.size === pData?.size)?.heliumVolume || 0;
                if (vol > 0 && hSnap?.exists()) {
                  const consumed = (vol * item.qty) / 1000;
                  transaction.update(hSnap.ref, { currentVolumeM3: Math.max(0, hSnap.data().currentVolumeM3 - consumed) });
                }
              }
            }
          }
        });
        
        logAction(user, 'CREATE_ORDER_WITH_ITEMS', { itemsCount: draftOrderItems.length });
        setIsModalOpen(false); setDraftOrderItems([]); setProductSearch('');
      } catch (err) { handleFirestoreError(err, OperationType.CREATE, 'orders'); }
      finally { setIsSubmitting(false); }
      return;
    }

    try {
      if (editingItem) {
        const oldVal = { ...editingItem };
        
        if (activeTab === 'sales') {
          const totalAmount = draftOrderItems.reduce((acc, item) => acc + (item.qty * item.price), 0);
          const orderData = { ...data, totalAmount };
          const orderId = editingItem.id;

          try {
            const oldItemsSnap = await getDocs(query(collection(db, 'orderItems'), where('orderId', '==', orderId), where('isDeleted', '==', false)));
            const oldItems = oldItemsSnap.docs.map(d => ({ id: d.id, ...d.data() } as OrderItem));

            const productIds = Array.from(new Set(draftOrderItems.map(i => i.productId)));
            const allProductIds = Array.from(new Set([...productIds, ...oldItems.map(i => i.productId)]));
            const { pItems: pi, oItems: oi, wItems: wi } = await fetchAllItems(allProductIds);
            
            const heliumQuery = query(collection(db, 'helium'), limit(1));
            const heliumSnap = await getDocs(heliumQuery);

            await runTransaction(db, async (transaction) => {
              const docCache = new Map<string, any>();
              const hRef = !heliumSnap.empty ? doc(db, 'helium', heliumSnap.docs[0].id) : null;
              const hSnap = hRef ? await transaction.get(hRef) : null;

              const oldProductSnaps = [];
              if (oldVal.status === 'Виконано') {
                for (const item of oldItems) {
                  oldProductSnaps.push(await transaction.get(doc(db, 'products', item.productId)));
                }
              }

              const newItemStocks = [];
              const newProductSnaps = [];
              if (orderData.status === 'Виконано') {
                for (const item of draftOrderItems) {
                  const stock = await calculateFreeStockForItems(
                    db, transaction, item.productId, pi, oi, wi, orderId, docCache
                  );
                  newItemStocks.push(stock);
                  newProductSnaps.push(await transaction.get(doc(db, 'products', item.productId)));
                }

                for (let i = 0; i < draftOrderItems.length; i++) {
                  if (draftOrderItems[i].qty > newItemStocks[i].actual) {
                    throw new Error(`Недостатньо фактичного залишку для товару ${draftOrderItems[i].productId}. На складі: ${newItemStocks[i].actual}, потрібно: ${draftOrderItems[i].qty}`);
                  }
                }
              }

              let netHeliumChange = 0;
              if (oldVal.status === 'Виконано') {
                oldItems.forEach((item, i) => {
                  const pSnap = oldProductSnaps[i];
                  if (pSnap?.exists()) {
                    const pData = pSnap.data();
                    const vol = pData?.heliumVolume || techSpecs.find(s => s.size === pData?.size)?.heliumVolume || 0;
                    netHeliumChange += (vol * item.qty) / 1000;
                  }
                });
              }

              if (orderData.status === 'Виконано') {
                draftOrderItems.forEach((item, i) => {
                  const pSnap = newProductSnaps[i];
                  if (pSnap?.exists()) {
                    const pData = pSnap.data();
                    const vol = pData?.heliumVolume || techSpecs.find(s => s.size === pData?.size)?.heliumVolume || 0;
                    netHeliumChange -= (vol * item.qty) / 1000;
                  }
                });
              }

              if (netHeliumChange !== 0 && hSnap?.exists()) {
                transaction.update(hSnap.ref, { currentVolumeM3: Math.max(0, hSnap.data().currentVolumeM3 + netHeliumChange) });
              }

              oldItemsSnap.docs.forEach(d => {
                transaction.update(doc(db, 'orderItems', d.id), { isDeleted: true });
              });

              for (const item of draftOrderItems) {
                const itemRef = doc(collection(db, 'orderItems'));
                transaction.set(itemRef, { ...item, total: item.qty * item.price, orderId, isDeleted: false });
              }

              transaction.update(doc(db, 'orders', orderId), orderData);
            });

            logAction(user, 'UPDATE_ORDER_WITH_ITEMS', { id: orderId, itemsCount: draftOrderItems.length }, oldVal, orderData);
            setIsModalOpen(false); setEditingItem(null); setDraftOrderItems([]); setProductSearch('');
            return;
          } catch (err) {
            handleFirestoreError(err, OperationType.UPDATE, 'orders');
            return;
          } finally {
            setIsSubmitting(false);
          }
        }

        if (activeTab === 'write-offs') {
          const writeOffId = editingItem.id;
          const writeOffData = {
            ...data,
            heliumVolume: data.heliumVolume ? Number(data.heliumVolume) : 0
          };
          
          try {
            const batch = writeBatch(db);
            
            if (editingItem.status === 'Чернетка') {
              const oldItemsQuery = query(collection(db, 'writeOffItems'), where('writeOffId', '==', writeOffId), where('isDeleted', '==', false));
              const oldItemsSnap = await getDocs(oldItemsQuery);
              oldItemsSnap.docs.forEach(d => {
                batch.update(doc(db, 'writeOffItems', d.id), { isDeleted: true });
              });
              
              draftPurchaseItems.forEach(item => {
                const itemRef = doc(collection(db, 'writeOffItems'));
                batch.set(itemRef, { 
                  productId: item.productId,
                  qty: item.qty,
                  writeOffId: writeOffId, 
                  isDeleted: false 
                });
              });
            }
            
            batch.update(doc(db, 'writeOffs', writeOffId), writeOffData);
            
            await batch.commit();
            logAction(user, 'UPDATE_WRITE_OFF', { id: writeOffId, itemsCount: draftPurchaseItems.length }, oldVal, writeOffData);
            setIsModalOpen(false); setEditingItem(null); setDraftPurchaseItems([]); setProductSearch('');
            return;
          } catch (err) {
            handleFirestoreError(err, OperationType.UPDATE, 'writeOffs');
            return;
          } finally {
            setIsSubmitting(false);
          }
        }

        if (activeTab === 'purchases') {
        const totalAmount = draftPurchaseItems.reduce((acc, item) => acc + (item.qty * item.price), 0) + (data.deliveryCost || 0);
        const purchaseData = { ...data, totalAmount };
        const purchaseId = editingItem.id;
        
        try {
          const batch = writeBatch(db);
          
          if (editingItem.status === 'Чернетка') {
            // Soft delete old items
            const oldItemsQuery = query(collection(db, 'purchaseItems'), where('purchaseId', '==', purchaseId), where('isDeleted', '==', false));
            const oldItemsSnap = await getDocs(oldItemsQuery);
            oldItemsSnap.docs.forEach(d => {
              batch.update(doc(db, 'purchaseItems', d.id), { isDeleted: true });
            });
            
            // Add new items
            draftPurchaseItems.forEach(item => {
              const itemRef = doc(collection(db, 'purchaseItems'));
              batch.set(itemRef, { 
                ...item, 
                costPrice: item.price, 
                total: item.qty * item.price, 
                purchaseId: purchaseId, 
                isDeleted: false 
              });
            });
          }
          // Note: if status is 'Проведено' or 'Скасовано', draftPurchaseItems should represent the fixed state
          
          batch.update(doc(db, 'purchases', purchaseId), purchaseData);

          // Auto-add supplier to directory if new
          const supplierExists = suppliers.some(s => s.name.toLowerCase().trim() === data.supplierName.toLowerCase().trim());
          if (data.supplierName && !supplierExists) {
            const supplierRef = doc(collection(db, 'suppliers'));
            batch.set(supplierRef, {
              name: data.supplierName.trim(),
              createdAt: serverTimestamp(),
              isDeleted: false
            });
          }

          // Update/Create/Delete associated Expense
          const relatedExpense = expenses.find(e => e.relatedId === purchaseId && !e.isDeleted);
          if (data.status === 'Проведено') {
            if (relatedExpense) {
              batch.update(doc(db, 'expenses', relatedExpense.id), {
                date: data.date,
                amount: totalAmount,
                comment: `Закупівля №${purchaseId.slice(-4)} / ${data.supplierName}`
              });
            } else {
              const expenseRef = doc(collection(db, 'expenses'));
              batch.set(expenseRef, {
                date: data.date,
                category: 'Закупівля товару',
                amount: totalAmount,
                comment: `Закупівля №${purchaseId.slice(-4)} / ${data.supplierName}`,
                relatedId: purchaseId,
                isDeleted: false
              });
            }
          } else {
            // If status changed to Draft or Cancelled, soft delete the expense
            if (relatedExpense) {
              batch.update(doc(db, 'expenses', relatedExpense.id), { isDeleted: true });
            }
          }

          await batch.commit();
          
          logAction(user, 'UPDATE_PURCHASE_WITH_ITEMS', { id: purchaseId, itemsCount: draftPurchaseItems.length }, oldVal, purchaseData);
        setIsModalOpen(false); setEditingItem(null); setDraftPurchaseItems([]);
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, 'purchases');
        return;
      } finally {
        setIsSubmitting(false);
      }
    }

    if (activeTab === 'clients') data.updatedAt = serverTimestamp();
    await updateDoc(doc(db, col, editingItem.id), data);
    logAction(user, 'UPDATE', { collection: col, id: editingItem.id }, oldVal, data);
      } else {
        let finalData = {
          ...data,
          ...(activeTab === 'clients' ? { createdAt: serverTimestamp(), updatedAt: serverTimestamp() } : {}),
          isDeleted: false,
          isArchived: false
        };

        if (activeTab === 'products' && !editingItem) {
          if (data.category === "Фольговані кулі") {
            const { sku, id } = await getNextSku('FO');
            finalData = { ...finalData, sku, skuId: id };
          } else if (data.category === "Латексні кулі") {
            const { sku, id } = await getNextSku('LA');
            finalData = { ...finalData, sku, skuId: id };
          } else if (data.category === "Bubbles") {
            const { sku, id } = await getNextSku('BU');
            finalData = { ...finalData, sku, skuId: id };
          }
        }

        let docRef;
        docRef = await addDoc(collection(db, col), finalData);
        logAction(user, 'CREATE', { collection: col, id: docRef.id }, null, finalData);
      }
      setIsModalOpen(false); setEditingItem(null); setDraftOrderItems([]); setDraftPurchaseItems([]); setProductSearch('');
    } catch (err) { 
      handleFirestoreError(err, editingItem ? OperationType.UPDATE : OperationType.CREATE, col); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const saveDetailItem = async (e: React.FormEvent, itemModalType: 'order' | 'purchase' | null) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = Object.fromEntries(formData.entries());
    ['price', 'qty'].forEach(key => { if (data[key]) data[key] = Number(data[key]); });
    
    const colName = itemModalType === 'order' ? 'orderItems' : 'purchaseItems';
    const parentId = itemModalType === 'order' ? selectedOrderId : selectedPurchaseId;
    
    if (itemModalType === 'order') {
      try {
        await runTransaction(db, async (transaction) => {
          const productRef = doc(db, 'products', data.productId);
          const productSnap = await transaction.get(productRef);
          if (!productSnap.exists()) throw new Error("Товар не знайдено");
          const product = productSnap.data();

          const orderRef = doc(db, 'orders', parentId!);
          const orderSnap = await transaction.get(orderRef);
          if (!orderSnap.exists()) throw new Error("Замовлення не знайдено");
          const order = orderSnap.data();

          if (order.status === 'Виконано') {
            const stock = await calculateFreeStockInTransaction(db, transaction, data.productId, parentId!);
            const requested = data.qty;
            if (requested > stock.actual) {
              throw new Error(`Недостатньо фактичного залишку! На складі: ${stock.actual}, потрібно: ${requested}`);
            }
            if (product.heliumVolume) {
              const heliumQuery = query(collection(db, 'helium'), limit(1));
              const heliumSnap = await getDocs(heliumQuery);
              if (!heliumSnap.empty) {
                const hRef = doc(db, 'helium', heliumSnap.docs[0].id);
                const hSnap = await transaction.get(hRef);
                if (hSnap.exists()) {
                  const consumedM3 = (product.heliumVolume * data.qty) / 1000;
                  transaction.update(hRef, { currentVolumeM3: Math.max(0, hSnap.data().currentVolumeM3 - consumedM3) });
                }
              }
            }
          }
          const itemRef = doc(collection(db, 'orderItems'));
          transaction.set(itemRef, { ...data, orderId: parentId, isDeleted: false });
        });
        logAction(user, 'ADD_ORDER_ITEM', { orderId: parentId, productId: data.productId });
      } catch (err) { handleFirestoreError(err, OperationType.CREATE, 'orderItems'); }
    } else {
      try {
        await runTransaction(db, async (tx) => {
          const purchaseId = parentId!;
          const purchaseRef = doc(db, 'purchases', purchaseId);
          const purchaseSnap = await tx.get(purchaseRef);
          if (!purchaseSnap.exists()) throw new Error("Закупівлю не знайдено");
          
          if (purchaseSnap.data().status !== 'Чернетка') {
            throw new Error("Неможливо змінити склад позицій у проведеному або скасованому документі");
          }
          
          const itemRef = doc(collection(db, 'purchaseItems'));
          const itemTotal = data.qty * data.price;
          tx.set(itemRef, { ...data, costPrice: data.price, total: itemTotal, purchaseId, isDeleted: false });
          
          const newTotal = (purchaseSnap.data().totalAmount || 0) + itemTotal;
          tx.update(purchaseRef, { totalAmount: newTotal });
        });
        logAction(user, 'ADD_PURCHASE_ITEM_TX', { purchaseId: parentId, productId: data.productId });
      } catch (err) { handleFirestoreError(err, OperationType.CREATE, 'purchaseItems'); }
    }
    setIsSubmitting(false);
  };

  const copyOrder = async (
    orderId: string, 
    orders: any[], 
    orderItems: any[], 
    products: any[]
  ) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    if (!confirm('Скопіювати це замовлення з актуальними цінами?')) return;
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const items = orderItems.filter(oi => oi.orderId === orderId);
      const activeItems = items.filter(item => {
        const p = products.find(prod => prod.id === item.productId);
        return p && !p.isArchived;
      });
      if (activeItems.length === 0) {
        alert('Неможливо скопіювати замовлення: всі товари в ньому архівовані.');
        return;
      }
      const priceSnapshotItems = activeItems.map(item => {
        const currentProduct = products.find(p => p.id === item.productId);
        const fixedPrice = currentProduct?.price ?? item.price;
        return { ...item, price: fixedPrice };
      });
      const newOrderData = {
        clientId: order.clientId,
        comment: `Копія замовлення ${orderId}. ${order.comment || ''}`,
        date: new Date().toISOString(),
        deliveryDate: order.deliveryDate || order.delivery || '',
        delivery: order.deliveryDate || order.delivery || '',
        managerId: order.managerId || order.manager || '',
        manager: order.managerId || order.manager || '',
        status: 'Чернетка' as const,
        totalAmount: priceSnapshotItems.reduce((acc, item) => acc + (item.qty * item.price), 0),
        isDeleted: false
      };
      const orderRef = doc(collection(db, 'orders'));
      await runTransaction(db, async (transaction) => {
        transaction.set(orderRef, newOrderData);
        for (const item of priceSnapshotItems) {
          const newDocRef = doc(collection(db, 'orderItems'));
          transaction.set(newDocRef, {
            orderId: orderRef.id,
            productId: item.productId,
            qty: item.qty,
            price: item.price,
            total: item.qty * item.price,
            isDeleted: false
          });
        }
      });
      logAction(user, 'COPY_ORDER', { from: orderId, to: orderRef.id, copiedCount: priceSnapshotItems.length, skippedCount: items.length - priceSnapshotItems.length });
    } catch (err) { console.error("Copy failed", err); }
    finally { setIsSubmitting(false); }
  };

  const toggleArchive = async (item: any, col: 'products' | 'clients') => {
    try {
      await updateDoc(doc(db, col, item.id), { isArchived: !item.isArchived });
      logAction(user, 'TOGGLE_ARCHIVE', { collection: col, id: item.id, isArchived: !item.isArchived });
    } catch (err) { console.error("Archive failed", err); }
  };

  const deleteItem = async (id: string, orders: any[], orderItems: any[], purchases: any[], purchaseItems: any[]) => {
    const col =
      activeTab === 'products' ? 'products' :
      activeTab === 'sales' ? 'orders' :
      activeTab === 'clients' ? 'clients' :
      activeTab === 'purchases' ? 'purchases' :
      activeTab === 'write-offs' ? 'writeOffs' :
      activeTab === 'expenses' ? 'expenses' :
      'technicalSpecs';
    
    let hasHistory = false;
    if (activeTab === 'products') {
      hasHistory = orderItems.some(oi => oi.productId === id) || purchaseItems.some(pi => pi.productId === id);
    } else if (activeTab === 'clients') {
      hasHistory = orders.some(o => o.clientId === id);
    } else if (activeTab === 'sales') {
      const order = orders.find(o => o.id === id);
      hasHistory = (order?.status === 'Виконано');
    } else if (activeTab === 'purchases') {
      const purchase = purchases.find(p => p.id === id);
      hasHistory = (purchase?.status === 'Проведено');
    }

    try { 
      if (hasHistory && (activeTab === 'products' || activeTab === 'clients')) {
        await updateDoc(doc(db, col, id), { isArchived: true, isDeleted: false });
        logAction(user, 'SOFT_ARCHIVE_INSTEAD_OF_DELETE', { collection: col, id });
        alert("Запис має історію операцій, тому його було архівовано замість видалення.");
      } else {
        const batch = writeBatch(db);
        batch.update(doc(db, col, id), { isDeleted: true });
        
        if (activeTab === 'purchases') {
          const linkedExp = expenses.find(e => e.relatedId === id && !e.isDeleted);
          if (linkedExp) {
            batch.update(doc(db, 'expenses', linkedExp.id), { isDeleted: true });
          }
        }
        
        await batch.commit();
        logAction(user, 'SOFT_DELETE', { collection: col, id });
      }
    } catch (err) { handleFirestoreError(err, OperationType.DELETE, col); }
  };

  const deleteDetailItem = async (item: any, type: 'order' | 'purchase' | 'write-off') => {
    const col = type === 'order' ? 'orderItems' : type === 'purchase' ? 'purchaseItems' : 'writeOffItems';
    try {
      if (type === 'order') {
        await runTransaction(db, async (transaction) => {
          const itemRef = doc(db, col, item.id);
          const itemSnap = await transaction.get(itemRef);
          if (!itemSnap.exists()) throw new Error("Позиція не знайдена");
          transaction.update(itemRef, { isDeleted: true });
          logAction(user, 'SOFT_DELETE_DETAIL_TX', { collection: col, id: item.id }, itemSnap.data(), null);
        });
      } else if (type === 'purchase') {
        await runTransaction(db, async (tx) => {
          const itemRef = doc(db, col, item.id);
          const itemSnap = await tx.get(itemRef);
          if (!itemSnap.exists()) throw new Error("Позиція не знайдена");
          const itemData = itemSnap.data();
          const purchaseId = itemData.purchaseId;
          
          if (purchaseId) {
            const purchaseRef = doc(db, 'purchases', purchaseId);
            const purchaseSnap = await tx.get(purchaseRef);
            if (purchaseSnap.exists() && purchaseSnap.data().status !== 'Чернетка') {
              throw new Error("Неможливо видалити позицію у проведеному або скасованому документі");
            }
          }
          
          tx.update(itemRef, { isDeleted: true });
          
          if (purchaseId) {
            const purchaseRef = doc(db, 'purchases', purchaseId);
            const purchaseSnap = await tx.get(purchaseRef);
            if (purchaseSnap.exists()) {
              const currentTotal = purchaseSnap.data().totalAmount || 0;
              const itemTotal = itemData.total || (itemData.qty * (itemData.costPrice || itemData.price || 0));
              tx.update(purchaseRef, { totalAmount: Math.max(0, currentTotal - itemTotal) });
            }
          }
        });
        logAction(user, 'SOFT_DELETE_DETAIL_PURCHASE_TX', { collection: col, id: item.id }, item, null);
      } else if (type === 'write-off') {
        await runTransaction(db, async (tx) => {
          const itemRef = doc(db, col, item.id);
          const itemSnap = await tx.get(itemRef);
          if (!itemSnap.exists()) throw new Error("Позиція не знайдена");
          const itemData = itemSnap.data();
          const writeOffId = itemData.writeOffId;
          
          if (writeOffId) {
            const woRef = doc(db, 'writeOffs', writeOffId);
            const woSnap = await tx.get(woRef);
            if (woSnap.exists() && woSnap.data().status !== 'Чернетка') {
              throw new Error("Неможливо видалити позицію у проведеному або скасованому документі");
            }
          }
          
          tx.update(itemRef, { isDeleted: true });
        });
        logAction(user, 'SOFT_DELETE_DETAIL_WRITEOFF_TX', { collection: col, id: item.id }, item, null);
      }
    } catch (err) { 
      console.error("Delete detail failed", err);
      alert("Помилка при видаленні позиції");
    }
  };

  return { saveItem, saveDetailItem, copyOrder, toggleArchive, deleteItem, deleteDetailItem, isSubmitting, setIsSubmitting };
}
