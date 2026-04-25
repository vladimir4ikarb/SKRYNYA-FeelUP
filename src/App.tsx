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
  Menu,
  FileMinus
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
  getDoc,
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
  TechnicalSpec,
  WriteOff,
  WriteOffItem
} from './types';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Modal } from './components/common/Modal';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { AiAssistant } from './components/dashboard/AiAssistant';
import { InventoryTab } from './components/inventory/InventoryTab';
import { SalesTab } from './components/sales/SalesTab';
import { ClientsTab } from './components/clients/ClientsTab';
import { PurchasesTab } from './components/purchases/PurchasesTab';
import { WriteOffsTab } from './components/writeOffs/WriteOffsTab';
import { SpecsTab } from './components/specs/SpecsTab';
import { ExpensesTab } from './components/finance/ExpensesTab';
import { AdminTab } from './components/admin/AdminTab';
import { InfoTab } from './components/info/InfoTab';
import { OrderDetailsView } from './components/common/OrderDetailsView';
import { ProductForm } from './components/forms/ProductForm';
import { OrderForm } from './components/forms/OrderForm';
import { ClientForm } from './components/forms/ClientForm';
import { PurchaseForm } from './components/forms/PurchaseForm';
import { WriteOffForm } from './components/forms/WriteOffForm';
import { SpecForm } from './components/forms/SpecForm';
import { ExpenseForm } from './components/forms/ExpenseForm';
import { UserForm } from './components/forms/UserForm';
import { DetailItemForm } from './components/forms/DetailItemForm';
import { useInventory } from './hooks/useInventory';
import { calculateFreeStockInTransaction } from './services/inventoryTransactionService';

import { useAppAuth } from './hooks/useAppAuth';
import { useAppData } from './hooks/useAppData';
import { logAction } from './services/loggerService';
import { restoreItem, clearWarehouse, clearOldLogs, normalizeProductCategories } from './services/adminService';
import { exportData, exportToCSV, generatePDF, importData, importProductsFromCSV } from './services/exportService';

import { useAppAnalytics } from './hooks/useAppAnalytics';
import { useAppDataActions } from './hooks/useAppDataActions';

import { HeliumModal } from './components/modals/HeliumModal';
import { EntityModal } from './components/modals/EntityModal';
import { DetailItemModal } from './components/modals/DetailItemModal';

// --- Main App ---

const ALLOWED_EMAILS = ['vladimir.chuguev@gmail.com', 'feelup.balloons@gmail.com'];

