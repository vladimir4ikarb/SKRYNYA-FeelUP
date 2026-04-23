import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  Settings, 
  ClipboardCheck, 
  Plus,
  Trash2,
  Edit2,
  LogOut,
  LogIn,
  Search,
  AlertCircle,
  X,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  CheckCircle2,
  Clock,
  Download,
  RefreshCw,
  Upload,
  MoreHorizontal,
  HelpCircle,
  Zap,
  ShieldCheck,
  Award,
  FileText,
  Printer,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import Markdown from 'react-markdown';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  limit,
  orderBy,
  doc,
  getDocs,
  runTransaction,
  writeBatch,
  serverTimestamp,
  handleFirestoreError,
  OperationType,
  User as FirebaseUser
} from './firebase';

import { GoogleGenAI } from "@google/genai";
import { 
  Product, 
  HeliumTank, 
  Client, 
  AppUser, 
  Order, 
  OrderItem, 
  Purchase, 
  PurchaseItem, 
  Expense,
  TechnicalSpec 
} from './types';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Modal } from './components/common/Modal';
import { Sidebar } from './components/layout/Sidebar';
import { StatCard } from './components/dashboard/StatCard';
import { RecentOrders } from './components/dashboard/RecentOrders';
import { ProfitChart } from './components/dashboard/ProfitChart';
import { HeliumTankCard } from './components/dashboard/HeliumTankCard';
import { StockAlerts } from './components/dashboard/StockAlerts';
import { AiAssistant } from './components/dashboard/AiAssistant';
import { InventoryTab } from './components/inventory/InventoryTab';
import { SalesTab } from './components/sales/SalesTab';
import { ClientsTab } from './components/clients/ClientsTab';
import { PurchasesTab } from './components/purchases/PurchasesTab';
import { SpecsTab } from './components/specs/SpecsTab';
import { ExpensesTab } from './components/finance/ExpensesTab';
import { AdminTab } from './components/admin/AdminTab';
import { InfoTab } from './components/info/InfoTab';
import { OrderDetailsView } from './components/common/OrderDetailsView';
import { ProductForm } from './components/forms/ProductForm';
import { OrderForm } from './components/forms/OrderForm';
import { ClientForm } from './components/forms/ClientForm';
import { PurchaseForm } from './components/forms/PurchaseForm';
import { SpecForm } from './components/forms/SpecForm';
import { ExpenseForm } from './components/forms/ExpenseForm';
import { UserForm } from './components/forms/UserForm';
import { DetailItemForm } from './components/forms/DetailItemForm';
import { useInventory } from './hooks/useInventory';
import { calculateFreeStockInTransaction } from './services/inventoryTransactionService';

// --- Main App ---

