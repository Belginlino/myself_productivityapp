import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Sheet Modal */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300, duration: 0.25 }}
            className="relative w-full max-w-lg bg-[#23324A] text-white rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
          >
            {/* Drag Handle Indicator */}
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-3 mb-1" />

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
                <h3 className="text-lg font-semibold text-white tracking-wide">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
