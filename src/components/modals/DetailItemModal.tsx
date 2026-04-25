import React from 'react';
import { Modal } from '../common/Modal';
import { DetailItemForm } from '../forms/DetailItemForm';

interface DetailItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  itemModalType: 'order' | 'purchase' | null;
  products: any[];
  orderItems: any[];
  selectedOrderId: string | null;
}

export const DetailItemModal: React.FC<DetailItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isSubmitting,
  itemModalType,
  products,
  orderItems,
  selectedOrderId
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Додати позицію">
      <form onSubmit={onSave} className="space-y-8">
        <DetailItemForm 
          itemModalType={itemModalType} 
          products={products} 
          orderItems={orderItems} 
          selectedOrderId={selectedOrderId} 
        />
        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full btn-primary text-xl py-5 disabled:opacity-50"
        >
          {isSubmitting ? 'Збереження...' : 'Додати'}
        </button>
      </form>
    </Modal>
  );
};