const ALLOWED_EMAILS = ['vladimir.chuguev@gmail.com', 'feelup.balloons@gmail.com'];

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'sales' | 'clients' | 'purchases' | 'expenses' | 'specs' | 'admin' | 'info' | 'logs' | 'trash'>('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);
  
  // Data States
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
  const [currentUserData, setCurrentUserData] = useState<AppUser | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', text: string }[]>(() => {
    const saved = localStorage.getItem('feelup_ai_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('feelup_ai_history', JSON.stringify(chatHistory));
  }, [chatHistory]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemModalType, setItemModalType] = useState<'order' | 'purchase' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmWarehouse, setShowConfirmWarehouse] = useState(false);
  const [backups, setBackups] = useState<{ name: string, date: string, size: number }[]>([]);
  const [isHeliumModalOpen, setIsHeliumModalOpen] = useState(false);
  const [draftPurchaseItems, setDraftPurchaseItems] = useState<{ productId: string, qty: number, price: number }[]>([]);
  const [draftOrderItems, setDraftOrderItems] = useState<{ productId: string, qty: number, price: number, defect: number }[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleAiChat = useCallback(async (message: string) => {
    if (!message.trim()) return;

    const userMsg = message;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsAiLoading(true);

    try {
      const GEMINI_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...chatHistory, { role: 'user', text: userMsg }].map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: "Ви - AI-асистент для студії аеродизайну 'FEEL UP'. Допомагайте з управлінням замовленнями, складом та клієнтами. Будьте лаконічними та професійними. Вся аналітика (дохід, склад, гелій) обчислюється динамічно на основі первинних записів (orderItems, purchaseItems). Система захищає виконані замовлення та оплачені закупівлі від змін для збереження цілісності даних."
        }
      });
      
      const aiText = response.text || "Вибачте, я не зміг згенерувати відповідь.";
      setChatHistory(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error("AI Error:", error);
      setChatHistory(prev => [...prev, { role: 'model', text: "Помилка підключення до AI. Перевірте API ключ." }]);
    } finally {
      setIsAiLoading(false);
    }
  }, [chatHistory]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setCurrentUserData(null);
        setLoading(false);
      } else {
        // Ensure user document exists
        const userRef = doc(db, 'users', u.uid);
        onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (u.email === "vladimir.chuguev@gmail.com" && data.role !== "admin") {
              updateDoc(userRef, { role: "admin" });
            }
            setCurrentUserData({ id: docSnap.id, ...data } as AppUser);
          } else if (u.email && ALLOWED_EMAILS.includes(u.email)) {
            const role = u.email === "vladimir.chuguev@gmail.com" ? "admin" : "manager";
            setDoc(userRef, {
              email: u.email,
              displayName: u.displayName,
              role: role,
              isActive: true
            });
          } else {
            // User not allowed - we don't create a record, or we mark it as unauthorized
            setCurrentUserData({ id: 'unauthorized', email: u.email, role: 'none' } as any);
          }
          setLoading(false);
        }, (err) => {
          console.error("User document listener failed", err);
          handleFirestoreError(err, OperationType.GET, `users/${u.uid}`);
          setLoading(false);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubProducts = onSnapshot(query(collection(db, 'products'), where('isDeleted', '==', false), orderBy('name'), limit(200)), (snap) => setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product))), err => handleFirestoreError(err, OperationType.LIST, 'products'));
    const unsubClients = onSnapshot(query(collection(db, 'clients'), where('isDeleted', '==', false), orderBy('name'), limit(200)), (snap) => setClients(snap.docs.map(d => ({ id: d.id, ...d.data() } as Client))), err => handleFirestoreError(err, OperationType.LIST, 'clients'));
    const unsubOrders = onSnapshot(query(collection(db, 'orders'), where('isDeleted', '==', false), orderBy('date', 'desc'), limit(100)), (snap) => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order))), err => handleFirestoreError(err, OperationType.LIST, 'orders'));
    const unsubOrderItems = onSnapshot(query(collection(db, 'orderItems'), where('isDeleted', '==', false), limit(500)), (snap) => setOrderItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as OrderItem))), err => handleFirestoreError(err, OperationType.LIST, 'orderItems'));
    const unsubPurchases = onSnapshot(query(collection(db, 'purchases'), where('isDeleted', '==', false), orderBy('date', 'desc'), limit(100)), (snap) => setPurchases(snap.docs.map(d => ({ id: d.id, ...d.data() } as Purchase))), err => handleFirestoreError(err, OperationType.LIST, 'purchases'));
    const unsubPurchaseItems = onSnapshot(query(collection(db, 'purchaseItems'), where('isDeleted', '==', false), limit(500)), (snap) => setPurchaseItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as PurchaseItem))), err => handleFirestoreError(err, OperationType.LIST, 'purchaseItems'));
    const unsubExpenses = onSnapshot(query(collection(db, 'expenses'), where('isDeleted', '==', false), orderBy('date', 'desc'), limit(200)), (snap) => setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Expense))), err => handleFirestoreError(err, OperationType.LIST, 'expenses'));
    const unsubTechSpecs = onSnapshot(collection(db, 'technicalSpecs'), (snap) => setTechSpecs(snap.docs.map(d => ({ id: d.id, ...d.data() } as TechnicalSpec))), err => handleFirestoreError(err, OperationType.LIST, 'technicalSpecs'));
    const unsubHelium = onSnapshot(collection(db, 'helium'), (snap) => {
      const tanks = snap.docs.map(d => ({ id: d.id, ...d.data() } as HeliumTank));
      setHeliumTanks(tanks);
      // Auto-migration from old 10L defaults to 40L
      if (tanks.length > 0 && tanks[0].name === "Основний 10л" && tanks[0].capacityM3 === 1.4) {
        updateDoc(doc(db, "helium", tanks[0].id), {
          name: "Основний 40л",
          capacityM3: 6.0
        }).catch(err => console.error("Migration failed", err));
      }
    }, err => handleFirestoreError(err, OperationType.LIST, 'helium'));
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => setAppUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as AppUser))), err => handleFirestoreError(err, OperationType.LIST, 'users'));

    // Trash listener (Admin only)
    const trashQueries = [
      query(collection(db, 'products'), where('isDeleted', '==', true)),
      query(collection(db, 'clients'), where('isDeleted', '==', true)),
      query(collection(db, 'orders'), where('isDeleted', '==', true)),
      query(collection(db, 'purchases'), where('isDeleted', '==', true))
    ];

    const unsubTrash = trashQueries.map((q, idx) => onSnapshot(q, (snap) => {
      const colNames = ['products', 'clients', 'orders', 'purchases'];
      const items = snap.docs.map(d => ({ id: d.id, _collection: colNames[idx], ...d.data() }));
      setTrashItems(prev => {
        const filtered = prev.filter(i => i._collection !== colNames[idx]);
        return [...filtered, ...items];
      });
    }, err => handleFirestoreError(err, OperationType.LIST, 'trash')));

    return () => {
      unsubProducts(); unsubClients(); unsubOrders(); unsubOrderItems(); unsubPurchases(); unsubPurchaseItems(); unsubExpenses(); unsubTechSpecs(); unsubHelium(); unsubUsers();
      unsubTrash.forEach(unsub => unsub());
    };
  }, [user]);

  const logAction = async (action: string, details: any, oldValue?: any, newValue?: any) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'logs'), {
        userId: user.uid,
        userEmail: user.email,
        action,
        details,
        oldValue: oldValue || null,
        newValue: newValue || null,
        timestamp: serverTimestamp()
      });
    } catch (err) { console.error("Logging failed", err); }
  };

  const exportData = async () => {
    const data: any = {
      products,
      clients,
      orders,
      orderItems,
      purchases,
      purchaseItems,
      techSpecs,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feelup_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    logAction('BACKUP_EXPORT', { timestamp: new Date().toISOString() });
  };

  const exportToCSV = (type: 'orders' | 'inventory') => {
    let csvContent = "";
    let filename = "";

    if (type === 'orders') {
      csvContent = "Дата,Клієнт,Сума,Статус,Менеджер,Коментар\n";
      orders.forEach(o => {
        const client = clients.find(c => c.id === o.clientId);
        const total = orderTotals[o.id] || 0;
        csvContent += `${new Date(o.date).toLocaleDateString()},"${client?.name || 'Невідомий'}",${total},${o.status},"${o.managerId || o.manager || ''}","${o.comment || ''}"\n`;
      });
      filename = `feelup_sales_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      csvContent = "Назва,Категорія,Розмір,Колір,Залишок,Собівартість\n";
      products.forEach(p => {
        csvContent += `"${p.name}","${p.category}","${p.size}","${p.color}",${inventory[p.id] || 0},${p.costPrice || 0}\n`;
      });
      filename = `feelup_inventory_${new Date().toISOString().split('T')[0]}.csv`;
    }

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    logAction('CSV_EXPORT', { type, timestamp: new Date().toISOString() });
  };

  const generatePDF = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const client = clients.find(c => c.id === order.clientId);
    const items = orderItems.filter(oi => oi.orderId === orderId);
    const total = orderTotals[orderId] || 0;

    // Create a hidden receipt element
    const element = document.createElement('div');
    element.style.padding = '40px';
    element.style.width = '800px';
    element.style.backgroundColor = 'white';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    
    element.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px;">
        <div>
          <h1 style="color: #4f46e5; margin: 0; font-size: 32px;">FEEL UP</h1>
          <p style="color: #64748b; margin: 4px 0;">Студія повітряних кульок</p>
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0; color: #0f172a;">ЧЕК № ${orderId.slice(-6).toUpperCase()}</h2>
          <p style="color: #64748b; margin: 4px 0;">Дата: ${new Date(order.date).toLocaleDateString('uk-UA')}</p>
        </div>
      </div>
      
      <div style="margin-bottom: 30px;">
        <h3 style="color: #0f172a; margin-bottom: 8px;">КЛІЄНТ:</h3>
        <p style="margin: 0; font-size: 18px; font-bold: 600;">${client?.name || 'Гість'}</p>
        <p style="margin: 4px 0; color: #64748b;">${client?.phone || ''}</p>
        <p style="margin: 4px 0; color: #64748b;">Адреса: ${order.deliveryDate || order.delivery || 'Самовивіз'}</p>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background-color: #f8fafc; text-align: left;">
            <th style="padding: 12px; border-bottom: 1px solid #e2e8f0;">Товар</th>
            <th style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">К-сть</th>
            <th style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">Ціна</th>
            <th style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">Сума</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => {
            const product = products.find(p => p.id === item.productId);
            return `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">
                  <strong>${product?.name || 'Товар'}</strong><br/>
                  <small style="color: #64748b;">${product?.size || ''} ${product?.color || ''}</small>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: center;">${item.qty} шт</td>
                <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right;">${item.price} ₴</td>
                <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right;">${(item.qty * item.price)} ₴</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      
      <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
        <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; min-width: 200px; text-align: right;">
          <p style="margin: 0; color: #64748b; font-size: 14px;">ЗАГАЛЬНА СУМА:</p>
          <h2 style="margin: 4px 0; color: #4f46e5; font-size: 28px;">${total} ₴</h2>
        </div>
      </div>
      
      <div style="margin-top: 60px; text-align: center; border-top: 1px dashed #e2e8f0; padding-top: 20px;">
        <p style="color: #94a3b8; font-size: 14px;">Дякуємо за замовлення! Приходьте ще :)</p>
        <p style="color: #cbd5e1; font-size: 10px; margin-top: 8px;">FEEL UP Balloon Management System</p>
      </div>
    `;
    
    document.body.appendChild(element);
    
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`feelup_receipt_${orderId.slice(-6)}.pdf`);
    } catch (err) {
      console.error('PDF generation error', err);
    } finally {
      document.body.removeChild(element);
    }
    
    logAction('PDF_EXPORT', { orderId, timestamp: new Date().toISOString() });
  };

  const restoreItem = async (id: string, col: string) => {
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
      logAction('RESTORE_ITEM', { collection: col, id, payload });
    } catch (err) { console.error("Restore failed", err); }
    finally { setIsSubmitting(false); }
  };

  const importData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        const collections = ['products', 'clients', 'orders', 'orderItems', 'purchases', 'purchaseItems', 'techSpecs'];
        
        for (const colName of collections) {
          const items = data[colName === 'techSpecs' ? 'techSpecs' : colName];
          if (Array.isArray(items)) {
            for (const item of items) {
              const { id, ...rest } = item;
              await addDoc(collection(db, colName === 'techSpecs' ? 'technicalSpecs' : colName), { ...rest, isDeleted: false });
            }
          }
        }
        logAction('DATA_IMPORT', { timestamp: new Date().toISOString() });
      } catch (err) {
        console.error("Import failed", err);
      } finally {
        setIsSubmitting(false);
        if (e.target) e.target.value = ''; // Reset input
      }
    };
    reader.readAsText(file);
  };

  const clearOldLogs = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      alert("Очищення логів вимкнено: журнал аудиту працює в immutable-режимі (без update/delete).");
    } catch (err) { 
      console.error("Clear logs failed", err); 
      alert("Помилка при очищенні логів.");
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const clearWarehouse = async () => {
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
      logAction('SOFT_CLEAR_WAREHOUSE', { count: snap.size });
      alert(`Склад успішно очищено (soft-delete). Оновлено ${snap.size} карток товарів.`);
      setShowConfirmWarehouse(false);
    } catch (err) { 
      console.error("Clear warehouse failed", err);
      alert("Помилка при очищенні складу.");
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const fetchBackups = async () => {
    try {
      const resp = await fetch('/api/backups');
      const data = await resp.json();
      setBackups(data);
    } catch (err) {
      console.error("Fetch backups failed", err);
    }
  };

  const triggerManualBackup = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Gather all data from state
      const backupData = {
        products,
        clients,
        orders,
        orderItems,
        purchases,
        purchaseItems,
        expenses,
        specs: techSpecs,
        helium: heliumTanks,
        users: appUsers
      };

      await fetch('/api/backups/save', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: backupData, timestamp: new Date().toISOString() })
      });

      await fetchBackups();
      alert("Резервна копія успішно створена.");
      logAction('MANUAL_BACKUP', { timestamp: new Date().toISOString() });
    } catch (err) {
      console.error("Backup push failed:", err);
      alert("Помилка при створенні копії.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Automatic backup check for Admins
  useEffect(() => {
    const runAutoBackup = async () => {
      if (currentUserData?.role !== 'admin' || products.length === 0) return;
      
      const lastBackup = localStorage.getItem('last_auto_backup');
      const today = new Date().toISOString().split('T')[0];
      
      if (lastBackup !== today) {
        console.log("Running scheduled daily backup push...");
        try {
          const backupData = {
            products,
            clients,
            orders,
            orderItems,
            purchases,
            purchaseItems,
            expenses,
            specs: techSpecs,
            helium: heliumTanks,
            users: appUsers
          };
          
          await fetch('/api/backups/save', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: backupData, timestamp: new Date().toISOString() })
          });
          
          localStorage.setItem('last_auto_backup', today);
          console.log("Daily backup push completed.");
        } catch (e) {
          console.error("Auto backup failed", e);
        }
      }
    };
    
    if (user && currentUserData?.role === 'admin') {
      runAutoBackup();
    }
  }, [user, currentUserData, products, clients, orders, orderItems, purchases, purchaseItems, techSpecs, heliumTanks, appUsers]);

  useEffect(() => {
    if (activeTab === 'admin') {
      fetchBackups();
    }
  }, [activeTab]);

  const { actualStock, freeStock } = useInventory(products, purchaseItems, purchases, orderItems, orders);
  const inventory = actualStock;

  const stockAlerts = useMemo(() => {
    return products.filter(p => !p.isArchived && (freeStock[p.id] || 0) <= (p.minStock || 5));
  }, [products, freeStock]);

  const orderTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    orderItems.forEach(oi => {
      totals[oi.orderId] = (totals[oi.orderId] || 0) + (oi.qty * oi.price);
    });
    return totals;
  }, [orderItems]);

  const purchaseTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    purchaseItems.forEach(pi => {
      const unitCost = pi.costPrice ?? pi.price ?? 0;
      totals[pi.purchaseId] = (totals[pi.purchaseId] || 0) + (pi.qty * unitCost);
    });
    // Враховуємо доставку в закупівлі
    purchases.forEach(p => {
      if (p.deliveryCost) totals[p.id] = (totals[p.id] || 0) + p.deliveryCost;
    });
    return totals;
  }, [purchaseItems, purchases]);

  const dashboardStats = useMemo(() => {
    const pMap = new Map(products.map(p => [p.id, p]));
    const ordMap = new Map(orders.map(o => [o.id, o]));

    const completedOrders = orders.filter(o => o.status === 'Виконано');
    const totalIncome = completedOrders.reduce((acc, o) => acc + (orderTotals[o.id] || 0), 0);
    
    // Calculate Margin: Order Total - Cost of Goods - Extra Costs
    const totalMargin = orderItems.reduce((acc, oi) => {
      const order = ordMap.get(oi.orderId);
      if (order?.status !== 'Виконано') return acc;
      const product = pMap.get(oi.productId);
      const cost = (product?.costPrice || 0) * (oi.qty + oi.defect);
      return acc + (oi.qty * oi.price - cost);
    }, 0) - completedOrders.reduce((acc, o) => acc + (o.extraCosts || 0), 0);

    const paidPurchases = purchases.filter(p => p.status === 'Оплачено');
    const totalPurchaseCost = paidPurchases.reduce((acc, p) => acc + (purchaseTotals[p.id] || 0), 0);
    const totalOperationalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    const totalExpenses = totalPurchaseCost + totalOperationalExpenses + completedOrders.reduce((acc, o) => acc + (o.extraCosts || 0), 0);

    const totalOrders = orders.length;
    const avgCheck = totalOrders > 0 ? Math.round(totalIncome / totalOrders) : 0;
    const heliumBalance = heliumTanks.reduce((acc, t) => acc + t.currentVolumeM3, 0);

    return { totalIncome, totalExpenses, totalMargin, totalOrders, avgCheck, heliumBalance };
  }, [orders, orderTotals, purchases, purchaseTotals, expenses, orderItems, products, heliumTanks]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayOrders = orders.filter(o => o.date.startsWith(date) && o.status === 'Виконано');
      return {
        name: new Date(date).toLocaleDateString('uk-UA', { weekday: 'short' }),
        value: dayOrders.reduce((acc, o) => acc + (orderTotals[o.id] || 0), 0)
      };
    });
  }, [orders, orderTotals]);

  const handleLogin = async () => {
    try { await signInWithPopup(auth, googleProvider); } catch (error) { console.error("Login failed", error); }
  };

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = Object.fromEntries(formData.entries());
    ['price', 'qty', 'defect', 'heliumVolume', 'costPrice', 'currentStock', 'minStock', 'deliveryCost', 'extraCosts', 'amount'].forEach(key => { if (data[key]) data[key] = Number(data[key]); });
    if (activeTab === 'sales') {
      data.deliveryDate = data.deliveryDate || data.delivery || '';
      data.managerId = data.managerId || data.manager || '';
      // Keep legacy fields during transition window
      data.delivery = data.deliveryDate;
      data.manager = data.managerId;
    }
    if (activeTab === 'purchases') {
      data.supplierName = data.supplierName || data.supplier || '';
      // Keep legacy field during transition window
      data.supplier = data.supplierName;
    }
    if (activeTab === 'clients') {
      data.updatedAt = serverTimestamp();
    }
    if (activeTab === 'admin' && !('isActive' in data)) {
      data.isActive = true;
    }
    const col = activeTab === 'products' ? 'products' : 
                activeTab === 'sales' ? 'orders' : 
                activeTab === 'clients' ? 'clients' : 
                activeTab === 'purchases' ? 'purchases' : 
                activeTab === 'expenses' ? 'expenses' :
                activeTab === 'admin' ? 'users' : 'technicalSpecs';

    if (activeTab === 'purchases' && !editingItem) {
      if (draftPurchaseItems.length === 0) {
        alert('Додайте хоча б один товар до закупівлі');
        setIsSubmitting(false);
        return;
      }
      try {
        const batch = writeBatch(db);
        const purchaseRef = doc(collection(db, 'purchases'));
        const totalAmount = draftPurchaseItems.reduce((acc, item) => acc + (item.qty * item.price), 0) + (data.deliveryCost || 0);
        const purchaseData = { ...data, totalAmount, isDeleted: false };
        batch.set(purchaseRef, purchaseData);
        
        draftPurchaseItems.forEach(item => {
          const itemRef = doc(collection(db, 'purchaseItems'));
          batch.set(itemRef, { ...item, costPrice: item.price, total: item.qty * item.price, purchaseId: purchaseRef.id, isDeleted: false });
        });
        
        await batch.commit();
        logAction('CREATE_PURCHASE_WITH_ITEMS', { id: purchaseRef.id, itemsCount: draftPurchaseItems.length });
        setIsModalOpen(false); setDraftPurchaseItems([]);
      } catch (err) { handleFirestoreError(err, OperationType.CREATE, 'purchases'); }
      finally { setIsSubmitting(false); }
      return;
    }

    if (activeTab === 'sales' && !editingItem) {
      if (draftOrderItems.length === 0) {
        alert('Додайте хоча б один товар до замовлення');
        setIsSubmitting(false);
        return;
      }
      try {
        const totalAmount = draftOrderItems.reduce((acc, item) => acc + (item.qty * item.price), 0);
        if (data.status === 'Виконано') {
          const heliumQuery = query(collection(db, 'helium'), limit(1));
          const heliumSnap = await getDocs(heliumQuery);

          await runTransaction(db, async (transaction) => {
            const orderRef = doc(collection(db, 'orders'));
            transaction.set(orderRef, { ...data, totalAmount, isDeleted: false });

            for (const item of draftOrderItems) {
              const stock = await calculateFreeStockInTransaction(db, transaction, item.productId);
              const requested = item.qty + (item.defect || 0);
              if (requested > stock.free) {
                throw new Error(`Недостатньо вільного залишку для товару ${item.productId}. Вільно: ${stock.free}, потрібно: ${requested}`);
              }

              const itemRef = doc(collection(db, 'orderItems'));
              transaction.set(itemRef, { ...item, total: item.qty * item.price, orderId: orderRef.id, isDeleted: false });

              const productRef = doc(db, 'products', item.productId);
              const productSnap = await transaction.get(productRef);
              if (productSnap.exists()) {
                const pData = productSnap.data() as Product;

                // Subtract Helium
                const heliumVolume = pData.heliumVolume || techSpecs.find(s => s.size === pData.size)?.heliumVolume || 0;
                if (heliumVolume > 0 && !heliumSnap.empty) {
                  const hRef = doc(db, 'helium', heliumSnap.docs[0].id);
                  const hSnap = await transaction.get(hRef);
                  if (hSnap.exists()) {
                    const consumedM3 = (heliumVolume * item.qty) / 1000;
                    transaction.update(hRef, { currentVolumeM3: Math.max(0, hSnap.data().currentVolumeM3 - consumedM3) });
                  }
                }
              }
            }
          });
        } else if (data.status === 'В обробці') {
          await runTransaction(db, async (transaction) => {
            const orderRef = doc(collection(db, 'orders'));
            transaction.set(orderRef, { ...data, totalAmount, isDeleted: false });

            for (const item of draftOrderItems) {
              const stock = await calculateFreeStockInTransaction(db, transaction, item.productId);
              if (item.qty > stock.free) {
                throw new Error(`Недостатньо вільного залишку для товару ${item.productId}. Вільно: ${stock.free}, потрібно: ${item.qty}`);
              }
              const itemRef = doc(collection(db, 'orderItems'));
              transaction.set(itemRef, { ...item, total: item.qty * item.price, orderId: orderRef.id, isDeleted: false });
            }
          });
        } else {
          // Чернетка / Скасовано: дозволяємо зберегти без резервування складу
          const batch = writeBatch(db);
          const orderRef = doc(collection(db, 'orders'));
          batch.set(orderRef, { ...data, totalAmount, isDeleted: false });
          draftOrderItems.forEach(item => {
            const itemRef = doc(collection(db, 'orderItems'));
            batch.set(itemRef, { ...item, total: item.qty * item.price, orderId: orderRef.id, isDeleted: false });
          });
          await batch.commit();
        }
        
        logAction('CREATE_ORDER_WITH_ITEMS', { itemsCount: draftOrderItems.length });
        setIsModalOpen(false); setDraftOrderItems([]);
      } catch (err) { handleFirestoreError(err, OperationType.CREATE, 'orders'); }
      finally { setIsSubmitting(false); }
      return;
    }

    try {
      if (editingItem) {
        const oldVal = { ...editingItem };
        
        // Handle Order Status Change to/from Completed
        if (activeTab === 'sales' && data.status !== oldVal.status) {
          const orderItemsQuery = query(collection(db, 'orderItems'), where('orderId', '==', editingItem.id), where('isDeleted', '==', false));
          const itemsSnap = await getDocs(orderItemsQuery);
          const items = itemsSnap.docs.map(d => ({ id: d.id, ...d.data() } as OrderItem));
          
          const heliumQuery = query(collection(db, 'helium'), limit(1));
          const heliumSnap = await getDocs(heliumQuery);

          await runTransaction(db, async (transaction) => {
            // Only proceed if moving to/from 'Виконано'
            if (data.status === 'Виконано' || oldVal.status === 'Виконано') {
              const modifier = data.status === 'Виконано' ? -1 : 1;
              
              for (const item of items) {
                if (data.status === 'Виконано') {
                  const stock = await calculateFreeStockInTransaction(db, transaction, item.productId, editingItem.id);
                  const requested = item.qty + (item.defect || 0);
                  if (requested > stock.free) {
                    throw new Error(`Недостатньо вільного залишку для товару ${item.productId}. Вільно: ${stock.free}, потрібно: ${requested}`);
                  }
                }

                const productRef = doc(db, 'products', item.productId);
                const productSnap = await transaction.get(productRef);
                if (productSnap.exists()) {
                  const pData = productSnap.data() as Product;
                  
                  // Update Helium Balance
                  const heliumVolume = pData.heliumVolume || techSpecs.find(s => s.size === pData.size)?.heliumVolume || 0;
                  if (heliumVolume > 0 && !heliumSnap.empty) {
                    const hDoc = heliumSnap.docs[0];
                    const hRef = doc(db, 'helium', hDoc.id);
                    const hSnap = await transaction.get(hRef);
                    if (hSnap.exists()) {
                      const hData = hSnap.data();
                      const consumedM3 = (heliumVolume * item.qty) / 1000;
                      transaction.update(hRef, { currentVolumeM3: Math.max(0, hData.currentVolumeM3 + (consumedM3 * modifier)) });
                    }
                  }
                }
              }
            }
            
            // Finally update the order status
            transaction.update(doc(db, col, editingItem.id), data);
          });
        } else {
          if (activeTab === 'clients') data.updatedAt = serverTimestamp();
          await updateDoc(doc(db, col, editingItem.id), data);
        }
        
        logAction('UPDATE', { collection: col, id: editingItem.id }, oldVal, data);
      } else {
        const finalData = {
          ...data,
          ...(activeTab === 'clients' ? { createdAt: serverTimestamp(), updatedAt: serverTimestamp() } : {}),
          isDeleted: false
        };
        const docRef = await addDoc(collection(db, col), finalData);
        logAction('CREATE', { collection: col, id: docRef.id }, null, finalData);
      }
      setIsModalOpen(false); setEditingItem(null);
    } catch (err) { handleFirestoreError(err, editingItem ? OperationType.UPDATE : OperationType.CREATE, col); }
    finally { setIsSubmitting(false); }
  };

  const saveDetailItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = Object.fromEntries(formData.entries());
    ['price', 'qty', 'defect'].forEach(key => { if (data[key]) data[key] = Number(data[key]); });
    
    const col = itemModalType === 'order' ? 'orderItems' : 'purchaseItems';
    const parentId = itemModalType === 'order' ? selectedOrderId : selectedPurchaseId;
    const parentKey = itemModalType === 'order' ? 'orderId' : 'purchaseId';
    
    if (itemModalType === 'order') {
      try {
        await runTransaction(db, async (transaction) => {
          const prodId = data.productId;
          const productRef = doc(db, 'products', prodId);
          const productSnap = await transaction.get(productRef);
          if (!productSnap.exists()) throw new Error("Товар не знайдено");
          const product = productSnap.data();

          const orderRef = doc(db, 'orders', parentId!);
          const orderSnap = await transaction.get(orderRef);
          if (!orderSnap.exists()) throw new Error("Замовлення не знайдено");
          const order = orderSnap.data();

          // Check stock if completed
          if (order.status === 'Виконано') {
            const stock = await calculateFreeStockInTransaction(db, transaction, prodId, parentId!);
            const requested = data.qty + (data.defect || 0);
            if (requested > stock.free) {
              throw new Error(`Недостатньо вільного залишку! Вільно: ${stock.free}, потрібно: ${requested}`);
            }
            
            // Helium update
            if (product.heliumVolume) {
              const heliumQuery = query(collection(db, 'helium'), limit(1));
              const heliumSnap = await getDocs(heliumQuery);
              if (!heliumSnap.empty) {
                const hDoc = heliumSnap.docs[0];
                const hRef = doc(db, 'helium', hDoc.id);
                // volume is in liters in product, m3 in tank? No, user says m3 in tank, and liters in product probably.
                // 1m3 = 1000L.
                const consumedM3 = (product.heliumVolume * data.qty) / 1000;
                transaction.update(hRef, { currentVolumeM3: Math.max(0, hDoc.data().currentVolumeM3 - consumedM3) });
              }
            }
          }

          if (order.status === 'В обробці') {
            const stock = await calculateFreeStockInTransaction(db, transaction, prodId);
            if (data.qty > stock.free) {
              throw new Error(`Недостатньо вільного залишку! Вільно: ${stock.free}, потрібно: ${data.qty}`);
            }
          }

          const finalData = { ...data, total: data.qty * data.price, [parentKey]: parentId, defect: data.defect || 0, isDeleted: false };
          const newDocRef = doc(collection(db, col));
          transaction.set(newDocRef, finalData);
          logAction('CREATE_DETAIL_TX', { collection: col, id: newDocRef.id }, null, finalData);
        });
        setIsItemModalOpen(false);
      } catch (err: any) {
        alert(err.message || "Помилка транзакції");
      } finally { setIsSubmitting(false); }
    } else {
      try {
        await runTransaction(db, async (transaction) => {
          const finalData = { ...data, costPrice: data.price, total: data.qty * data.price, [parentKey]: parentId, isDeleted: false };
          const newDocRef = doc(collection(db, col));
          transaction.set(newDocRef, finalData);
          logAction('CREATE_DETAIL_PURCHASE_TX', { collection: col, id: newDocRef.id }, null, finalData);
        });
        setIsItemModalOpen(false);
      } catch (err) { handleFirestoreError(err, OperationType.CREATE, col); }
      finally { setIsSubmitting(false); }
    }
  };

  const copyOrder = async (orderId: string) => {
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
        return {
          ...item,
          price: fixedPrice
        };
      });

      const newOrderData = {
        clientId: order.clientId,
        comment: `Копія замовлення ${orderId}. ${order.comment || ''}`,
        date: new Date().toISOString(),
        deliveryDate: order.deliveryDate || order.delivery || '',
        delivery: order.deliveryDate || order.delivery || '',
        managerId: order.managerId || order.manager || '',
        manager: order.managerId || order.manager || '',
        status: 'В обробці' as const,
        totalAmount: priceSnapshotItems.reduce((acc, item) => acc + (item.qty * item.price), 0),
        isDeleted: false
      };

      const orderRef = doc(collection(db, 'orders'));
      await runTransaction(db, async (transaction) => {
        transaction.set(orderRef, newOrderData);
        const plannedReserveByProduct: Record<string, number> = {};

        for (const item of priceSnapshotItems) {
          const stock = await calculateFreeStockInTransaction(db, transaction, item.productId);
          const alreadyPlanned = plannedReserveByProduct[item.productId] || 0;
          const availableNow = stock.free - alreadyPlanned;

          if (item.qty > availableNow) {
            throw new Error(`Недостатньо вільного залишку для копіювання товару ${item.productId}. Вільно: ${availableNow}, потрібно: ${item.qty}`);
          }

          const newDocRef = doc(collection(db, 'orderItems'));
          transaction.set(newDocRef, {
            orderId: orderRef.id,
            productId: item.productId,
            qty: item.qty,
            defect: 0,
            price: item.price,
            total: item.qty * item.price,
            isDeleted: false
          });

          plannedReserveByProduct[item.productId] = alreadyPlanned + item.qty;
        }
      });

      logAction('COPY_ORDER', { from: orderId, to: orderRef.id, copiedCount: priceSnapshotItems.length, skippedCount: items.length - priceSnapshotItems.length });
    } catch (err) { console.error("Copy failed", err); }
    finally { setIsSubmitting(false); }
  };

  const toggleArchive = useCallback(async (item: any, col: 'products' | 'clients') => {
    try {
      await updateDoc(doc(db, col, item.id), { isArchived: !item.isArchived });
      logAction('TOGGLE_ARCHIVE', { collection: col, id: item.id, isArchived: !item.isArchived });
    } catch (err) { console.error("Archive failed", err); }
  }, [user]);

  const deleteItem = useCallback(async (id: string) => {
    const col =
      activeTab === 'products' ? 'products' :
      activeTab === 'sales' ? 'orders' :
      activeTab === 'clients' ? 'clients' :
      activeTab === 'purchases' ? 'purchases' :
      activeTab === 'expenses' ? 'expenses' :
      'technicalSpecs';
    
    // Check for history
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
      hasHistory = (purchase?.status === 'Оплачено');
    }

    try { 
      if (hasHistory && (activeTab === 'products' || activeTab === 'clients')) {
        await updateDoc(doc(db, col, id), { isArchived: true, isDeleted: false });
        logAction('SOFT_ARCHIVE_INSTEAD_OF_DELETE', { collection: col, id });
        alert("Запис має історію операцій, тому його було архівовано замість видалення.");
      } else {
        await updateDoc(doc(db, col, id), { isDeleted: true }); 
        logAction('SOFT_DELETE', { collection: col, id });
      }
    } catch (err) { handleFirestoreError(err, OperationType.DELETE, col); }
  }, [activeTab, orderItems, purchaseItems, orders, purchases, user]);

  const deleteDetailItem = async (item: any, type: 'order' | 'purchase') => {
    const col = type === 'order' ? 'orderItems' : 'purchaseItems';
    try {
      if (type === 'order') {
        await runTransaction(db, async (transaction) => {
          const itemRef = doc(db, col, item.id);
          const itemSnap = await transaction.get(itemRef);
          if (!itemSnap.exists()) throw new Error("Позиція не знайдена");
          
          transaction.update(itemRef, { isDeleted: true });
          logAction('SOFT_DELETE_DETAIL_TX', { collection: col, id: item.id }, itemSnap.data(), null);
        });
      } else {
        await updateDoc(doc(db, col, item.id), { isDeleted: true });
        logAction('SOFT_DELETE_DETAIL', { collection: col, id: item.id }, item, null);
      }
    } catch (err) { 
      console.error("Delete detail failed", err);
      alert("Помилка при видаленні позиції");
    }
  };

  const handleTabChange = useCallback((tab: any) => {
    setActiveTab(tab);
    setSelectedOrderId(null);
    setSelectedPurchaseId(null);
    setIsModalOpen(false);
    setIsItemModalOpen(false);
    setEditingItem(null);
    setDraftPurchaseItems([]);
    setDraftOrderItems([]);
    setSearchTerm('');
    setProductSearch('');
  }, []);

  if (loading || (user && !currentUserData)) return (
    <div className="min-h-screen flex items-center justify-center bg-background flex-col gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-text-muted font-bold animate-pulse">Завантаження системи FEEL UP...</p>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-card border border-border p-12 rounded-[40px] shadow-2xl text-center">
        <div className="w-20 h-20 flex items-center justify-center mx-auto mb-8">
          <img src="/feelup-icon.svg" className="w-full h-full object-contain" alt="Logo" />
        </div>
        <h1 className="text-4xl font-head font-black mb-1 text-text-main tracking-tighter" style={{ color: '#70489d' }}>FEEL UP</h1>
        <p className="text-text-muted mb-10 text-sm uppercase tracking-widest font-medium">студія аеродизайну</p>
        
        <button onClick={handleLogin} className="w-full flex items-center justify-center gap-4 btn-primary text-lg py-5">
          <LogIn className="w-6 h-6" /> Увійти через Google
        </button>
      </motion.div>
    </div>
  );

  // Authorization check
  const isAuthorized = user && user.email && ALLOWED_EMAILS.includes(user.email);
  if (!isAuthorized) return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-card border border-rose-200 p-12 rounded-[40px] shadow-2xl text-center">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black mb-4 text-text-main">Доступ заборонено</h1>
        <p className="text-text-muted mb-8 text-base">
          На жаль, ваша електронна адреса <span className="font-bold text-text-main">{user.email}</span> не має прав доступу до системи FEEL UP.
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={() => signOut(auth)} className="w-full btn-primary bg-slate-800 hover:bg-slate-900 py-4 font-bold">
            Вийти з акаунта
          </button>
          <p className="text-xs text-text-muted">Зверніться до адміністратора для отримання доступу</p>
        </div>
      </motion.div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-text-main flex flex-col lg:flex-row text-sm transition-colors duration-300">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
          user={user} 
          currentUserData={currentUserData} 
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          onSignOut={() => signOut(auth)} 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto lg:mb-0">
          <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 bg-card border border-border rounded-xl text-text-muted hover:text-primary transition-all"
                >
                  <Menu className="w-5 h-5 lg:w-6 lg:h-6" />
                </button>
              </div>
              
              <div className="flex lg:hidden items-center gap-2 flex-1 justify-end">
                <div className="relative flex-1 max-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input 
                    type="text" 
                    placeholder="Пошук..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-2 bg-card border border-border rounded-xl w-full focus:ring-2 focus:ring-primary/10 outline-none transition-all text-xs text-text-main"
                  />
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className={`p-2 bg-card border rounded-xl transition-all relative shrink-0 ${isNotificationsOpen ? 'border-primary text-primary ring-2 ring-primary/10' : 'border-border text-text-muted hover:text-primary hover:border-primary'}`}
                  >
                    <Bell className="w-5 h-5" />
                    {stockAlerts.length > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border border-white rounded-full"></span>
                    )}
                  </button>

                  {isNotificationsOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                      <div className="absolute right-0 mt-3 w-[calc(100vw-32px)] sm:w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                        <div className="p-4 border-b border-border bg-slate-50/50 flex items-center justify-between">
                          <h3 className="font-bold text-sm text-text-main">Сповіщення</h3>
                          <span className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full text-[10px] font-black">{stockAlerts.length}</span>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto p-2">
                          {stockAlerts.length === 0 ? (
                            <div className="py-8 text-center text-text-muted">
                              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-20" />
                              <p className="text-xs">Немає нових сповіщень</p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Критичні залишки</p>
                              {stockAlerts.map(product => (
                                <button 
                                  key={product.id}
                                  onClick={() => {
                                    setSearchTerm(product.name);
                                    setActiveTab('products');
                                    setIsNotificationsOpen(false);
                                  }}
                                  className="w-full p-3 hover:bg-background border border-transparent hover:border-border rounded-xl transition-all flex items-center justify-between group text-left"
                                >
                                  <div>
                                    <p className="text-xs font-bold text-text-main group-hover:text-primary transition-colors">{product.name}</p>
                                    <p className="text-[10px] text-text-muted">{product.size} {product.color}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs font-black text-rose-500">{freeStock[product.id] || 0}</p>
                                    <p className="text-[8px] text-text-muted uppercase">шт</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="p-3 bg-slate-50/50 border-t border-border">
                          <button 
                            onClick={() => { setActiveTab('products'); setIsNotificationsOpen(false); }}
                            className="w-full py-2 text-[10px] font-bold text-primary hover:underline"
                          >
                            Перейти до складу
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="hidden lg:block">
                <h2 className="text-xl lg:text-2xl font-bold text-text-main mb-0.5">
                  {activeTab === 'dashboard' ? 'FEEL UP - студія аеродизайну' : 
                   activeTab === 'products' ? 'Управління складом' : 
                   activeTab === 'sales' ? 'Журнал продажів' : 
                   activeTab === 'clients' ? 'База клієнтів' : 
                   activeTab === 'purchases' ? 'Закупівлі' : 
                   activeTab === 'expenses' ? 'Фінансові витрати' :
                   activeTab === 'info' ? 'Про програму' : 'Технічні норми'}
                </h2>
                <p className="text-slate-500 text-sm lg:text-base">
                  {activeTab === 'dashboard' ? '' : (activeTab === 'info' ? 'Як працює ваш FEEL UP' : 'Ось що відбувається сьогодні')}
                </p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input 
                  type="text" 
                  placeholder="Швидкий пошук..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl w-full md:w-64 focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm text-text-main"
                />
              </div>
              <div className="relative">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`p-3 bg-card border rounded-xl transition-all relative shrink-0 ${isNotificationsOpen ? 'border-primary text-primary ring-2 ring-primary/10' : 'border-border text-text-muted hover:text-primary hover:border-primary'}`}
                >
                  <Bell className="w-5 h-5" />
                  {stockAlerts.length > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <div className="p-4 border-b border-border bg-slate-50/50 flex items-center justify-between">
                        <h3 className="font-bold text-sm text-text-main">Сповіщення</h3>
                        <span className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full text-[10px] font-black">{stockAlerts.length}</span>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto p-2">
                        {stockAlerts.length === 0 ? (
                          <div className="py-8 text-center text-text-muted">
                            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p className="text-xs">Немає нових сповіщень</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Критичні залишки</p>
                            {stockAlerts.map(product => (
                              <button 
                                key={product.id}
                                onClick={() => {
                                  setSearchTerm(product.name);
                                  setActiveTab('products');
                                  setIsNotificationsOpen(false);
                                }}
                                className="w-full p-3 hover:bg-background border border-transparent hover:border-border rounded-xl transition-all flex items-center justify-between group text-left"
                              >
                                <div>
                                  <p className="text-xs font-bold text-text-main group-hover:text-primary transition-colors">{product.name}</p>
                                  <p className="text-[10px] text-text-muted">{product.size} {product.color}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-black text-rose-500">{freeStock[product.id] || 0}</p>
                                  <p className="text-[8px] text-text-muted uppercase">шт</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="p-3 bg-slate-50/50 border-t border-border">
                        <button 
                          onClick={() => { setActiveTab('products'); setIsNotificationsOpen(false); }}
                          className="w-full py-2 text-[10px] font-bold text-primary hover:underline"
                        >
                          Перейти до складу
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {activeTab === 'dashboard' ? (
            <div className="flex flex-col gap-4 lg:gap-6">
              {/* Layout for Mobile vs Desktop is handled below with responsive classes */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
                
                {/* Left/Main Column */}
                <div className="lg:col-span-8 flex flex-col gap-4 lg:gap-6">
                  
                  {/* Mobile Header + Stats Section */}
                  <div className="lg:hidden flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-black text-text-main leading-tight">FEEL UP Studio</h2>
                        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Business System</p>
                      </div>
                    </div>
                    
                    <HeliumTankCard balance={dashboardStats.heliumBalance} onCalibrate={() => setIsHeliumModalOpen(true)} />
                    
                    {/* Compact 2x2 grid for metric cards on mobile to fit screen */}
                    <div className="grid grid-cols-2 gap-2">
                      <StatCard label="Прибуток" value={`${dashboardStats.totalMargin} ₴`} icon={Wallet} color="bg-indigo-500" trend="Маржа" up={true} />
                      <StatCard label="Дохід" value={`${dashboardStats.totalIncome} ₴`} icon={ArrowUpRight} color="bg-emerald-500" trend="Гроші" up={true} />
                      <StatCard label="Витрати" value={`${dashboardStats.totalExpenses} ₴`} icon={ArrowDownRight} color="bg-rose-500" trend="Разом" up={false} />
                      <StatCard label="Сер. чек" value={`${dashboardStats.avgCheck} ₴`} icon={TrendingUp} color="bg-amber-500" trend="ОК" up={true} />
                    </div>
                  </div>

                  {/* Desktop Stats (Enlarged but proportional) */}
                  <div className="hidden lg:grid grid-cols-4 gap-4">
                    <StatCard label="Чистий прибуток" value={`${dashboardStats.totalMargin} ₴`} icon={Wallet} color="bg-indigo-500" trend="Маржа" up={true} isLarge />
                    <StatCard label="Дохід" value={`${dashboardStats.totalIncome} ₴`} icon={ArrowUpRight} color="bg-emerald-500" trend="Гроші" up={true} isLarge />
                    <StatCard label="Витрати" value={`${dashboardStats.totalExpenses} ₴`} icon={ArrowDownRight} color="bg-rose-500" trend="Оплачено" up={false} isLarge />
                    <StatCard label="Сер. чек" value={`${dashboardStats.avgCheck} ₴`} icon={TrendingUp} color="bg-amber-500" trend="Замовлення" up={true} isLarge />
                  </div>

                  {/* Balanced AI Assistant & Chart on Desktop */}
                  <div className="h-[380px] lg:h-[450px]">
                    <ProfitChart data={chartData} />
                  </div>
                </div>

                {/* Right/Side Column */}
                <div className="lg:col-span-4 flex flex-col gap-4 lg:gap-6">
                  <div className="hidden lg:block">
                    <HeliumTankCard balance={dashboardStats.heliumBalance} onCalibrate={() => setIsHeliumModalOpen(true)} />
                  </div>
                  
                  <StockAlerts alerts={stockAlerts} inventory={inventory} />

                  <div className="hidden lg:block h-full">
                    <RecentOrders 
                      orders={orders} 
                      clients={clients} 
                      orderTotals={orderTotals} 
                      onViewAll={() => setActiveTab('sales')} 
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'info' ? (
            <InfoTab />
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 overflow-x-auto pb-1 md:pb-0 no-scrollbar overflow-y-hidden">
                  <div className="bg-card border border-border rounded-2xl p-1.5 flex gap-1 shrink-0">
                    <button onClick={() => setSearchTerm('')} className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${searchTerm === '' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:bg-background'}`}>Всі</button>
                    {(activeTab === 'products' || activeTab === 'clients') && (
                      <button 
                        onClick={() => setSearchTerm(prev => prev === 'archived' ? '' : 'archived')} 
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${searchTerm === 'archived' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-text-muted hover:bg-background'}`}
                      >
                        Архів
                      </button>
                    )}
                  </div>
                </div>
                {activeTab === 'admin' ? (
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full sm:w-auto">
                    <label className="btn-primary bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2 cursor-pointer py-2 px-3 text-[10px] font-bold whitespace-nowrap">
                      <Upload className="w-3 h-3" /> Імпорт
                      <input type="file" accept=".json" onChange={importData} className="hidden" />
                    </label>
                    <button onClick={exportData} className="btn-primary bg-slate-800 hover:bg-slate-900 flex items-center justify-center gap-2 py-2 px-3 text-[10px] font-bold shadow-none whitespace-nowrap">
                      <Download className="w-3 h-3" /> .JSON
                    </button>
                    <button onClick={() => exportToCSV('orders')} className="btn-primary bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2 py-2 px-3 text-[10px] font-bold shadow-none whitespace-nowrap">
                      <Download className="w-3 h-3" /> Продажі .CSV
                    </button>
                    <button onClick={() => exportToCSV('inventory')} className="btn-primary bg-amber-600 hover:bg-amber-700 flex items-center justify-center gap-2 py-2 px-3 text-[10px] font-bold shadow-none whitespace-nowrap">
                      <Download className="w-3 h-3" /> Склад .CSV
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    {(activeTab === 'sales' || activeTab === 'products') && (
                      <button 
                        onClick={() => exportToCSV(activeTab === 'sales' ? 'orders' : 'inventory')} 
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-card border border-border rounded-xl text-text-muted hover:text-primary hover:border-primary transition-all flex items-center justify-center gap-2 font-bold text-xs"
                      >
                        <Download className="w-4 h-4" /> Експорт .CSV
                      </button>
                    )}
                    <button onClick={() => {
                       setEditingItem(null);
                       setIsModalOpen(true);
                    }} className="flex-1 sm:flex-none btn-primary py-2.5 px-6 flex items-center justify-center gap-2 text-xs font-bold shadow-lg shadow-primary/25 whitespace-nowrap">
                      <Plus className="w-4 h-4" /> Додати
                    </button>
                  </div>
                )}
              </div>

              {activeTab === 'products' && (
                <InventoryTab 
                  products={products} 
                  inventory={inventory} 
                  searchTerm={searchTerm} 
                  onToggleArchive={(p) => toggleArchive(p, 'products')} 
                  onEdit={(p) => { setEditingItem(p); setIsModalOpen(true); }} 
                  onDelete={deleteItem} 
                />
              )}
              {activeTab === 'sales' && (
                <SalesTab 
                  orders={orders} 
                  clients={clients} 
                  orderItems={orderItems} 
                  products={products} 
                  techSpecs={techSpecs} 
                  orderTotals={orderTotals} 
                  searchTerm={searchTerm} 
                  selectedOrderId={selectedOrderId}
                  onSelectOrder={setSelectedOrderId}
                  onCopy={copyOrder} 
                  onEdit={(o) => { setEditingItem(o); setIsModalOpen(true); }} 
                  onDelete={deleteItem} 
                  onGeneratePDF={generatePDF}
                />
              )}
              {activeTab === 'clients' && (
                <ClientsTab 
                  clients={clients} 
                  searchTerm={searchTerm} 
                  onToggleArchive={(c) => toggleArchive(c, 'clients')} 
                  onEdit={(c) => { setEditingItem(c); setIsModalOpen(true); }} 
                  onDelete={deleteItem} 
                />
              )}
              {activeTab === 'purchases' && (
                <PurchasesTab 
                  purchases={purchases} 
                  purchaseTotals={purchaseTotals} 
                  searchTerm={searchTerm} 
                  selectedPurchaseId={selectedPurchaseId}
                  onSelectPurchase={setSelectedPurchaseId}
                  onEdit={(p) => { setEditingItem(p); setIsModalOpen(true); }} 
                  onDelete={deleteItem} 
                />
              )}
              {activeTab === 'expenses' && (
                <ExpensesTab 
                  expenses={expenses} 
                  searchTerm={searchTerm} 
                  onEdit={(e) => { setEditingItem(e); setIsModalOpen(true); }} 
                  onDelete={deleteItem} 
                />
              )}
              {activeTab === 'specs' && (
                <SpecsTab 
                  specs={techSpecs} 
                  onEdit={(s) => { setEditingItem(s); setIsModalOpen(true); }} 
                  onDelete={deleteItem} 
                />
              )}
              {activeTab === 'admin' && (
                <AdminTab 
                  users={appUsers} 
                  onEditUser={(u) => { setEditingItem(u); setIsModalOpen(true); }} 
                  onClearOldLogs={clearOldLogs} 
                  onClearWarehouse={clearWarehouse} 
                  onTriggerBackup={triggerManualBackup} 
                  backups={backups} 
                  trashItems={trashItems} 
                  onRestoreItem={restoreItem} 
                  isSubmitting={isSubmitting} 
                  showConfirmWarehouse={showConfirmWarehouse} 
                  setShowConfirmWarehouse={setShowConfirmWarehouse} 
                />
              )}
            </div>
          )}

          <AnimatePresence>
            <OrderDetailsView 
              selectedOrderId={selectedOrderId}
              selectedPurchaseId={selectedPurchaseId}
              orders={orders}
              purchases={purchases}
              orderItems={orderItems}
              purchaseItems={purchaseItems}
              products={products}
              onGeneratePDF={generatePDF}
              onAddItem={() => {
                setItemModalType(selectedOrderId ? 'order' : 'purchase');
                setIsItemModalOpen(true);
              }}
              onDeleteItem={deleteDetailItem}
            />
          </AnimatePresence>
        </main>

        {/* Helium Calibration Modal */}
        <Modal isOpen={isHeliumModalOpen} onClose={() => setIsHeliumModalOpen(false)} title="Колібрування та облік гелію">
          <form className="space-y-6" onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const currentVolumeM3 = Number(formData.get('currentVolumeM3'));
            const capacityM3 = Number(formData.get('capacityM3'));
            const name = formData.get('name') as string;

            try {
              setIsSubmitting(true);
              if (heliumTanks.length > 0) {
                await updateDoc(doc(db, 'helium', heliumTanks[0].id), { currentVolumeM3, capacityM3, name, lastCalibrationDate: serverTimestamp() });
              } else {
                await addDoc(collection(db, 'helium'), { currentVolumeM3, capacityM3, name, lastCalibrationDate: serverTimestamp(), isDeleted: false });
              }
              setIsHeliumModalOpen(false);
              logAction('HELIUM_CALIBRATION', { currentVolumeM3, capacityM3 });
            } catch (err) { alert("Помилка при збереженні даних гелію"); }
            finally { setIsSubmitting(false); }
          }}>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="text-sm font-bold text-slate-500 block mb-2">Назва балона</label>
                <input name="name" defaultValue={heliumTanks[0]?.name || "Основний 40л"} required className="input-field" />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-500 block mb-2">Об'єм балона (м³)</label>
                <input name="capacityM3" type="number" step="any" defaultValue={heliumTanks[0]?.capacityM3 || 6.0} required className="input-field" />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-500 block mb-2">Поточний залишок (м³)</label>
                <input name="currentVolumeM3" type="number" step="any" defaultValue={heliumTanks[0]?.currentVolumeM3 || 0} required className="input-field" />
              </div>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700 leading-relaxed">
                Введіть актуальні показники з манометра (у м³). 40-літровий балон зазвичай має об'єм 6.0 м³ при 150 атм. 
                Система автоматично списує газ при продажі кульок, але через витоки та фізичні особливості рекомендується регулярне ручне калібрування.
              </p>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full btn-primary">Зберегти показники</button>
          </form>
        </Modal>

        {/* Modal Form */}
        <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingItem(null); }} title={editingItem ? 'Редагувати' : 'Додати новий запис'}>
          <form onSubmit={saveItem} className="space-y-8">
            {activeTab === 'products' && <ProductForm editingItem={editingItem as any} />}
            {activeTab === 'sales' && (
              <OrderForm 
                editingItem={editingItem as any} 
                clients={clients} 
                products={products} 
                draftOrderItems={draftOrderItems} 
                setDraftOrderItems={setDraftOrderItems} 
                productSearch={productSearch} 
                setProductSearch={setProductSearch} 
              />
            )}
            {activeTab === 'clients' && <ClientForm editingItem={editingItem as any} />}
            {activeTab === 'specs' && <SpecForm editingItem={editingItem as any} />}
            {activeTab === 'purchases' && (
              <PurchaseForm 
                editingItem={editingItem as any} 
                products={products} 
                draftPurchaseItems={draftPurchaseItems} 
                setDraftPurchaseItems={setDraftPurchaseItems} 
                productSearch={productSearch} 
                setProductSearch={setProductSearch} 
              />
            )}
            {activeTab === 'expenses' && <ExpenseForm editingItem={editingItem as any} />}
            {activeTab === 'admin' && <UserForm editingItem={editingItem as any} />}
            
            <button type="submit" disabled={isSubmitting} className="w-full btn-primary text-xl py-5 disabled:opacity-50">
              {isSubmitting ? 'Збереження...' : 'Зберегти'}
            </button>
          </form>
        </Modal>

        <Modal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} title="Додати позицію">
          <form onSubmit={saveDetailItem} className="space-y-8">
            <DetailItemForm 
              itemModalType={itemModalType} 
              products={products} 
              orderItems={orderItems} 
              selectedOrderId={selectedOrderId} 
            />
            <button type="submit" disabled={isSubmitting} className="w-full btn-primary text-xl py-5 disabled:opacity-50">
              {isSubmitting ? 'Збереження...' : 'Додати'}
            </button>
          </form>
        </Modal>

        <AiAssistant 
          chatHistory={chatHistory} 
          isLoading={isAiLoading} 
          onSendMessage={handleAiChat} 
          mode="floating"
        />
      </div>
    </ErrorBoundary>
  );
}