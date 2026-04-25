import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose} 
          className="absolute inset-0 bg-sidebar/40 backdrop-blur-md" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-card w-full max-w-3xl rounded-t-[32px] lg:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] lg:max-h-[90vh] border border-border mt-auto lg:mt-0"
        >
          <div className="px-4 py-3 lg:px-8 lg:py-6 border-b border-border flex items-center justify-between shrink-0 bg-background/50">
            <h3 className="text-base lg:text-xl font-black text-text-main tracking-tight">{title}</h3>
            <button onClick={onClose} className="p-1.5 lg:p-2.5 hover:bg-card/10 rounded-xl transition-all text-text-muted">
              <X className="w-5 h-5 lg:w-5.5 lg:h-5.5" />
            </button>
          </div>
          <div className="p-4 lg:p-8 overflow-y-auto custom-scrollbar flex-1 bg-card">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
