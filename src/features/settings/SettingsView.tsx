import React, { useState } from 'react';
import { Settings, User, Moon, Sun, Download, Upload, Cloud, ShieldCheck, Check, Trash2, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { FirebaseAuthModal } from '../../components/common/FirebaseAuthModal';
import { useAppStore } from '../../store/useAppStore';
import { auth } from '../../firebase/config';
import { updateProfile as updateFirebaseProfile } from 'firebase/auth';
import { pushAllDataToCloud } from '../../firebase/syncService';

export const SettingsView: React.FC = () => {
  const { profile, settings, updateProfile, updateSettings, setTheme, exportDataJSON, importDataJSON, eraseAllData } = useAppStore();

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [photoURL, setPhotoURL] = useState(profile.photoURL || '');
  const [importText, setImportText] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importError, setImportError] = useState(false);
  const [eraseConfirm, setEraseConfirm] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
  ];

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email, photoURL });
    if (auth.currentUser) {
      updateFirebaseProfile(auth.currentUser, {
        displayName: name,
        photoURL: photoURL || null,
      }).catch((err) => console.warn('Firebase profile update warning:', err));
    }
    if (profile.uid && profile.uid !== 'local-user-1') {
      pushAllDataToCloud(profile.uid);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Please choose an image file under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoURL(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `myself_os_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;
    const ok = importDataJSON(importText);
    if (!ok) {
      setImportError(true);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          Settings & Profile Photo
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage user profile, profile photo, themes, JSON backups & cloud sync.
        </p>
      </div>

      {/* User Profile Card */}
      <Card className="p-6">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-500" /> User Profile & Avatar Photo
        </h3>

        <form onSubmit={handleProfileSave} className="space-y-6">
          {/* Profile Photo Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            {/* Avatar Preview */}
            <div className="relative group">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt="Profile Preview"
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-500/30 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white font-extrabold text-2xl flex items-center justify-center ring-4 ring-indigo-500/20 shadow-md">
                  {(name || email || 'U')[0]?.toUpperCase()}
                </div>
              )}
              {photoURL && (
                <button
                  type="button"
                  onClick={() => setPhotoURL('')}
                  className="absolute -top-1 -right-1 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 shadow transition-colors"
                  title="Remove Profile Photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Photo Upload & Preset Controls */}
            <div className="flex-1 space-y-3 w-full">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Upload Photo from Device
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoFileChange}
                  className="block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Or Paste Photo Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Preset Avatars */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Or Select Preset Avatar
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {presetAvatars.map((url, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setPhotoURL(url)}
                      className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all shrink-0 ${
                        photoURL === url
                          ? 'border-indigo-600 ring-2 ring-indigo-500/40 scale-105'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveSuccess && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" /> Profile updated successfully!
              </span>
            )}
            <div className="ml-auto">
              <Button type="submit" variant="primary">
                Save Profile
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Appearance Theme Selector */}
      <Card className="p-6">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500" /> Theme & Appearance
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              settings.theme === 'light'
                ? 'bg-indigo-50 border-indigo-600 dark:bg-slate-800 text-indigo-600 font-bold'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Sun className="w-6 h-6 mb-2 text-amber-500" />
            <h4 className="text-xs font-bold">Light Theme</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Clean white background</p>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              settings.theme === 'dark'
                ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-md'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Moon className="w-6 h-6 mb-2 text-indigo-400" />
            <h4 className="text-xs font-bold">Dark Theme</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Sleek slate mode</p>
          </button>
        </div>
      </Card>

      {/* Backup, Restore & Firebase Sync */}
      <Card className="p-6 space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-emerald-500" /> Firebase Cloud Sync & Data Backup
          </span>
          {settings.firebaseConnected && profile.uid && profile.uid !== 'local-user-1' ? (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Cloud Connected
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold">
              Offline Mode
            </span>
          )}
        </h3>

        {/* Firebase Cloud Card */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-500" /> Firebase Authentication & Cloud Storage
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {settings.firebaseConnected && profile.uid && profile.uid !== 'local-user-1'
                ? `Logged in as ${profile.email || profile.name}. Data synced to Cloud Firestore.`
                : 'Connect your Firebase account to sync tasks, habits, and notes across desktop & mobile.'}
            </p>
          </div>

          <Button
            variant="primary"
            icon={<Cloud className="w-4 h-4" />}
            onClick={() => setIsAuthModalOpen(true)}
            className="shrink-0 text-xs"
          >
            {settings.firebaseConnected && profile.uid && profile.uid !== 'local-user-1'
              ? 'Manage Cloud Sync'
              : 'Sign In / Connect Firebase'}
          </Button>
        </div>

        {/* Offline Backup Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-emerald-500" /> Local Offline Backup
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Download a complete JSON file of all your data for manual local backup.
            </p>
          </div>

          <Button variant="outline" icon={<Download className="w-4 h-4" />} onClick={handleExport}>
            Export JSON Backup
          </Button>
        </div>

        {/* Restore Section */}
        <form onSubmit={handleImportSubmit} className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Restore Data from JSON</label>
          <textarea
            rows={3}
            placeholder="Paste your JSON backup string here..."
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
          />
          {importError && (
            <p className="text-xs text-red-500 font-semibold">Invalid JSON format provided. Please check backup data.</p>
          )}
          <div className="flex justify-end">
            <Button type="submit" variant="outline" icon={<Upload className="w-4 h-4" />}>
              Import & Restore
            </Button>
          </div>
        </form>
      </Card>

      {/* Danger Zone — Erase All Data */}
      <Card className="p-6 border border-red-200 dark:border-red-900/50">
        <h3 className="font-bold text-sm text-red-600 dark:text-red-400 flex items-center gap-2 mb-1">
          <AlertTriangle className="w-4 h-4" /> Danger Zone
        </h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">
          Permanently erase all local app data — tasks, habits, journals, goals, notes, and settings.
          This action cannot be undone.
        </p>

        {!eraseConfirm ? (
          <Button
            variant="outline"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => setEraseConfirm(true)}
            className="border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
          >
            Erase All Data
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800">
            <p className="text-xs font-semibold text-red-700 dark:text-red-300 flex-1">
              Are you sure? All data will be permanently deleted and the app will reset.
            </p>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                onClick={() => setEraseConfirm(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <button
                onClick={eraseAllData}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Yes, Erase Everything
              </button>
            </div>
          </div>
        )}
      </Card>

      <FirebaseAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};
