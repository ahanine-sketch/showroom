import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  isDestructive = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="mb-6">
          <h3 className="text-xl font-headline font-semibold text-stone-900 mb-2">{title}</h3>
          <p className="text-[14px] text-stone-500">{message}</p>
        </div>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-[13px] font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-[13px] font-semibold text-white rounded-lg transition-colors ${
              isDestructive 
                ? 'bg-red-500 hover:bg-red-600 shadow-[0_4px_12px_rgba(239,68,68,0.2)]' 
                : 'bg-yellow-500 hover:bg-yellow-600 shadow-[0_4px_12px_rgba(234,179,8,0.2)]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
