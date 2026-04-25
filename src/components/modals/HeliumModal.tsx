import React from 'react';
import { AlertCircle } from 'lucide-react';
import { db, collection, addDoc, updateDoc, doc, serverTimestamp } from '../../firebase';
import { HeliumTank } from '../../types';
import { Modal } from '../common/Modal';
import { logAction } from '../../services/loggerService';

interface HeliumModalProps {
  isOpen: boolean;
  onClose: () => void;
  heliumTanks: HeliumTank[];
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
  user: any;
}

export const HeliumModal: React.FC<HeliumModalProps> = ({ 
  isOpen, 
  onClose, 
  heliumTanks, 
  isSubmitting, 
  setIsSubmitting,
  user
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const currentVolumeM3 = Number(formData.get('currentVolumeM3'));
    const capacityM3 = Number(formData.get('capacityM3'));
    const name = formData.get('name') as string;

    try {
      setIsSubmitting(true);
      if (heliumTanks.length > 0) {
        await updateDoc(doc(db, 'helium', heliumTanks[0].id), { 
          currentVolumeM3, 
          capacityM3, 
          name, 
          lastCalibrationDate: serverTimestamp() 
        });
      } else {
        await addDoc(collection(db, 'helium'), { 
          currentVolumeM3, 
          capacityM3, 
          name, 
          lastCalibrationDate: serverTimestamp(), 
          isDeleted: false 
        });
      }
      onClose();
      logAction(user, 'HELIUM_CALIBRATION', { currentVolumeM3, capacityM3 });
    } catch (err) { 
      console.error(err);
      alert("Помилка при збереженні даних гелію"); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Колібрування та облік гелію">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="text-sm font-bold text-text-muted block mb-2">Назва балона</label>
            <input name="name" defaultValue={heliumTanks[0]?.name || "Основний 40л"} required className="input-field" />
          </div>
          <div>
            <label className="text-sm font-bold text-text-muted block mb-2">Об'єм балона (м³)</label>
            <input name="capacityM3" type="number" step="any" defaultValue={heliumTanks[0]?.capacityM3 || 6.0} required className="input-field" />
          </div>
          <div>
            <label className="text-sm font-bold text-text-muted block mb-2">Поточний залишок (м³)</label>
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
  );
};