export default function App() {
  const { user, currentUserData, loading: authLoading } = useAppAuth();
  const { 
    products, clients, orders, orderItems, purchases, purchaseItems, 
    writeOffs, writeOffItems,
    expenses, techSpecs, heliumTanks, appUsers, suppliers, trashItems 
  } = useAppData(user, currentUserData);

  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'sales' | 'clients' | 'purchases' | 'expenses' | 'write-offs' | 'specs' | 'admin' | 'info' | 'logs' | 'trash'>('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);
  const [selectedWriteOffId, setSelectedWriteOffId] = useState<string | null>(null);
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
  const [showConfirmWarehouse, setShowConfirmWarehouse] = useState(false);
  const [backups, setBackups] = useState<{ name: string, date: string, size: number }[]>([]);
  const [isHeliumModalOpen, setIsHeliumModalOpen] = useState(false);
  const [draftPurchaseItems, setDraftPurchaseItems] = useState<{ productId: string, qty: number, price: number }[]>([]);
  const [draftOrderItems, setDraftOrderItems] = useState<{ productId: string, qty: number, price: number }[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [activeTab]);

  const { actualStock, freeStock } = useInventory(products, purchaseItems, purchases, orderItems, orders, writeOffItems, writeOffs);
  const inventory = actualStock;
  
  const { orderTotals, purchaseTotals, dashboardStats, chartData, stockAlerts } = useAppAnalytics(
    products, clients, orders, orderItems, purchases, purchaseItems, expenses, heliumTanks, techSpecs, freeStock
  );

  const categories = useMemo(() => {
    const cats = products.map(p => p.category).filter(Boolean);
    return Array.from(new Set(cats)).sort();
  }, [products]);

  const fetchBackups = async () => {
    try {
      const resp = await fetch('/api/backups');
      const data = await resp.json();
      setBackups(data);
    } catch (err) {
      console.error("Fetch backups failed", err);
    }
  };

  useEffect(() => {
    if (activeTab === 'admin') {
      fetchBackups();
    }
  }, [activeTab]);

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
          systemInstruction: "Ви - AI-асистент для студії аеродизайну 'FEEL UP'. Допомагайте з управлінням замовленнями, складом та клієнтами. Будьте лаконічними та професійними."
        }
      });
      const aiText = response.text || "Вибачте, я не зміг згенерувати відповідь.";
      setChatHistory(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error("AI Error:", error);
      setChatHistory(prev => [...prev, { role: 'model', text: "Помилка підключення до AI." }]);
    } finally {
      setIsAiLoading(false);
    }
  }, [chatHistory]);

  const handleLogin = async () => {
    try { await signInWithPopup(auth, googleProvider); } catch (error) { console.error("Login failed", error); }
  };

  const { 
    saveItem, saveDetailItem, copyOrder, toggleArchive, deleteItem, deleteDetailItem, 
    isSubmitting, setIsSubmitting 
  } = useAppDataActions(
    user, activeTab, editingItem, setEditingItem, setIsModalOpen, 
    draftOrderItems, setDraftOrderItems, draftPurchaseItems, setDraftPurchaseItems, 
    techSpecs, suppliers, purchases, expenses, writeOffs, writeOffItems, selectedOrderId, selectedPurchaseId,
    setProductSearch
  );

  const onCopyOrder = (id: string) => copyOrder(id, orders, orderItems, products);
  const onDeleteItem = (id: string) => deleteItem(id, orders, orderItems, purchases, purchaseItems);
  const onToggleArchive = (item: any, col: 'products' | 'clients') => toggleArchive(item, col);
  const onDeleteDetailItem = (item: any, type: 'order' | 'purchase') => deleteDetailItem(item, type);

  const triggerManualBackup = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const backupData = {
        products, clients, orders, orderItems, purchases, purchaseItems, 
        expenses, specs: techSpecs, helium: heliumTanks, users: appUsers
      };
      await fetch('/api/backups/save', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: backupData, timestamp: new Date().toISOString() })
      });
      await fetchBackups();
      alert("Резервна копія успішно створена.");
      logAction(user, 'MANUAL_BACKUP', { timestamp: new Date().toISOString() });
    } catch (err) {
      console.error("Backup push failed:", err);
      alert("Помилка при створенні копії.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRestoreItem = (id: string, col: string) => restoreItem(id, col, trashItems, clients, isSubmitting, setIsSubmitting, user);
  const onClearWarehouse = () => clearWarehouse(user, currentUserData, isSubmitting, setIsSubmitting, setShowConfirmWarehouse);
  const onClearOldLogs = () => clearOldLogs(user, currentUserData, isSubmitting, setIsSubmitting);
  const onNormalizeCategories = () => normalizeProductCategories(user);
  const onSaveItem = (e: React.FormEvent) => saveItem(e);
  const onSaveDetailItem = (e: React.FormEvent) => saveDetailItem(e, itemModalType);
  const onExportData = () => exportData(user, products, clients, orders, orderItems, purchases, purchaseItems, techSpecs);
  const onImportData = (e: React.ChangeEvent<HTMLInputElement>) => importData(e, user, setIsSubmitting);
  const onImportProductsCSV = (e: React.ChangeEvent<HTMLInputElement>) => importProductsFromCSV(e, user, setIsSubmitting);
  const onExportToCSV = (type: 'orders' | 'inventory') => exportToCSV(user, type, orders, clients, products, orderTotals, inventory);
  const onGeneratePDF = (orderId: string) => generatePDF(user, orderId, orders, clients, products, orderItems, orderTotals);

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
  }, []);

  if (loading || (user && !currentUserData)) return (
    <ErrorBoundary>
      <div className="min-h-screen flex items-center justify-center bg-background flex-col gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-text-muted font-bold animate-pulse">Завантаження системи FEEL UP...</p>
      </div>
    </ErrorBoundary>
  );

  if (!user) return (
    <ErrorBoundary>
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-card border border-border p-12 rounded-[40px] shadow-2xl text-center">
          <div className="w-24 h-24 flex items-center justify-center mx-auto mb-8">
            <img src="/logo_dark.png" className="w-full h-full object-contain" alt="Logo" />
          </div>
          <h1 className="text-4xl font-head font-black mb-1 text-text-main tracking-tighter" style={{ color: '#70489d' }}>FEEL UP</h1>
          <p className="text-text-muted mb-10 text-sm uppercase tracking-widest font-medium">студія аеродизайну</p>
          
          <button onClick={handleLogin} className="w-full flex items-center justify-center gap-4 btn-primary text-lg py-5">
            <LogIn className="w-6 h-6" /> Увійти через Google
          </button>
        </motion.div>
      </div>
    </ErrorBoundary>
  );

  // Authorization check
  const isAuthorized = user && user.email && ALLOWED_EMAILS.includes(user.email);
  if (!isAuthorized) return (
    <ErrorBoundary>
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
            <button onClick={() => signOut(auth)} className="w-full btn-primary bg-sidebar hover:bg-sidebar py-4 font-bold">
              Вийти з акаунта
            </button>
            <p className="text-xs text-text-muted">Зверніться до адміністратора для отримання доступу</p>
          </div>
        </motion.div>
      </div>
    </ErrorBoundary>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-text-main flex flex-col lg:flex-row text-sm transition-colors duration-300">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={(tab: any) => {
            handleTabChange(tab);
            setIsSidebarOpen(false);
          }}
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
          <Header 
            activeTab={activeTab}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            isNotificationsOpen={isNotificationsOpen}
            setIsNotificationsOpen={setIsNotificationsOpen}
            stockAlerts={stockAlerts}
            freeStock={freeStock}
            setActiveTab={setActiveTab}
            setIsSidebarOpen={setIsSidebarOpen}
          />

          {activeTab === 'dashboard' ? (
            <DashboardView 
              dashboardStats={dashboardStats}
              chartData={chartData}
              stockAlerts={stockAlerts}
              inventory={inventory}
              orders={orders}
              clients={clients}
              orderTotals={orderTotals}
              setActiveTab={setActiveTab}
              setIsHeliumModalOpen={setIsHeliumModalOpen}
            />
          ) : activeTab === 'info' ? (
            <InfoTab />
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 overflow-x-auto pb-1 md:pb-0 no-scrollbar overflow-y-hidden">
                  <div className="bg-card border border-border rounded-2xl p-1 sm:p-1.5 flex gap-1 shrink-0">
                    <button onClick={() => setSearchTerm('')} className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-[11px] sm:text-xs transition-all ${searchTerm === '' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:bg-background'}`}>Всі</button>
                    {(activeTab === 'products' || activeTab === 'clients') && (
                      <button 
                        onClick={() => setSearchTerm(prev => prev === 'archived' ? '' : 'archived')} 
                        className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-[11px] sm:text-xs transition-all ${searchTerm === 'archived' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-text-muted hover:bg-background'}`}
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
                      <input type="file" accept=".json" onChange={onImportData} className="hidden" />
                    </label>
                    <button onClick={onExportData} className="btn-primary bg-sidebar hover:bg-sidebar flex items-center justify-center gap-2 py-2 px-3 text-[10px] font-bold shadow-none whitespace-nowrap">
                      <Download className="w-3 h-3" /> .JSON
                    </button>
                    <button onClick={() => onExportToCSV('orders')} className="btn-primary bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2 py-2 px-3 text-[10px] font-bold shadow-none whitespace-nowrap">
                      <Download className="w-3 h-3" /> Продажі .CSV
                    </button>
                    <button onClick={() => onExportToCSV('inventory')} className="btn-primary bg-amber-600 hover:bg-amber-700 flex items-center justify-center gap-2 py-2 px-3 text-[10px] font-bold shadow-none whitespace-nowrap">
                      <Download className="w-3 h-3" /> Склад .CSV
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    {activeTab === 'products' && (
                      <label className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-600/10 border border-emerald-600/30 rounded-xl text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2 font-bold text-[11px] sm:text-xs cursor-pointer">
                        <Upload className="w-3.5 h-3.5 sm:w-4 h-4" /> Імпорт CSV
                        <input type="file" accept=".csv" onChange={onImportProductsCSV} className="hidden" />
                      </label>
                    )}
                    {(activeTab === 'sales' || activeTab === 'products') && (
                      <button 
                        onClick={() => onExportToCSV(activeTab === 'sales' ? 'orders' : 'inventory')} 
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-card border border-border rounded-xl text-text-muted hover:text-primary hover:border-primary transition-all flex items-center justify-center gap-2 font-bold text-[11px] sm:text-xs"
                      >
                        <Download className="w-3.5 h-3.5 sm:w-4 h-4" /> Експорт .CSV
                      </button>
                    )}
                    <button onClick={() => {
                       setEditingItem(null);
                       setDraftOrderItems([]);
                       setDraftPurchaseItems([]);
                       setProductSearch('');
                       setIsModalOpen(true);
                    }} className="flex-1 sm:flex-none btn-primary py-2 sm:py-2.5 px-4 sm:px-6 flex items-center justify-center gap-2 text-[11px] sm:text-xs font-bold shadow-lg shadow-primary/25 whitespace-nowrap">
                      <Plus className="w-3.5 h-3.5 sm:w-4 h-4" /> Додати
                    </button>
                  </div>
                )}
              </div>

              {activeTab === 'products' && (
                <InventoryTab 
                  products={products} 
                  inventory={inventory} 
                  purchases={purchases}
                  purchaseItems={purchaseItems}
                  searchTerm={searchTerm} 
                  onToggleArchive={(p) => onToggleArchive(p, 'products')} 
                  onEdit={(p) => { setEditingItem(p); setIsModalOpen(true); }} 
                  onDelete={onDeleteItem} 
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
                  onCopy={onCopyOrder} 
                    onEdit={(o) => { 
                    setEditingItem(o); 
                    // Load and populate draft items from orderItems
                    const items = orderItems
                      .filter(oi => oi.orderId === o.id && !oi.isDeleted)
                      .map(i => ({ 
                        productId: i.productId, 
                        qty: i.qty, 
                        price: i.price
                      }));
                    setDraftOrderItems(items);
                    setIsModalOpen(true); 
                  }} 
                  onDelete={onDeleteItem} 
                  onGeneratePDF={onGeneratePDF}
                />
              )}
              {activeTab === 'clients' && (
                <ClientsTab 
                  clients={clients} 
                  searchTerm={searchTerm} 
                  onToggleArchive={(c) => onToggleArchive(c, 'clients')} 
                  onEdit={(c) => { setEditingItem(c); setIsModalOpen(true); }} 
                  onDelete={onDeleteItem} 
                />
              )}
              {activeTab === 'purchases' && (
                <PurchasesTab 
                  purchases={purchases} 
                  purchaseTotals={purchaseTotals} 
                  searchTerm={searchTerm} 
                  selectedPurchaseId={selectedPurchaseId}
                  onSelectPurchase={setSelectedPurchaseId}
                  onEdit={(p) => { 
                    setEditingItem(p); 
                    setDraftPurchaseItems(purchaseItems.filter(pi => pi.purchaseId === p.id && !pi.isDeleted).map(pi => ({ 
                      productId: pi.productId, 
                      qty: pi.qty, 
                      price: pi.costPrice || pi.price || 0 
                    })));
                    setIsModalOpen(true); 
                  }} 
                  onDelete={onDeleteItem} 
                />
              )}
              {activeTab === 'write-offs' && (
                <WriteOffsTab
                  writeOffs={writeOffs}
                  searchTerm={searchTerm}
                  selectedWriteOffId={selectedWriteOffId}
                  onSelectWriteOff={setSelectedWriteOffId}
                  onEdit={(w) => {
                    setEditingItem(w);
                    const items = writeOffItems.filter(wi => wi.writeOffId === w.id && !wi.isDeleted);
                    setDraftPurchaseItems(items.map(i => ({ productId: i.productId, qty: i.qty, price: 0 })));
                    setIsModalOpen(true);
                  }}
                  onDelete={onDeleteItem}
                />
              )}
              {activeTab === 'expenses' && (
                <ExpensesTab 
                  expenses={expenses} 
                  searchTerm={searchTerm} 
                  onEdit={(e) => { setEditingItem(e); setIsModalOpen(true); }} 
                  onDelete={onDeleteItem} 
                />
              )}
              {activeTab === 'specs' && (
                <SpecsTab 
                  specs={techSpecs} 
                  onEdit={(s) => { setEditingItem(s); setIsModalOpen(true); }} 
                  onDelete={onDeleteItem} 
                />
              )}
              {activeTab === 'admin' && (
                <AdminTab 
                  users={appUsers} 
                  onEditUser={(u) => { setEditingItem(u); setIsModalOpen(true); }} 
                  onClearOldLogs={onClearOldLogs} 
                  onNormalizeCategories={onNormalizeCategories}
                  onClearWarehouse={onClearWarehouse} 
                  onTriggerBackup={triggerManualBackup} 
                  backups={backups} 
                  trashItems={trashItems} 
                  onRestoreItem={onRestoreItem} 
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
              selectedWriteOffId={selectedWriteOffId}
              orders={orders}
              purchases={purchases}
              writeOffs={writeOffs}
              orderItems={orderItems}
              purchaseItems={purchaseItems}
              writeOffItems={writeOffItems}
              products={products}
              onGeneratePDF={onGeneratePDF}
              onAddItem={() => {
                setItemModalType(selectedOrderId ? 'order' : 'purchase');
                setIsItemModalOpen(true);
              }}
              onDeleteItem={onDeleteDetailItem}
            />
          </AnimatePresence>
        </main>

        <HeliumModal 
          isOpen={isHeliumModalOpen} 
          onClose={() => setIsHeliumModalOpen(false)} 
          heliumTanks={heliumTanks} 
          isSubmitting={isSubmitting} 
          setIsSubmitting={setIsSubmitting} 
          user={user} 
        />

        <EntityModal 
          isOpen={isModalOpen} 
          onClose={() => { 
            setIsModalOpen(false); 
            setEditingItem(null); 
            // Crucial: Clear all draft states
            setDraftOrderItems([]);
            setDraftPurchaseItems([]);
            setProductSearch('');
          }} 
          activeTab={activeTab} 
          editingItem={editingItem} 
          onSave={onSaveItem} 
          isSubmitting={isSubmitting} 
          clients={clients} 
          products={products} 
          draftOrderItems={draftOrderItems} 
          setDraftOrderItems={setDraftOrderItems} 
          draftPurchaseItems={draftPurchaseItems} 
          setDraftPurchaseItems={setDraftPurchaseItems} 
          productSearch={productSearch} 
          setProductSearch={setProductSearch} 
          suppliers={suppliers}
        />

        <DetailItemModal 
          isOpen={isItemModalOpen} 
          onClose={() => setIsItemModalOpen(false)} 
          onSave={onSaveDetailItem} 
          isSubmitting={isSubmitting} 
          itemModalType={itemModalType} 
          products={products} 
          orderItems={orderItems} 
          selectedOrderId={selectedOrderId} 
        />

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