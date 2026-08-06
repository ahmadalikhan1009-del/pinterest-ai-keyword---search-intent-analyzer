import React from 'react';
import { NavView } from '../types';
import { 
  Search, 
  Settings, 
  Sparkles, 
  ShieldCheck, 
  Key,
  FolderKanban
} from 'lucide-react';

interface HeaderProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  hasCustomKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  searchQuery,
  onSearchChange,
  hasCustomKey
}) => {
  const titles: Record<NavView, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard & Analytics', subtitle: 'Overview of your Pinterest search intent insights' },
    analyzer: { title: 'AI Keyword & Intent Analyzer', subtitle: 'Upload product images to extract 100+ Pinterest keywords' },
    bulk: { title: 'Bulk Product Image Analyzer', subtitle: 'Batch process multiple product images simultaneously' },
    history: { title: 'Saved Analyses History', subtitle: 'Access and export past product image keywords & SEO data' },
    favorites: { title: 'Saved Keyword Vault', subtitle: 'Your bookmarked high-converting Pinterest search terms' },
    templates: { title: 'Prompt Tuning Templates', subtitle: 'Customize AI extraction rules for specific e-commerce niches' },
    settings: { title: 'Settings & API Credentials', subtitle: 'Manage API keys, export formats, and personal workflow preferences' }
  };

  const activeInfo = titles[currentView] || titles.dashboard;

  return (
    <header className="h-16 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md px-6 flex items-center justify-between gap-4 sticky top-0 z-10">
      <div>
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          {activeInfo.title}
        </h2>
        <p className="text-xs text-slate-400 hidden sm:block">{activeInfo.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Global Search */}
        <div className="relative hidden md:block w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search keywords, history..."
            className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/50 transition-colors"
          />
        </div>

        {/* Key Status Pill */}
        <button
          onClick={() => onSelectView('settings')}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
            hasCustomKey
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-[#0c0c0e] border-white/10 text-slate-300 hover:border-white/20'
          }`}
          title="Click to manage API keys"
        >
          <Key className="w-3.5 h-3.5 text-rose-400" />
          <span>{hasCustomKey ? 'Custom Key Active' : 'System Gemini API'}</span>
        </button>

        {/* Settings button */}
        <button
          onClick={() => onSelectView('settings')}
          className="p-2 rounded-lg bg-[#0c0c0e] border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
