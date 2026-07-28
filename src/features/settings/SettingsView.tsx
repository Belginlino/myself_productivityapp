import React, { useState } from 'react';
import { Settings, User, Moon, Sun, Download, Upload, Cloud, ShieldCheck, Check, Trash2, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAppStore } from '../../store/useAppStore';

export const SettingsView: React.FC = () => {
  const { profile, settings, updateProfile, updateSettings, setTheme, exportDataJSON, importDataJSON, eraseAllData } = useAppStore();

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [importText, setImportText] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importError, setImportError] = useState(false);
  const [eraseConfirm, setEraseConfirm] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
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
          Settings & Data Backup
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage user profile, application themes, JSON backups & cloud sync.
        </p>
      </div>

      {/* User Profile Card */}
      <Card className="p-6">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-500" /> User Profile Information
        </h3>

        <form onSubmit={handleProfileSave} className="space-y-4">
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
                <Check className="w-4 h-4" /> Profile updated!
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
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Cloud className="w-4 h-4 text-emerald-500" /> Backup, Restore & Firebase Cloud Sync
        </h3>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Offline Local Storage Active
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              All your tasks, habits, notes, routines, and goals are saved locally with automatic persistent backup.
            </p>
          </div>

          <Button variant="primary" icon={<Download className="w-4 h-4" />} onClick={handleExport}>
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
    </div>
  );
};
