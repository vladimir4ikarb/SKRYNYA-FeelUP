import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Client, Order, OrderItem, Purchase, PurchaseItem, Expense, TechnicalSpec, HeliumTank, AppUser } from '../types';

export function useDataListeners(user: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [techSpecs, setTechSpecs] = useState<TechnicalSpec[]>([]);
  const [heliumTanks, setHeliumTanks] = useState<HeliumTank[]>([]);
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [trashItems, setTrashItems] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const unsubscribers: (() => void)[] = [];

    const setupListener = (col: string, stateSetter: any, isLog = false) => {
      const q = isLog 
        ? query(collection(db, col), orderBy('timestamp', 'desc'), where('isDeleted', '==', false))
        : query(collection(db, col), where('isDeleted', '==', false));
      
      const unsub = onSnapshot(q, (snap) => {
        stateSetter(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      unsubscribers.push(unsub);
    };

    setupListener('products', setProducts);
    setupListener('clients', setClients);
    setupListener('orders', setOrders);
    setupListener('orderItems', setOrderItems);
    setupListener('purchases', setPurchases);
    setupListener('purchaseItems', setPurchaseItems);
    setupListener('expenses', setExpenses);
    setupListener('technicalSpecs', setTechSpecs);
    setupListener('helium', setHeliumTanks);
    setupListener('users', setAppUsers);

    // Trash listener (items with isDeleted: true)
    const collectionsForTrash = ['products', 'clients', 'orders', 'purchases', 'expenses'];
    collectionsForTrash.forEach(colName => {
      const q = query(collection(db, colName), where('isDeleted', '==', true));
      const unsub = onSnapshot(q, (snap) => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data(), _collection: colName }));
        setTrashItems(prev => {
          const filtered = prev.filter(p => p._collection !== colName);
          return [...filtered, ...items];
        });
      });
      unsubscribers.push(unsub);
    });

    return () => unsubscribers.forEach(unsub => unsub());
  }, [user]);

  return {
    products, clients, orders, orderItems, purchases, purchaseItems, expenses, techSpecs, heliumTanks, appUsers, trashItems
  };
}
