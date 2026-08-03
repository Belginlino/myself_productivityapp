import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Lock, KeyRound, AlertCircle, Delete } from 'lucide-react';
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
    <div className="fixed inset-0 z-[99999] bg-slate-950/95 backdrop-blur-3xl text-white flex flex-col items-center justify-center p-6 animate-fadeIn select-none">
      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-6">
        {/* App Icon / Lock Icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center shadow-2xl backdrop-blur-xl">
            <Lock className="w-10 h-10 text-white animate-pulse" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-black tracking-tight text-white">Myself App Locked</h2>
          <p className="text-xs text-neutral-400 mt-1 font-medium">
            Enter your 4-digit security passcode to proceed
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex items-center gap-4 py-2">
          {[0, 1, 2, 3].map((idx) => {
            const filled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  filled
                    ? 'bg-white border-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.8)]'
                    : 'border-white/30 bg-transparent'
                }`}
              />
            );
          })}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="px-4 py-2 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs font-semibold flex items-center gap-2 animate-bounce">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-xs pt-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/10 font-bold text-xl flex items-center justify-center transition-all shadow-md mx-auto active:scale-90"
            >
              {num}
            </button>
          ))}
          <div className="w-16 h-16" />
          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/10 font-bold text-xl flex items-center justify-center transition-all shadow-md mx-auto active:scale-90"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white flex items-center justify-center transition-all mx-auto active:scale-90"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
