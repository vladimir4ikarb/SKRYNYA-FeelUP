import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Papa from 'papaparse';
import { Product, Client, Order, OrderItem, Purchase, PurchaseItem, TechnicalSpec } from '../types';
import { logAction } from './loggerService';
import { User } from 'firebase/auth';
import { collection, addDoc, db } from '../firebase';

import { PRODUCT_CATEGORIES } from '../constants/productCategories';

const normalizeCategory = (cat: string) => {
  const upper = (cat || '').trim().toUpperCase();
  const found = PRODUCT_CATEGORIES.find(c => c.toUpperCase() === upper);
  return found || "ІНШЕ";
};

export const exportData = async (
  user: User | null,
  products: Product[],
  clients: Client[],
  orders: Order[],
  orderItems: OrderItem[],
  purchases: Purchase[],
  purchaseItems: PurchaseItem[],
  techSpecs: TechnicalSpec[]
) => {
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
  logAction(user, 'BACKUP_EXPORT', { timestamp: new Date().toISOString() });
};

export const exportToCSV = (
  user: User | null,
  type: 'orders' | 'inventory',
  orders: Order[],
  clients: Client[],
  products: Product[],
  orderTotals: Record<string, number>,
  inventory: Record<string, number>
) => {
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
  logAction(user, 'CSV_EXPORT', { type, timestamp: new Date().toISOString() });
};

export const generatePDF = async (
  user: User | null,
  orderId: string,
  orders: Order[],
  clients: Client[],
  products: Product[],
  orderItems: OrderItem[],
  orderTotals: Record<string, number>
) => {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  const client = clients.find(c => c.id === order.clientId);
  const items = orderItems.filter(oi => oi.orderId === orderId);
  const total = orderTotals[orderId] || 0;

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
  
  logAction(user, 'PDF_EXPORT', { orderId, timestamp: new Date().toISOString() });
};

export const importData = async (e: React.ChangeEvent<HTMLInputElement>, user: User | null, setIsSubmitting: (v: boolean) => void) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  setIsSubmitting(true);
  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const data = JSON.parse(event.target?.result as string);
      const collectionsNames = ['products', 'clients', 'orders', 'orderItems', 'purchases', 'purchaseItems', 'techSpecs'];
      
      for (const colName of collectionsNames) {
        const items = data[colName === 'techSpecs' ? 'techSpecs' : colName];
        if (Array.isArray(items)) {
          for (const item of items) {
            const { id, ...rest } = item;
            await addDoc(collection(db, colName === 'techSpecs' ? 'technicalSpecs' : colName), { ...rest, isDeleted: false });
          }
        }
      }
      logAction(user, 'DATA_IMPORT', { timestamp: new Date().toISOString() });
    } catch (err) {
      console.error("Import failed", err);
    } finally {
      setIsSubmitting(true); // Wait, should be false
      setIsSubmitting(false);
      if (e.target) e.target.value = ''; // Reset input
    }
  };
  reader.readAsText(file);
};

export const importProductsFromCSV = (
  e: React.ChangeEvent<HTMLInputElement>,
  user: User | null,
  setIsSubmitting: (v: boolean) => void
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setIsSubmitting(true);
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      try {
        const batch = results.data;
        for (const row of batch as any[]) {
          const product: Partial<Product> = {
            name: row['Назва'] || row['name'] || '',
            category: normalizeCategory(row['Категорія'] || row['category'] || 'ІНШЕ'),
            size: row['Розмір'] || row['size'] || '',
            color: row['Колір'] || row['color'] || '',
            costPrice: Number(row['Собівартість'] || row['costPrice'] || 0),
            heliumVolume: Number(row['Об\'єм гелію'] || row['heliumVolume'] || row['helium'] || 0),
            minStock: Number(row['Мін. залишок'] || row['minStock'] || 5),
            currentStock: Number(row['Початковий залишок'] || row['currentStock'] || 0),
            isArchived: false,
            isDeleted: false
          };
          if (product.name) {
            await addDoc(collection(db, 'products'), product);
          }
        }
        logAction(user, 'PRODUCT_IMPORT_CSV', { count: batch.length, timestamp: new Date().toISOString() });
        alert(`Успішно імпортовано ${batch.length} товарів.`);
      } catch (err) {
        console.error("CSV Import failed", err);
        alert("Помилка при імпорті CSV. Перевірте формат файлу.");
      } finally {
        setIsSubmitting(false);
        if (e.target) e.target.value = '';
      }
    },
    error: (err) => {
      console.error("Parse error", err);
      setIsSubmitting(false);
      alert("Помилка при читанні CSV файлу.");
    }
  });
};
