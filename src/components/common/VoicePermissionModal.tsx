import React, { useState, useEffect } from 'react';
import { Mic, ShieldCheck, AlertCircle, Settings, CheckCircle2 } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
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
      <div className="space-y-6 text-center">
        {/* Header Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center border border-slate-200 dark:border-white/15 shadow-inner">
          {status === 'granted' ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-500 animate-bounce" />
          ) : status === 'denied' ? (
            <AlertCircle className="w-8 h-8 text-red-500" />
          ) : (
            <Mic className="w-8 h-8 text-slate-900 dark:text-white animate-pulse" />
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h4 className="text-lg font-black text-slate-900 dark:text-white">
            {status === 'granted'
              ? 'Voice Permission Granted!'
              : 'Enable Microphone Access'}
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 leading-relaxed max-w-sm mx-auto">
            {status === 'granted'
              ? 'Microphone access is enabled. You can now record voice notes and WhatsApp messages anytime.'
              : 'To record WhatsApp-style audio notes and voice tasks on your mobile device, please enable Voice Permission.'}
          </p>
        </div>

        {/* Permission Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-slate-700 dark:text-neutral-300" />
          <span className="text-slate-500 dark:text-neutral-400">Mobile Status:</span>
          <span
            className={`font-bold capitalize ${
              status === 'granted'
                ? 'text-emerald-500'
                : status === 'denied'
                ? 'text-red-500'
                : 'text-amber-500'
            }`}
          >
            {status === 'prompt' ? 'Permission Required' : status}
          </span>
        </div>

        {/* Instructions if Denied */}
        {status === 'denied' && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-left text-xs text-red-600 dark:text-red-300 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <Settings className="w-4 h-4" />
              <span>How to enable on Mobile Device:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
              <li>Open <strong>Android Settings</strong> on your phone</li>
              <li>Go to <strong>Apps</strong> &gt; <strong>Myself</strong> (or your Mobile Browser)</li>
              <li>Tap <strong>Permissions</strong> &gt; <strong>Microphone</strong></li>
              <li>Select <strong>Allow</strong> and return to the app</li>
            </ol>
          </div>
        )}

        {errorMsg && (
          <p className="text-xs text-red-500 font-medium">{errorMsg}</p>
        )}

        {/* Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {status !== 'granted' && (
            <Button
              variant="primary"
              onClick={handleEnablePermission}
              disabled={isRequesting}
              icon={<Mic className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              {isRequesting ? 'Requesting...' : 'Enable Voice Permission'}
            </Button>
          )}

          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full sm:w-auto text-xs"
          >
            {status === 'granted' ? 'Close' : 'Cancel / Later'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
