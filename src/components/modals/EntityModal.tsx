import React from 'react';
import { Modal } from '../common/Modal';
import { ProductForm } from '../forms/ProductForm';
import { OrderForm } from '../forms/OrderForm';
import { ClientForm } from '../forms/ClientForm';
import { SpecForm } from '../forms/SpecForm';
import { PurchaseForm } from '../forms/PurchaseForm';
import { WriteOffForm } from '../forms/WriteOffForm';
import { ExpenseForm } from '../forms/ExpenseForm';
import { UserForm } from '../forms/UserForm';

interface EntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  editingItem: any;
  onSave: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  clients: any[];
  products: any[];
  draftOrderItems: any[];
  setDraftOrderItems: (items: any[]) => void;
  draftPurchaseItems: any[];
  setDraftPurchaseItems: (items: any[]) => void;
  productSearch: string;
  setProductSearch: (s: string) => void;
  suppliers: any[];
}

export const EntityModal: React.FC<EntityModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  editingItem,
  onSave,
  isSubmitting,
  clients,
  products,
  draftOrderItems,
  setDraftOrderItems,
  draftPurchaseItems,
  setDraftPurchaseItems,
  productSearch,
  setProductSearch,
  suppliers,
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editingItem ? 'Редагувати' : 'Додати новий запис'}
    >
      <form onSubmit={onSave} className="space-y-4 lg:space-y-8 relative pb-20 lg:pb-0">
        <div className="space-y-4 lg:space-y-8">
          {activeTab === 'products' && <ProductForm editingItem={editingItem} products={products} />}
          {activeTab === 'sales' && (
            <OrderForm 
              editingItem={editingItem} 
              clients={clients} 
              products={products} 
              draftOrderItems={draftOrderItems} 
              setDraftOrderItems={setDraftOrderItems} 
              productSearch={productSearch} 
              setProductSearch={setProductSearch} 
            />
          )}
          {activeTab === 'clients' && <ClientForm editingItem={editingItem} />}
          {activeTab === 'specs' && <SpecForm editingItem={editingItem} />}
          {activeTab === 'purchases' && (
            <PurchaseForm 
              editingItem={editingItem} 
              products={products} 
              suppliers={suppliers}
              draftPurchaseItems={draftPurchaseItems} 
              setDraftPurchaseItems={setDraftPurchaseItems} 
              productSearch={productSearch} 
              setProductSearch={setProductSearch} 
            />
          )}
          {activeTab === 'write-offs' && (
            <WriteOffForm
              editingItem={editingItem}
              products={products}
              draftItems={draftPurchaseItems}
              setDraftItems={setDraftPurchaseItems}
              productSearch={productSearch}
              setProductSearch={setProductSearch}
            />
          )}
          {activeTab === 'expenses' && <ExpenseForm editingItem={editingItem} />}
          {activeTab === 'admin' && <UserForm editingItem={editingItem} />}
        </div>
        
        <div className="sticky bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md pt-4 pb-2 lg:pb-4 border-t border-border mt-auto z-50">
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full btn-primary text-xs lg:text-sm py-2.5 lg:py-3 disabled:opacity-50 shadow-md font-bold uppercase tracking-widest"
          >
            {isSubmitting ? 'Збереження...' : 'Зберегти'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
