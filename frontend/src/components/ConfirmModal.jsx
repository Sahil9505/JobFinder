import React from 'react';

const ConfirmModal = ({ open, title = 'Confirm', message = 'Are you sure?', onConfirm, onCancel, confirmText = 'Yes', cancelText = 'No' }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-dark-850 rounded-2xl shadow-2xl border border-white/10 w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header with icon */}
        <div className="px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
              <p className="text-base text-gray-300 leading-relaxed">{message}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-6 py-4 bg-dark-900/50 flex justify-end gap-3">
          <button 
            className="px-5 py-2.5 rounded-lg font-semibold text-base text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-200"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className="relative px-5 py-2.5 rounded-lg font-bold text-base text-white overflow-hidden group"
            onClick={onConfirm}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 group-hover:from-red-500 group-hover:to-red-600 transition-all duration-200" />
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
            <span className="relative">{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
