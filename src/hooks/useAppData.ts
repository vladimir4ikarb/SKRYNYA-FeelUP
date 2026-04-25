import { useState, useEffect } from 'react';
import { 
  db, 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit, 
  doc, 
  updateDoc, 
  addDoc,
  serverTimestamp,
  handleFirestoreError, 
  OperationType 
} from '../firebase';
import { 
  Product, 
  Client, 
  Order, 
  OrderItem, 
  Purchase, 
  PurchaseItem, 
  Expense, 
  TechnicalSpec, 
  HeliumTank, 
  AppUser,
  Supplier,
  WriteOff,
  WriteOffItem
} from '../types';

export function useAppData(user: any, currentUserData: AppUser | null) {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [writeOffs, setWriteOffs] = useState<WriteOff[]>([]);
  const [writeOffItems, setWriteOffItems] = useState<WriteOffItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [techSpecs, setTechSpecs] = useState<TechnicalSpec[]>([]);
  const [heliumTanks, setHeliumTanks] = useState<HeliumTank[]>([]);
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [trashItems, setTrashItems] = useState<any[]>([]);

    // Helium Migration logic - moved out of the hot listener path
    useEffect(() => {
      if (heliumTanks.length > 0 && heliumTanks[0].name === "Основний 10л" && heliumTanks[0].capacityM3 === 1.4) {
        const tank = heliumTanks[0];
        console.log("Running helium tank migration...");
        updateDoc(doc(db, "helium", tank.id), {
          name: "Основний 40л",
          capacityM3: 6.0
        }).catch(err => console.error("Helium migration failed", err));
      }
    }, [heliumTanks.length > 0 ? `${heliumTanks[0].name}-${heliumTanks[0].capacityM3}` : 'none']);

    useEffect(() => {
      if (!user || !currentUserData || currentUserData.role === 'none') return;

      const unsubProducts = onSnapshot(query(collection(db, 'products'), where('isDeleted', '==', false), orderBy('name'), limit(200)), (snap) => setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product))), err => handleFirestoreError(err, OperationType.LIST, 'products'));
      const unsubClients = onSnapshot(query(collection(db, 'clients'), where('isDeleted', '==', false), orderBy('name'), limit(200)), (snap) => setClients(snap.docs.map(d => ({ id: d.id, ...d.data() } as Client))), err => handleFirestoreError(err, OperationType.LIST, 'clients'));
      const unsubOrders = onSnapshot(query(collection(db, 'orders'), where('isDeleted', '==', false), orderBy('date', 'desc'), limit(100)), (snap) => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order))), err => handleFirestoreError(err, OperationType.LIST, 'orders'));
      const unsubOrderItems = onSnapshot(query(collection(db, 'orderItems'), where('isDeleted', '==', false), limit(500)), (snap) => setOrderItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as OrderItem))), err => handleFirestoreError(err, OperationType.LIST, 'orderItems'));
      const unsubPurchases = onSnapshot(query(collection(db, 'purchases'), where('isDeleted', '==', false), orderBy('date', 'desc'), limit(100)), (snap) => setPurchases(snap.docs.map(d => ({ id: d.id, ...d.data() } as Purchase))), err => handleFirestoreError(err, OperationType.LIST, 'purchases'));
      const unsubPurchaseItems = onSnapshot(query(collection(db, 'purchaseItems'), where('isDeleted', '==', false), limit(500)), (snap) => setPurchaseItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as PurchaseItem))), err => handleFirestoreError(err, OperationType.LIST, 'purchaseItems'));
      const unsubExpenses = onSnapshot(query(collection(db, 'expenses'), where('isDeleted', '==', false), orderBy('date', 'desc'), limit(200)), (snap) => setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Expense))), err => handleFirestoreError(err, OperationType.LIST, 'expenses'));
      const unsubWriteOffs = onSnapshot(query(collection(db, 'writeOffs'), where('isDeleted', '==', false), orderBy('date', 'desc'), limit(100)), (snap) => setWriteOffs(snap.docs.map(d => ({ id: d.id, ...d.data() } as WriteOff))), err => handleFirestoreError(err, OperationType.LIST, 'writeOffs'));
      const unsubWriteOffItems = onSnapshot(query(collection(db, 'writeOffItems'), where('isDeleted', '==', false), limit(500)), (snap) => setWriteOffItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as WriteOffItem))), err => handleFirestoreError(err, OperationType.LIST, 'writeOffItems'));
      const unsubTechSpecs = onSnapshot(collection(db, 'technicalSpecs'), (snap) => setTechSpecs(snap.docs.map(d => ({ id: d.id, ...d.data() } as TechnicalSpec))), err => handleFirestoreError(err, OperationType.LIST, 'technicalSpecs'));
      
      const unsubHelium = onSnapshot(collection(db, 'helium'), (snap) => {
        setHeliumTanks(snap.docs.map(d => ({ id: d.id, ...d.data() } as HeliumTank)));
      }, err => handleFirestoreError(err, OperationType.LIST, 'helium'));

      const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => setAppUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as AppUser))), err => handleFirestoreError(err, OperationType.LIST, 'users'));
      
      const unsubSuppliers = onSnapshot(collection(db, 'suppliers'), (snap) => {
        const allSuppliers = snap.docs.map(d => ({ id: d.id, ...d.data() } as Supplier));
        const seenUi = new Set();
        const uniqueSuppliers = allSuppliers
          .filter(s => !s.isDeleted)
          .filter(s => {
            const name = (s.name || '').toLowerCase().trim();
            if (!name) return false;
            if (seenUi.has(name)) return false;
            seenUi.add(name);
            return true;
          })
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setSuppliers(uniqueSuppliers);
      }, err => handleFirestoreError(err, OperationType.LIST, 'suppliers'));

      // Trash listener (Admin only)
      let unsubTrash: (() => void)[] = [];
      if (currentUserData && currentUserData.role === 'admin') {
        const collections = ['products', 'clients', 'orders', 'orderItems', 'purchases', 'purchaseItems', 'expenses', 'writeOffs', 'writeOffItems'];
        unsubTrash = collections.map(col => 
          onSnapshot(query(collection(db, col), where('isDeleted', '==', true)), (snap) => {
            setTrashItems(prev => {
              const filtered = prev.filter(item => item._collection !== col);
              const newItems = snap.docs.map(d => ({ id: d.id, _collection: col, ...d.data() }));
              return [...filtered, ...newItems];
            });
          })
        );
      }

      return () => {
        unsubProducts();
        unsubClients();
        unsubOrders();
        unsubOrderItems();
        unsubPurchases();
        unsubPurchaseItems();
        unsubWriteOffs();
        unsubWriteOffItems();
        unsubExpenses();
        unsubTechSpecs();
        unsubHelium();
        unsubUsers();
        unsubSuppliers();
        unsubTrash.forEach(unsub => unsub());
      };
    }, [user, currentUserData?.id, currentUserData?.role]); // Use primitive properties as dependencies to avoid infinite loops

  return {
    products,
    clients,
    orders,
    orderItems,
    purchases,
    purchaseItems,
    writeOffs,
    writeOffItems,
    expenses,
    techSpecs,
    heliumTanks,
    appUsers,
    suppliers,
    trashItems
  };
}
