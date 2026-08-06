import React, { useState } from 'react';
import { UserSettings, PinterestAccount } from '../types';
import { Settings, Key, Trash2, Check, Link, Plus, User, Eye, EyeOff } from 'lucide-react';

interface SettingsModalProps {
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
  onClearAllData: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
  onClearAllData,
  onShowToast
}) => {
  const [apiKey, setApiKey] = useState(settings.customApiKey || '');
  const [themeAccent, setThemeAccent] = useState(settings.themeAccent || 'emerald');
  const [exportFormat, setExportFormat] = useState(settings.defaultExportFormat || 'csv');
  const [autoSave, setAutoSave] = useState(settings.autoSaveHistory ?? true);
  const [accounts, setAccounts] = useState<PinterestAccount[]>(settings.pinterestAccounts || []);
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      customApiKey: apiKey.trim(),
      pinterestAccounts: accounts,
      themeAccent,
      defaultExportFormat: exportFormat as any,
      autoSaveHistory: autoSave
    });
    onShowToast('Settings saved successfully!', 'success');
  };

  const addAccount = () => {
    const newAcc: PinterestAccount = {
      id: `acc-${Date.now()}`,
      name: `Account ${accounts.length + 1}`,
      accessToken: ''
    };
    setAccounts(prev => [...prev, newAcc]);
  };

  const removeAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const updateAccount = (id: string, field: 'name' | 'accessToken', value: string) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const toggleShowToken = (id: string) => {
    setShowTokens(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl space-y-6">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-rose-400" />
            Application Settings & Personal Credentials
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Manage your API keys, Pinterest accounts, and preferences</p>
        </div>

        {/* Gemini API Key */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-bold text-white">Google Gemini API Key (Optional Override)</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            By default, the application uses the system Gemini API key. If you prefer to use your own, paste it below.
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Paste your GEMINI_API_KEY here..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
          />
        </div>

        {/* Pinterest Multi-Account Manager */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold text-white">Pinterest Accounts</span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full">
                {accounts.length} connected
              </span>
            </div>
            <button
              onClick={addAccount}
              className="flex items-center gap-1.5 text-[11px] bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Account
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Add one or more Pinterest accounts. Get your Access Token from the{' '}
            <a href="https://developers.pinterest.com/" target="_blank" rel="noreferrer" className="text-rose-400 underline hover:text-rose-300">
              Pinterest Developer Portal
            </a>.
          </p>

          {accounts.length === 0 && (
            <div className="border border-dashed border-slate-700 rounded-xl p-6 text-center">
              <User className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No accounts added yet.</p>
              <p className="text-[10px] text-slate-600 mt-1">Click "Add Account" to connect your Pinterest account.</p>
            </div>
          )}

          <div className="space-y-3">
            {accounts.map((acc, idx) => (
              <div key={acc.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-[10px] font-bold text-rose-400">
                      {idx + 1}
                    </div>
                    <span className="text-xs text-slate-300 font-medium">Pinterest Account {idx + 1}</span>
                    {acc.accessToken && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Token saved
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeAccount(acc.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1 rounded-lg hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Account Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Account Label</label>
                  <input
                    type="text"
                    value={acc.name}
                    onChange={(e) => updateAccount(acc.id, 'name', e.target.value)}
                    placeholder="e.g. Shop Account, Personal Account..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
                  />
                </div>

                {/* Access Token */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Access Token</label>
                  <div className="relative">
                    <input
                      type={showTokens[acc.id] ? 'text' : 'password'}
                      value={acc.accessToken}
                      onChange={(e) => updateAccount(acc.id, 'accessToken', e.target.value)}
                      placeholder="Paste Pinterest Access Token..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 pr-9 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
                    />
                    <button
                      onClick={() => toggleShowToken(acc.id)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showTokens[acc.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <label className="text-xs font-bold text-white block">Default Export Format</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
            >
              <option value="csv">CSV (Spreadsheet)</option>
              <option value="json">JSON (Structured data)</option>
              <option value="txt">TXT (Plain list)</option>
              <option value="md">Markdown (.md)</option>
            </select>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <label className="text-xs font-bold text-white block">Auto-Save Analyses to Local Storage</label>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-0"
              />
              <span className="text-xs text-slate-300">Save history automatically</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-800">
          <button
            onClick={onClearAllData}
            className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-semibold border border-rose-800/60 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Local History & Reset
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-950/40"
          >
            <Check className="w-4 h-4" /> Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
