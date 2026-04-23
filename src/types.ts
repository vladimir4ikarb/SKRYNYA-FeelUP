import { User } from 'firebase/auth';

export type FirebaseUser = User;

export interface Product {
  id: string;
  name: string;
  category: string;
  size: string;
  color: string;
  heliumVolume?: number;
  costPrice?: number;
  price?: number;
  currentStock?: number;
  minStock?: number;
  isArchived?: boolean;
  isDeleted?: boolean;
  imageUrl?: string;
}

export interface HeliumTank {
  id: string;
  name: string;
  capacityM3: number;
  currentVolumeM3: number;
  lastCalibrationDate?: any;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  instagram: string;
  address: string;
  comment: string;
  isArchived?: boolean;
  isDeleted?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'manager' | 'viewer';
  isActive?: boolean;
}

export interface Order {
  id: string;
  clientId: string;
  date: string;
  status: 'Чернетка' | 'В обробці' | 'Виконано' | 'Скасовано';
  deliveryDate?: string;
  delivery?: string; // legacy
  extraCosts?: number; // Додаткові витрати (таксі тощо)
  managerId?: string;
  manager?: string; // legacy
  comment: string;
  totalAmount?: number;
  isDeleted?: boolean;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  qty: number;
  defect: number;
  price: number;
  total?: number;
  isDeleted?: boolean;
}

export interface Purchase {
  id: string;
  date: string;
  supplierName?: string;
  supplier?: string; // legacy
  deliveryCost?: number; // Доставка від постачальника
  status: 'Чернетка' | 'Обробляється' | 'Оплачено' | 'Борг' | 'Скасовано';
  totalAmount?: number;
  isDeleted?: boolean;
}

export interface Expense {
  id: string;
  date: string;
  category: 'Реклама' | 'Логістика' | 'Оренда' | 'Матеріали' | 'Зарплата' | 'Інше';
  amount: number;
  comment: string;
  relatedId?: string; // ID пов'язаного замовлення чи закупівлі (для синхронізації)
  isDeleted: boolean;
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productId: string;
  qty: number;
  costPrice?: number;
  price?: number; // legacy
  total?: number;
  isDeleted?: boolean;
}

export interface TechnicalSpec {
  id: string;
  size: string;
  heliumVolume: number;
}
