import { User } from 'firebase/auth';

export type FirebaseUser = User;

export interface Product {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  sku?: string;
  skuId?: number;
  foilType?: 'Цифра' | 'Фігура' | 'Персонаж' | 'Напис' | '3D / Обʼємна';
  foilLabel?: string;
  producer?: string;
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
  latexSeries?: string;
  description?: string;
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
  role: 'admin' | 'manager' | 'viewer' | 'none';
  isActive?: boolean;
}

export interface Order {
  id: string;
  clientId: string;
  date: string;
  status: 'Чернетка' | 'Виконано' | 'Скасовано';
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
  price: number;
  total?: number;
  isDeleted?: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  isArchived?: boolean;
  isDeleted?: boolean;
}

export interface Purchase {
  id: string;
  date: string;
  supplierName?: string;
  supplier?: string; // legacy
  deliveryCost?: number; // Доставка від постачальника
  status: 'Чернетка' | 'Проведено' | 'Скасовано';
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

export interface WriteOff {
  id: string;
  date: string;
  reason: 'Брак' | 'Тест/Навчання' | 'Внутрішнє використання' | 'Корекція' | 'Інше';
  comment?: string;
  status: 'Чернетка' | 'Проведено' | 'Скасовано';
  heliumVolume?: number;
  isDeleted: boolean;
}

export interface WriteOffItem {
  id: string;
  writeOffId: string;
  productId: string;
  qty: number;
  isDeleted: boolean;
}
