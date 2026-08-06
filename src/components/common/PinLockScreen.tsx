import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, AlertCircle, Delete } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const PinLockScreen: React.FC = () => {
  const { settings, unlockApp } = useAppStore();
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!settings.pinLockEnabled || !settings.isAppLocked) {
    return null;
  }

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        setTimeout(() => {
          const success = unlockApp(nextPin);
          if (!success) {
            setErrorMsg('Incorrect Passcode');
            setPin('');
          }
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setErrorMsg('');
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] bg-slate-950/95 backdrop-blur-3xl text-white flex flex-col items-center justify-center p-6 select-none"
    >
      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-7">
        {/* App Logo */}
        <div className="relative">
          <img src="/logo.jpg" alt="Tempo App Logo" className="w-20 h-20 rounded-3xl object-cover border-2 border-white/20 shadow-2xl" />
          <div className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-full bg-slate-900 border border-white/20 shadow-md text-amber-400">
            <Lock className="w-4 h-4" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">Tempo App Locked</h2>
          <p className="text-xs text-neutral-400 mt-1.5 font-medium">
            Enter your 4-digit security passcode to proceed
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex items-center gap-4 py-2">
          {[0, 1, 2, 3].map((idx) => {
            const filled = pin.length > idx;
            return (
              <motion.div
                key={idx}
                animate={{ scale: filled ? 1.2 : 1 }}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  filled
                    ? 'bg-white border-white shadow-[0_0_15px_rgba(255,255,255,0.9)]'
                    : 'border-white/30 bg-transparent'
                }`}
              />
            );
          })}
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="px-4 py-2 rounded-2xl bg-red-950/60 border border-red-800 text-red-300 text-xs font-semibold flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-xs pt-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <motion.button
              key={num}
              whileTap={{ scale: 0.88 }}
              onClick={() => handleKeyPress(num)}
              className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 font-black text-xl flex items-center justify-center transition-all shadow-md mx-auto"
            >
              {num}
            </motion.button>
          ))}
          <div className="w-16 h-16" />
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 font-black text-xl flex items-center justify-center transition-all shadow-md mx-auto"
          >
            0
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={handleDelete}
            className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white flex items-center justify-center transition-all mx-auto"
          >
            <Delete className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>,
    document.body
  );
};
