import React, { useState, useEffect } from 'react';
import { Mic, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from './Modal';
import { audioRecorderService } from '../../services/audioRecorderService';

interface VoicePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGranted?: () => void;
}

export const VoicePermissionModal: React.FC<VoicePermissionModalProps> = ({
  isOpen,
  onClose,
  onGranted,
}) => {
  const [status, setStatus] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('prompt');
  const [isRequesting, setIsRequesting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const checkStatus = async () => {
    const current = await audioRecorderService.checkPermissionStatus();
    setStatus(current);
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
      setErrorMsg(null);
    }
  }, [isOpen]);

  const handleEnablePermission = async () => {
    setIsRequesting(true);
    setErrorMsg(null);
    try {
      const granted = await audioRecorderService.requestPermission();
      if (granted) {
        setStatus('granted');
        if (onGranted) {
          onGranted();
        }
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setStatus('denied');
        setErrorMsg('Microphone access was denied. Please allow microphone permission in your device settings.');
      }
    } catch (err: any) {
      setStatus('denied');
      setErrorMsg(err.message || 'Unable to request voice permission.');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Voice Permission" maxWidth="md">
      <div className="space-y-6 text-center text-white">
        {/* Header Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[#1B2435] flex items-center justify-center border border-white/10 shadow-inner">
          {status === 'granted' ? (
            <CheckCircle2 className="w-8 h-8 text-[#76E56A] animate-bounce" />
          ) : status === 'denied' ? (
            <AlertCircle className="w-8 h-8 text-[#FF5D73]" />
          ) : (
            <Mic className="w-8 h-8 text-[#C9F48A] animate-pulse" />
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h4 className="text-lg font-bold text-white">
            {status === 'granted'
              ? 'Voice Permission Granted!'
              : 'Enable Microphone Access'}
          </h4>
          <p className="text-xs sm:text-sm text-[#A8B3C7] leading-relaxed max-w-sm mx-auto">
            {status === 'granted'
              ? 'Microphone access is enabled. You can now record voice notes and speech tasks anytime.'
              : 'To record WhatsApp-style audio notes and voice tasks on your device, please enable Voice Permission.'}
          </p>
        </div>

        {/* Permission Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1B2435] border border-white/10 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#C9F48A]" />
          <span className="text-[#A8B3C7]">Status:</span>
          <span
            className={`font-bold capitalize ${
              status === 'granted'
                ? 'text-[#76E56A]'
                : status === 'denied'
                ? 'text-[#FF5D73]'
                : 'text-[#37C7F4]'
            }`}
          >
            {status === 'prompt' ? 'Permission Required' : status}
          </span>
        </div>

        {errorMsg && <p className="text-xs text-[#FF5D73] font-bold max-w-xs mx-auto">{errorMsg}</p>}

        {/* Action Button */}
        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-[#A8B3C7] hover:text-white text-xs font-bold transition-colors"
          >
            Cancel
          </button>

          {status !== 'granted' && (
            <button
              onClick={handleEnablePermission}
              disabled={isRequesting}
              className="px-6 py-3 rounded-2xl bg-[#C9F48A] text-[#1B2435] font-bold text-xs shadow-glow-accent hover:bg-[#b1e06d] transition-colors disabled:opacity-50"
            >
              {isRequesting ? 'Requesting...' : 'Allow Microphone'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
